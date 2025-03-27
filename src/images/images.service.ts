import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { eq, and, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import * as fs from 'fs';
import { images } from '../drizzle/schema';

@Injectable()
export class ImagesService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly drizzle: DrizzleService,
  ) {}

  async uploadImage(file: Express.Multer.File, userId: string) {
    try {
      if (!file || !file.mimetype || !file.size) {
        throw new BadRequestException('Invalid file upload');
      }

      const result = await this.cloudinaryService.uploadToUserFolder(
        file,
        userId,
        'images',
      );

      // Save to database with the exact column names from schema.ts
      const savedImage = await this.drizzle.db
        .insert(images)
        .values({
          id: uuidv4(),
          userId: userId,
          url: result.url,
          filename: file.originalname,
          public_id: result.publicId,
          mime_type: file.mimetype,
          size: file.size,
          width: result.width || 0,
          height: result.height || 0,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return savedImage;
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    } finally {
      // Clean up temporary file
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  async getUserImages(userId: string) {
    try {
      // Get images from both Cloudinary and database
      const [cloudinaryResult, dbImages] = await Promise.all([
        this.findAllFromCloudinary('images', userId),
        this.findAll(userId),
      ]);

      // Combine and deduplicate images based on publicId
      const combinedImages = new Map();

      // Add Cloudinary images
      cloudinaryResult.images.forEach((image) => {
        combinedImages.set(image.publicId, image);
      });

      // Add/Update with database images
      dbImages.forEach((image) => {
        if (image.public_id) {
          combinedImages.set(image.public_id, {
            id: image.id,
            url: image.url,
            filename: image.filename,
            publicId: image.public_id,
            mimeType: image.mime_type,
            size: image.size,
            width: image.width,
            height: image.height,
            createdAt: image.created_at,
            updatedAt: image.updated_at,
          });
        }
      });

      return {
        images: Array.from(combinedImages.values()),
        total: combinedImages.size,
      };
    } catch (error) {
      console.error('Error fetching user images:', error);
      return {
        images: [],
        total: 0,
      };
    }
  }

  async findAll(userId: string) {
    try {
      const dbImages = await this.drizzle.db
        .select()
        .from(images)
        .where(eq(images.userId, userId));

      // Map the response to maintain API consistency
      return dbImages.map((image) => ({
        ...image,
        publicId: image.public_id,
        mimeType: image.mime_type,
        createdAt: image.created_at,
        updatedAt: image.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  }

  async findOne(id: string, userId: string) {
    const [image] = await this.drizzle.db
      .select()
      .from(images)
      .where(and(eq(images.id, id), eq(images.userId, userId)));

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  async create(
    file: Express.Multer.File,
    createImageDto: CreateImageDto,
    userId: string,
  ) {
    // Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      'images',
    );

    const id = uuidv4();
    const newImage = {
      id,
      user_id: userId,
      filename: file.originalname,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      tags: createImageDto.tags || [],
      mimeType: file.mimetype, // Fix: Add missing property
      size: file.size, // Fix: Add missing property
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Convert camelCase to snake_case for database insertion
    const dbImage = {
      id: newImage.id,
      user_id: newImage.user_id,
      filename: newImage.filename,
      url: newImage.url,
      public_id: newImage.publicId,
      width: newImage.width,
      height: newImage.height,
      format: newImage.format,
      tags: newImage.tags,
      mime_type: newImage.mimeType,
      size: newImage.size,
      created_at: newImage.createdAt,
      updated_at: newImage.updatedAt,
    };

    await this.drizzle.db.insert(images).values(dbImage);
    return this.findOne(id, userId);
  }

  async update(id: string, updateImageDto: UpdateImageDto, userId: string) {
    const image = await this.findOne(id, userId);

    const updatedImage = {
      ...image,
      tags: updateImageDto.tags,
      updatedAt: new Date(),
    };

    await this.drizzle.db
      .update(images)
      .set(updatedImage)
      .where(and(eq(images.id, id), eq(images.userId, userId)));

    return this.findOne(id, userId);
  }

  async deleteImage(
    publicId: string,
    userId: string,
    folder: string = 'images',
  ) {
    try {
      console.log(
        `Deleting image: ${publicId} from folder ${folder} for user ${userId}`,
      );

      // Delete from Cloudinary
      await this.cloudinaryService.deleteUserResource(publicId, userId, folder);

      // Delete from database if exists
      try {
        const deletedRows = await this.drizzle.db
          .delete(images)
          .where(and(eq(images.public_id, publicId), eq(images.userId, userId)))
          .returning();

        console.log(`Deleted ${deletedRows.length} database records`);
      } catch (dbError) {
        console.warn(
          'Database entry not found, continuing with deletion',
          dbError,
        );
        // Continue even if database deletion fails
      }

      return { success: true, message: 'Image deleted successfully' };
    } catch (error) {
      console.error('Delete error:', error);
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Try to find the image first
      const image = await this.findOne(id, userId);

      // Delete from Cloudinary if we have a publicId
      if (image.public_id) {
        try {
          await this.cloudinaryService.deleteUserResource(
            image.public_id,
            userId,
            'images',
          );
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
          // Continue with database deletion even if Cloudinary deletion fails
        }
      }

      // Delete from database
      await this.drizzle.db
        .delete(images)
        .where(and(eq(images.id, id), eq(images.userId, userId)));

      return { success: true, message: 'Image deleted successfully' };
    } catch (error) {
      console.error('Error in remove:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete image: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Fetch images directly from Cloudinary by folder
   * @param folder The folder to fetch images from
   * @param userId The user ID
   * @returns Array of images from Cloudinary
   */
  async findAllFromCloudinary(folder: string = 'images', userId: string) {
    try {
      // Fetch images from user's specific folder
      const userFolder = `users/${userId}/${folder}`;
      const cloudinaryResult =
        await this.cloudinaryService.getResourcesByFolder(userFolder);

      // If no resources or empty result, return empty array
      if (!cloudinaryResult || !cloudinaryResult.resources) {
        return {
          images: [],
          total: 0,
        };
      }

      // Map Cloudinary resources to our application format
      const cloudinaryImages = cloudinaryResult.resources.map((resource) => ({
        id: resource.public_id,
        url: resource.secure_url,
        filename: resource.public_id.split('/').pop(),
        mimeType: resource.resource_type + '/' + resource.format,
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        publicId: resource.public_id,
        createdAt: resource.created_at,
        updatedAt: resource.created_at,
      }));

      return {
        images: cloudinaryImages,
        total: cloudinaryImages.length,
      };
    } catch (error) {
      console.error('Error fetching images from Cloudinary:', error);
      return {
        images: [],
        total: 0,
      };
    }
  }

  async findOneFromCloudinary(publicId: string, userId: string) {
    try {
      const cloudinaryResult = await this.cloudinaryService.getResourcesByIds([
        publicId,
      ]);

      if (
        !cloudinaryResult.resources ||
        cloudinaryResult.resources.length === 0
      ) {
        throw new NotFoundException('Image not found in Cloudinary');
      }

      const resource = cloudinaryResult.resources[0];

      // Try to find matching database record
      const [dbImage] = await this.drizzle.db
        .select()
        .from(images)
        .where(and(eq(images.public_id, publicId), eq(images.userId, userId)))
        .limit(1);

      const cloudinaryImage = {
        id: resource.public_id,
        url: resource.secure_url,
        filename: resource.public_id.split('/').pop(),
        mimeType: resource.resource_type + '/' + resource.format,
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        publicId: resource.public_id,
        createdAt: resource.created_at,
        updatedAt: resource.created_at,
      };

      return dbImage ? { ...cloudinaryImage, ...dbImage } : cloudinaryImage;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw new NotFoundException('Image not found');
    }
  }

  async getDefaultUserImage() {
    try {
      // Search for images in the defaults folder
      const result =
        await this.cloudinaryService.getResourcesByFolder('images/defaults');

      if (!result.resources || result.resources.length === 0) {
        throw new NotFoundException('No default user image found');
      }

      // Get the first image from the defaults folder
      const defaultImage = result.resources[0];

      return {
        url: defaultImage.secure_url,
        publicId: defaultImage.public_id,
        width: defaultImage.width,
        height: defaultImage.height,
      };
    } catch (error) {
      console.error('Error fetching default user image:', error);
      throw new NotFoundException('Default user image not found');
    }
  }
}
