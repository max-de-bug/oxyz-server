import { Injectable } from '@nestjs/common';
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
    const { includeDefaults = true, ...restOptions } = options;
    let allResources: CloudinaryResponse = { resources: [] };

    // If userId is provided, get user-specific resources
    if (userId) {
      const userFolder = `${baseFolder}/user_${userId}`;
      try {
        const userResources = await this.getResourcesByFolder(
          userFolder,
          restOptions,
        );
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
          restOptions,
        );
        allResources.resources = [
          ...allResources.resources,
          ...defaultResources.resources,
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
    return new Promise((resolve, reject) => {
      cloudinary.api.resources(
        {
          type: 'upload',
          prefix: folder,
          max_results: options.max_results || 100,
          next_cursor: options.next_cursor,
          resource_type: options.resource_type || 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as CloudinaryResponse);
        },
      );
    });
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
    return new Promise((resolve, reject) => {
      cloudinary.api.resources_by_tag(
        tag,
        {
          max_results: options.max_results || 100,
          next_cursor: options.next_cursor,
          resource_type: options.resource_type || 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as CloudinaryResponse);
        },
      );
    });
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
    return new Promise((resolve, reject) => {
      cloudinary.api.resources_by_ids(
        publicIds,
        {
          resource_type: options.resource_type || 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as CloudinaryResponse);
        },
      );
    });
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
    return new Promise((resolve, reject) => {
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
        searchQuery = searchQuery.with_field(options.with_field);
      }

      searchQuery
        .execute()
        .then((result) => resolve(result as CloudinaryResponse))
        .catch((error) => reject(error));
    });
  }

  /**
   * List all folders in Cloudinary
   * @returns Promise with the folders
   */
  async listFolders(): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.root_folders((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  /**
   * List subfolders in a specific folder
   * @param folder The parent folder
   * @returns Promise with the subfolders
   */
  async listSubFolders(folder: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.sub_folders(folder, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  /**
   * Create a folder in Cloudinary
   * @param path The folder path to create
   * @returns Promise with the result
   */
  async createFolder(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.create_folder(path, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
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
    return new Promise((resolve, reject) => {
      cloudinary.uploader.add_context(
        JSON.stringify(metadata),
        [publicId],
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  /**
   * Add tags to a resource
   * @param publicId The public ID of the resource
   * @param tags The tags to add
   * @returns Promise with the result
   */
  async addTags(publicId: string, tags: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      // Cloudinary API expects a single tag string, so join multiple tags with comma
      const tagString = tags.join(',');
      cloudinary.uploader.add_tag(tagString, [publicId], (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
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
}
