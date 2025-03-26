import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import {
  CloudinaryResource,
  CloudinaryResponse,
  CloudinaryResourceOptions,
  CloudinarySearchOptions,
} from './interfaces/cloudinary.interfaces';
import JSZip from 'jszip';
import axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload a buffer to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    filename: string,
    options: any = {},
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename.split('.')[0], // Remove extension for public_id
          ...options,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Upload a file to Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    userId?: string,
    options: any = {},
  ): Promise<any> {
    // If userId is provided, add it to the folder path
    const targetFolder = userId ? `${folder}/user_${userId}` : folder;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          ...options,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<CloudinaryResponse> {
    try {
      // Ensure the publicId includes the folder name if not already present
      const fullPublicId = publicId.startsWith('images/')
        ? publicId
        : `images/${publicId}`;
      console.log('Deleting from Cloudinary with publicId:', fullPublicId); // Debug log

      const result = await cloudinary.uploader.destroy(fullPublicId);
      console.log('Cloudinary delete result:', result); // Debug log

      return result;
    } catch (error) {
      console.error('Error in deleteFile:', error);
      throw error;
    }
  }

  /**
   * Get a Cloudinary URL for a public ID
   */
  getUrl(publicId: string, options: any = {}): string {
    return cloudinary.url(publicId, { secure: true, ...options });
  }

  /**
   * Search for resources in Cloudinary
   */
  async search(query: string, options: any = {}): Promise<any> {
    return cloudinary.search
      .expression(query)
      .with_field('tags')
      .max_results(options.maxResults || 100)
      .execute();
  }

  /**
   * Get resources from a specific folder, including user-specific and default resources
   * @param baseFolder The base folder type (logos, typography, presets, etc.)
   * @param userId The user ID to get user-specific resources
   * @param options Additional options for the request
   * @returns Combined resources from user folder and defaults folder
   */
  async getResourcesByBaseFolder(
    baseFolder: string,
    userId?: string,
    options: CloudinaryResourceOptions = {},
  ): Promise<CloudinaryResponse> {
    const { includeDefaults = true, max_results = 100, next_cursor } = options;
    let allResources: CloudinaryResponse = { resources: [] };

    // If userId is provided, get user-specific resources
    if (userId) {
      const userFolder = `users/${userId}/${baseFolder}`;
      try {
        const userResources = await this.getResourcesByFolder(userFolder, {
          max_results,
          next_cursor,
        });
        allResources.resources = [
          ...allResources.resources,
          ...userResources.resources,
        ];
        allResources.next_cursor = userResources.next_cursor;
      } catch (error) {
        console.warn(`No resources found in user folder: ${userFolder}`);
      }
    }

    // If includeDefaults is true, get default resources
    if (includeDefaults) {
      const defaultsFolder = `${baseFolder}/defaults`;
      try {
        const defaultResources = await this.getResourcesByFolder(
          defaultsFolder,
          { max_results: 100 }, // Always fetch all defaults
        );

        // Tag default resources
        const defaultResourcesWithTags = defaultResources.resources.map(
          (resource) => ({
            ...resource,
            tags: [...(resource.tags || []), 'default'],
          }),
        );

        allResources.resources = [
          ...allResources.resources,
          ...defaultResourcesWithTags,
        ];

        // Only use defaults next_cursor if we don't have one from user resources
        if (!allResources.next_cursor) {
          allResources.next_cursor = defaultResources.next_cursor;
        }
      } catch (error) {
        console.warn(
          `No resources found in defaults folder: ${defaultsFolder}`,
        );
      }
    }

    return allResources;
  }

  /**
   * Fetch resources from a specific folder in Cloudinary
   * @param folder The folder name to fetch resources from
   * @param options Additional options for the request
   * @returns Promise with the resources
   */
  async getResourcesByFolder(
    folder: string,
    options: CloudinaryResourceOptions = {},
  ): Promise<CloudinaryResponse> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: options.max_results || 100,
        next_cursor: options.next_cursor,
        resource_type: options.resource_type || 'image',
      });
      return result as CloudinaryResponse;
    } catch (error) {
      console.error(`Error fetching resources from folder ${folder}:`, error);
      return { resources: [] };
    }
  }

  /**
   * Fetch resources by tag
   * @param tag The tag to search for
   * @param options Additional options for the request
   * @returns Promise with the resources
   */
  async getResourcesByTag(
    tag: string,
    options: CloudinaryResourceOptions = {},
  ): Promise<CloudinaryResponse> {
    try {
      const result = await cloudinary.api.resources_by_tag(tag, {
        max_results: options.max_results || 100,
        next_cursor: options.next_cursor,
        resource_type: options.resource_type || 'image',
      });
      return result as CloudinaryResponse;
    } catch (error) {
      console.error(`Error fetching resources by tag ${tag}:`, error);
      return { resources: [] };
    }
  }

  /**
   * Fetch resources by public IDs
   * @param publicIds Array of public IDs to fetch
   * @param options Additional options for the request
   * @returns Promise with the resources
   */
  async getResourcesByIds(
    publicIds: string[],
    options: { resource_type?: string } = {},
  ): Promise<CloudinaryResponse> {
    try {
      const result = await cloudinary.api.resources_by_ids(publicIds, {
        resource_type: options.resource_type || 'image',
      });
      return result as CloudinaryResponse;
    } catch (error) {
      console.error(`Error fetching resources by IDs:`, error);
      return { resources: [] };
    }
  }

  /**
   * Search for resources using Cloudinary's search API
   * @param expression The search expression
   * @param options Additional options for the request
   * @returns Promise with the search results
   */
  async searchResources(
    expression: string,
    options: CloudinarySearchOptions = {},
  ): Promise<CloudinaryResponse> {
    try {
      let searchQuery = cloudinary.search
        .expression(expression)
        .max_results(options.max_results || 100);

      if (options.next_cursor) {
        searchQuery = searchQuery.next_cursor(options.next_cursor);
      }

      // Apply sort_by if provided
      if (options.sort_by && options.sort_by.length > 0) {
        options.sort_by.forEach((sort) => {
          searchQuery = searchQuery.sort_by(sort.field, sort.direction);
        });
      }

      // Apply with_field if provided
      if (options.with_field && options.with_field.length > 0) {
        options.with_field.forEach((field) => {
          searchQuery = searchQuery.with_field(field);
        });
      }

      const result = await searchQuery.execute();
      return result as CloudinaryResponse;
    } catch (error) {
      console.error(
        `Error searching resources with expression ${expression}:`,
        error,
      );
      return { resources: [] };
    }
  }

  /**
   * List all folders in Cloudinary
   * @returns Promise with the folders
   */
  async listFolders(): Promise<any> {
    try {
      return await cloudinary.api.root_folders();
    } catch (error) {
      console.error('Error listing folders:', error);
      return { folders: [] };
    }
  }

  /**
   * List subfolders in a specific folder
   * @param folder The parent folder
   * @returns Promise with the subfolders
   */
  async listSubFolders(folder: string): Promise<any> {
    try {
      return await cloudinary.api.sub_folders(folder);
    } catch (error) {
      console.error(`Error listing subfolders in ${folder}:`, error);
      return { folders: [] };
    }
  }

  /**
   * Create a folder in Cloudinary
   * @param path The folder path to create
   * @returns Promise with the result
   */
  async createFolder(path: string): Promise<any> {
    try {
      return await cloudinary.api.create_folder(path);
    } catch (error) {
      console.error(`Error creating folder ${path}:`, error);
      throw new BadRequestException(
        `Failed to create folder: ${error.message}`,
      );
    }
  }

  /**
   * Add metadata to a resource
   * @param publicId The public ID of the resource
   * @param metadata The metadata to add
   * @returns Promise with the result
   */
  async updateMetadata(
    publicId: string,
    metadata: Record<string, any>,
  ): Promise<any> {
    try {
      return await cloudinary.uploader.add_context(JSON.stringify(metadata), [
        publicId,
      ]);
    } catch (error) {
      console.error(`Error updating metadata for ${publicId}:`, error);
      throw new BadRequestException(
        `Failed to update metadata: ${error.message}`,
      );
    }
  }

  /**
   * Add tags to a resource
   * @param publicId The public ID of the resource
   * @param tags The tags to add
   * @returns Promise with the result
   */
  async addTags(publicId: string, tags: string[]): Promise<any> {
    try {
      // Cloudinary API expects a single tag string, so join multiple tags with comma
      const tagString = tags.join(',');
      return await cloudinary.uploader.add_tag(tagString, [publicId]);
    } catch (error) {
      console.error(`Error adding tags to ${publicId}:`, error);
      throw new BadRequestException(`Failed to add tags: ${error.message}`);
    }
  }

  /**
   * Create a zip file containing the specified resources
   * @param urls Array of URLs to include in the zip
   * @param options Additional options for creating the zip
   * @returns Promise with the zip file buffer
   */
  async createZip(
    urls: string[],
    options: {
      folderName?: string;
    } = {},
  ): Promise<Buffer> {
    const zip = new JSZip();
    const folder = options.folderName ? zip.folder(options.folderName) : zip;

    if (!folder) {
      throw new Error('Failed to create folder in zip');
    }

    // Download each resource and add it to the zip
    const downloadPromises = urls.map(async (url, index) => {
      try {
        // Extract filename from URL or use index
        const filename = url.split('/').pop() || `file_${index}.jpg`;

        // Download the file
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Add the file to the zip
        folder.file(filename, response.data);

        return { success: true, url };
      } catch (error) {
        console.error(`Error downloading ${url}:`, error);
        return { success: false, url, error };
      }
    });

    // Wait for all downloads to complete
    await Promise.all(downloadPromises);

    // Generate the zip file
    return zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Upload a file to a user-specific folder
   * @param file The file to upload
   * @param userId The user ID
   * @param type The type of resource (images, logos, etc.)
   * @returns The upload result
   */
  async uploadToUserFolder(
    file: Express.Multer.File,
    userId: string,
    type: string = 'images',
  ) {
    try {
      const folder = `users/${userId}/${type}`;

      // Use upload_stream for better control and error handling
      return new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              publicId: result?.public_id,
              url: result?.secure_url,
              width: result?.width || 0,
              height: result?.height || 0,
              format: result?.format,
            });
          },
        );

        // If we have a buffer, use it directly
        if (file.buffer) {
          const readableStream = new Readable();
          readableStream.push(file.buffer);
          readableStream.push(null);
          readableStream.pipe(uploadStream);
        }
        // If we have a path, read from the file
        else if (file.path) {
          fs.createReadStream(file.path).pipe(uploadStream);
        } else {
          reject(new BadRequestException('No file data available'));
        }
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException('Failed to upload file to Cloudinary');
    } finally {
      // Clean up temporary file if it exists
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  /**
   * Get resources for a specific user and type
   * @param userId The user ID
   * @param type The type of resource (images, logos, etc.)
   * @returns Promise with the user's resources
   */
  async getUserResources(
    userId: string,
    type: string = 'images',
  ): Promise<CloudinaryResponse> {
    try {
      const folder = `users/${userId}/${type}`;
      const result = await cloudinary.search
        .expression(`folder:${folder}`)
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();

      return {
        resources: result.resources || [],
        total: result.total_count || 0,
        next_cursor: result.next_cursor || null,
      };
    } catch (error) {
      console.warn(`No resources found for user ${userId} in ${type} folder`);
      return {
        resources: [],
        total: 0,
        next_cursor: null,
      };
    }
  }

  /**
   * Delete a user's resource
   * @param publicId The public ID of the resource to delete
   * @param userId The user ID
   * @returns Promise with the deletion result
   */
  async deleteUserResource(publicId: string, userId: string): Promise<boolean> {
    try {
      // Verify the resource belongs to the user
      if (!publicId.includes(`users/${userId}/`)) {
        throw new BadRequestException('Unauthorized to delete this resource');
      }

      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw new BadRequestException('Failed to delete resource');
    }
  }
}
