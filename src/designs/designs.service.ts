import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { designs, images } from '../drizzle/schema';
import { db } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class DesignsService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly drizzle: DrizzleService,
  ) {}

  async saveDesign(userId: string, designData: CreateDesignDto) {
    try {
      let cloudinaryResponse;

      // Handle different image URL formats
      if (designData.imageUrl.startsWith('data:image')) {
        // Handle base64 image
        const base64Data = designData.imageUrl.replace(
          /^data:image\/\w+;base64,/,
          '',
        );
        const buffer = Buffer.from(base64Data, 'base64');

        // Create a file object for CloudinaryService
        const file = {
          buffer,
          originalname: `design_${Date.now()}.png`,
          mimetype: 'image/png',
        } as Express.Multer.File;

        // Upload to user's designs folder
        cloudinaryResponse = await this.cloudinaryService.uploadToUserFolder(
          file,
          userId,
          'designs',
        );
      } else if (designData.imageUrl.startsWith('http')) {
        // If it's already a Cloudinary URL, check if it's in the correct folder
        if (designData.imageUrl.includes(`users/${userId}/designs`)) {
          // Already in the correct folder, just extract the info
          const urlParts = designData.imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = filename.split('.')[0]; // Remove file extension

          cloudinaryResponse = {
            url: designData.imageUrl,
            secure_url: designData.imageUrl,
            publicId: publicId,
            public_id: publicId,
          };
        } else {
          // Not in the correct folder, we need to download and re-upload
          try {
            // Fetch the image from the URL
            const response = await fetch(designData.imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Get the file extension from the URL or default to png
            const extension = designData.imageUrl.split('.').pop() || 'png';

            // Create a file object for CloudinaryService
            const file = {
              buffer,
              originalname: `design_${Date.now()}.${extension}`,
              mimetype: `image/${extension}`,
            } as Express.Multer.File;

            // Upload to user's designs folder
            cloudinaryResponse =
              await this.cloudinaryService.uploadToUserFolder(
                file,
                userId,
                'designs',
              );
          } catch (fetchError) {
            console.error('Error fetching image from URL:', fetchError);
            throw new BadRequestException('Failed to process the image URL');
          }
        }
      } else {
        throw new BadRequestException('Invalid image URL format');
      }

      if (
        !cloudinaryResponse ||
        (!cloudinaryResponse.url && !cloudinaryResponse.secure_url)
      ) {
        throw new InternalServerErrorException(
          'Failed to upload image to Cloudinary',
        );
      }

      // Prepare the design data for database
      const designRecord = {
        userId,
        name: designData.name,
        imageUrl: cloudinaryResponse.secure_url || cloudinaryResponse.url,
        imageData: JSON.stringify({
          url: cloudinaryResponse.secure_url || cloudinaryResponse.url,
          publicId: cloudinaryResponse.public_id || cloudinaryResponse.publicId,
        }),
        designState: JSON.stringify({
          filter: designData.filter,
          textOverlay: designData.textOverlay,
          logos: designData.logos,
          aspectRatio: designData.aspectRatio,
        }),
        publicId: cloudinaryResponse.public_id || cloudinaryResponse.publicId,
      };

      // Save to database using Drizzle
      const [savedDesign] = await this.drizzle.db
        .insert(designs)
        .values(designRecord)
        .returning();

      return {
        id: savedDesign.id,
        name: savedDesign.name,
        imageUrl: savedDesign.imageUrl,
        filter: designData.filter,
        textOverlay: designData.textOverlay,
        logos: designData.logos,
        aspectRatio: designData.aspectRatio,
        createdAt: savedDesign.createdAt,
      };
    } catch (error) {
      console.error('Error saving design:', error);
      throw new InternalServerErrorException(
        `Failed to save design: ${error.message}`,
      );
    }
  }

  async getDesigns(userId: string) {
    try {
      const userDesigns = await db
        .select()
        .from(designs)
        .where(eq(designs.userId, userId))
        .orderBy(designs.createdAt);

      return userDesigns.map((design) => {
        let imageUrl = design.imageUrl;
        // Ensure the URL is properly formatted
        if (imageUrl && !imageUrl.startsWith('http')) {
          const imageData = JSON.parse(design.imageData);
          imageUrl = imageData.url;
        }

        // Parse designState and ensure all required properties exist
        const designState = JSON.parse(design.designState);

        return {
          id: design.id,
          name: design.name,
          imageUrl: imageUrl,
          filter: designState.filter || {},
          textOverlay: designState.textOverlay || {},
          logos: designState.logos || [],
          aspectRatio: designState.aspectRatio || '1:1',
          createdAt: design.createdAt,
        };
      });
    } catch (error) {
      console.error('Error fetching designs:', error);
      throw new InternalServerErrorException('Failed to fetch designs');
    }
  }

  async deleteDesign(userId: string, designId: string) {
    try {
      const [design] = await db
        .select()
        .from(designs)
        .where(and(eq(designs.id, designId), eq(designs.userId, userId)))
        .limit(1);

      if (!design) {
        throw new NotFoundException('Design not found');
      }

      // Get the public ID from imageData
      let publicId: string | undefined;

      if (design.imageData) {
        try {
          const imageData = JSON.parse(design.imageData);
          publicId = imageData.publicId || imageData.id;

          // If no publicId in imageData, try to extract it from imageUrl
          if (!publicId && design.imageUrl) {
            const urlParts = design.imageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            publicId = filename.split('.')[0]; // Remove file extension
          }
        } catch (e) {
          console.warn('Could not parse imageData:', e);
        }
      }

      // Delete from Cloudinary if we have a public ID
      if (publicId) {
        try {
          await this.cloudinaryService.deleteUserResource(
            publicId,
            userId,
            'designs',
          );
        } catch (cloudinaryError) {
          console.warn('Error deleting from Cloudinary:', cloudinaryError);
          // Continue with database deletion even if Cloudinary deletion fails
        }
      }

      // Delete from database
      await db
        .delete(designs)
        .where(and(eq(designs.id, designId), eq(designs.userId, userId)));

      return { success: true, message: 'Design deleted successfully' };
    } catch (error) {
      console.error('Delete error:', error);
      throw new BadRequestException(
        `Failed to delete design: ${error.message}`,
      );
    }
  }
}
