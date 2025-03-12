import { Injectable, NotFoundException } from '@nestjs/common';
import { db, typography } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateTypographyDto } from './dto/update-typography.dto';
import { CreateTypographyDto } from './dto/create-typography.dto';

@Injectable()
export class TypographyService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async findAll(userId: string) {
    return db.select().from(typography).where(eq(typography.userId, userId));
  }

  async findOne(id: string, userId: string) {
    const result = await db
      .select()
      .from(typography)
      .where(and(eq(typography.id, id), eq(typography.userId, userId)))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('Typography not found');
    }

    return result[0];
  }

  /**
   * Fetch typography directly from Cloudinary by folder
   * @param folder The folder to fetch typography from
   * @param userId The user ID
   * @returns Array of typography from Cloudinary
   */
  async findAllFromCloudinary(folder: string = 'typography', userId: string) {
    try {
      // Fetch typography from Cloudinary
      const cloudinaryResult =
        await this.cloudinaryService.getResourcesByFolder(folder);

      // Map Cloudinary resources to our application format
      const cloudinaryTypography = cloudinaryResult.resources.map(
        (resource) => ({
          id: resource.public_id, // Using public_id as id for Cloudinary resources
          name: resource.public_id.split('/').pop(),
          url: resource.secure_url,
          filename: resource.public_id.split('/').pop(),
          mimeType: resource.resource_type + '/' + resource.format,
          size: resource.bytes,
          width: resource.width,
          height: resource.height,
          publicId: resource.public_id,
          isDefault: false, // Default value, will be overridden by DB record if exists
          createdAt: resource.created_at,
          updatedAt: resource.created_at,
        }),
      );

      // Merge with database records to get additional metadata like isDefault
      const dbTypography = await this.findAll(userId);
      const dbTypoMap = new Map(
        dbTypography.map((typo) => [typo.publicId, typo]),
      );

      return cloudinaryTypography.map((cloudTypo) => {
        const dbTypo = dbTypoMap.get(cloudTypo.publicId);
        return dbTypo ? { ...cloudTypo, ...dbTypo } : cloudTypo;
      });
    } catch (error) {
      console.error('Error fetching typography from Cloudinary:', error);
      // Fallback to database if Cloudinary fetch fails
      return this.findAll(userId);
    }
  }

  /**
   * Fetch a single typography from Cloudinary by public ID
   * @param publicId The public ID of the typography
   * @param userId The user ID
   * @returns The typography from Cloudinary
   */
  async findOneFromCloudinary(publicId: string, userId: string) {
    try {
      const cloudinaryResult = await this.cloudinaryService.getResourcesByIds([
        publicId,
      ]);

      if (
        !cloudinaryResult.resources ||
        cloudinaryResult.resources.length === 0
      ) {
        throw new NotFoundException('Typography not found in Cloudinary');
      }

      const resource = cloudinaryResult.resources[0];

      // Map Cloudinary resource to our application format
      const cloudinaryTypography = {
        id: resource.public_id,
        name: resource.public_id.split('/').pop(),
        url: resource.secure_url,
        filename: resource.public_id.split('/').pop(),
        mimeType: resource.resource_type + '/' + resource.format,
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        publicId: resource.public_id,
        isDefault: false, // Default value, will be overridden by DB record if exists
        createdAt: resource.created_at,
        updatedAt: resource.created_at,
      };

      // Try to find matching database record for additional metadata
      try {
        const dbTypography = await db
          .select()
          .from(typography)
          .where(
            and(
              eq(typography.publicId, publicId),
              eq(typography.userId, userId),
            ),
          )
          .limit(1);

        if (dbTypography.length > 0) {
          return { ...cloudinaryTypography, ...dbTypography[0] };
        }
      } catch (dbError) {
        console.error('Error fetching typography from database:', dbError);
      }

      return cloudinaryTypography;
    } catch (error) {
      console.error('Error fetching typography from Cloudinary:', error);
      // Try to fallback to database
      const dbTypography = await db
        .select()
        .from(typography)
        .where(
          and(eq(typography.publicId, publicId), eq(typography.userId, userId)),
        )
        .limit(1);

      if (dbTypography.length > 0) {
        return dbTypography[0];
      }

      throw new NotFoundException('Typography not found');
    }
  }

  async create(
    file: Express.Multer.File,
    createTypographyDto: CreateTypographyDto,
    userId: string,
  ) {
    // Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      'typography',
    );

    // If this is the first typography for the user, set it as default
    const existingTypography = await this.findAll(userId);
    const isDefault = existingTypography.length === 0;

    // Create typography record
    const result = await db.insert(typography).values({
      userId,
      name: file.originalname,
      url: uploadResult.secure_url,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: uploadResult.width,
      height: uploadResult.height,
      publicId: uploadResult.public_id,
      isDefault,
    });
    const [insertedId] = result;
    return this.findOne(insertedId, userId);
  }

  async update(
    id: string,
    updateTypographyDto: UpdateTypographyDto,
    userId: string,
  ) {
    const typographyItem = await this.findOne(id, userId);

    if (updateTypographyDto.isDefault) {
      // If setting as default, unset any existing default
      await db
        .update(typography)
        .set({ isDefault: false })
        .where(eq(typography.userId, userId));
    }

    await db
      .update(typography)
      .set(updateTypographyDto)
      .where(and(eq(typography.id, id), eq(typography.userId, userId)));

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const typo = await this.findOne(id, userId);

    // Delete from Cloudinary if publicId exists
    if (typo.publicId) {
      await this.cloudinaryService.deleteFile(typo.publicId);
    }

    return db
      .delete(typography)
      .where(and(eq(typography.id, id), eq(typography.userId, userId)));
  }
}
