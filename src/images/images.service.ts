import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { images } from '../drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImagesService {
  constructor(
    private drizzle: DrizzleService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll(userId: string, tags?: string[]) {
    const results = await this.drizzle.db
      .select()
      .from(images)
      .where(eq(images.userId, userId))
      .orderBy(images.createdAt);

    return results;
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
    const uploadResult = await this.cloudinary.uploadFile(file, 'images');

    const id = uuidv4();
    const newImage = {
      id,
      userId,
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

    await this.drizzle.db.insert(images).values(newImage);
    return this.findOne(id, userId);
  }

  async update(id: string, updateImageDto: UpdateImageDto, userId: string) {
    const image = await this.findOne(id, userId);

    const updatedImage = {
      ...image,
      tags: updateImageDto.tags || image.tags,
      updatedAt: new Date(),
    };

    await this.drizzle.db
      .update(images)
      .set(updatedImage)
      .where(and(eq(images.id, id), eq(images.userId, userId)));

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const image = await this.findOne(id, userId);

    // Delete from Cloudinary
    if (image.publicId) {
      await this.cloudinary.deleteFile(image.publicId);
    }

    await this.drizzle.db
      .delete(images)
      .where(and(eq(images.id, id), eq(images.userId, userId)));

    return { success: true };
  }

  /**
   * Fetch images directly from Cloudinary by folder
   * @param folder The folder to fetch images from
   * @param userId The user ID
   * @returns Array of images from Cloudinary
   */
  async findAllFromCloudinary(folder: string = 'images', userId: string) {
    try {
      // Fetch images from Cloudinary
      const cloudinaryResult =
        await this.cloudinary.getResourcesByFolder(folder);

      // Map Cloudinary resources to our application format
      const cloudinaryImages = cloudinaryResult.resources.map((resource) => ({
        id: resource.public_id, // Using public_id as id for Cloudinary resources
        url: resource.secure_url,
        filename: resource.public_id.split('/').pop(),
        mimeType: resource.resource_type + '/' + resource.format,
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        publicId: resource.public_id,
        createdAt: resource.created_at,
        updatedAt: resource.created_at,
        // Add any additional fields needed
      }));

      // Optionally, you can merge with database records to get additional metadata
      const dbImages = await this.findAll(userId);
      const dbImageMap = new Map(dbImages.map((img) => [img.publicId, img]));

      return cloudinaryImages.map((cloudImg) => {
        const dbImg = dbImageMap.get(cloudImg.publicId);
        return dbImg ? { ...cloudImg, ...dbImg } : cloudImg;
      });
    } catch (error) {
      console.error('Error fetching images from Cloudinary:', error);
      // Fallback to database if Cloudinary fetch fails
      return this.findAll(userId);
    }
  }

  /**
   * Fetch a single image from Cloudinary by public ID
   * @param publicId The public ID of the image
   * @param userId The user ID
   * @returns The image from Cloudinary
   */
  async findOneFromCloudinary(publicId: string, userId: string) {
    try {
      const cloudinaryResult = await this.cloudinary.getResourcesByIds([
        publicId,
      ]);

      if (
        !cloudinaryResult.resources ||
        cloudinaryResult.resources.length === 0
      ) {
        throw new NotFoundException('Image not found in Cloudinary');
      }

      const resource = cloudinaryResult.resources[0];

      // Map Cloudinary resource to our application format
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

      // Try to find matching database record for additional metadata
      try {
        const dbImages = await this.drizzle.db
          .select()
          .from(images)
          .where(and(eq(images.publicId, publicId), eq(images.userId, userId)))
          .limit(1);

        if (dbImages.length > 0) {
          return { ...cloudinaryImage, ...dbImages[0] };
        }
      } catch (dbError) {
        console.error('Error fetching image from database:', dbError);
      }

      return cloudinaryImage;
    } catch (error) {
      console.error('Error fetching image from Cloudinary:', error);
      // Try to fallback to database
      const dbImages = await this.drizzle.db
        .select()
        .from(images)
        .where(and(eq(images.publicId, publicId), eq(images.userId, userId)))
        .limit(1);

      if (dbImages.length > 0) {
        return dbImages[0];
      }

      throw new NotFoundException('Image not found');
    }
  }
}
