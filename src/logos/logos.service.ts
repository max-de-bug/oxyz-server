import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { logos } from '../drizzle/schema';
import { eq, and, SQL } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../drizzle/schema';

@Injectable()
export class LogosService {
  constructor(
    private drizzle: DrizzleService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll(userId: string, isDefault?: boolean) {
    // Start with the base condition
    let conditions: SQL<unknown>[] = [eq(logos.userId, userId)];

    // Conditionally add isDefault filter
    if (isDefault !== undefined) {
      conditions.push(eq(logos.isDefault, isDefault));
    }

    // Build the query with all conditions at once
    const results = await this.drizzle.db
      .select()
      .from(logos)
      .where(and(...conditions))
      .orderBy(logos.createdAt);

    return results;
  }

  async findOne(id: string, userId: string) {
    const [logo] = await this.drizzle.db
      .select()
      .from(logos)
      .where(and(eq(logos.id, id), eq(logos.userId, userId)));

    if (!logo) {
      throw new NotFoundException(`Logo with ID ${id} not found`);
    }

    return logo;
  }

  async create(
    file: Express.Multer.File,
    createLogoDto: CreateLogoDto,
    userId: string,
  ) {
    // Upload to Cloudinary in user-specific folder
    const uploadResult = await this.cloudinary.uploadFile(
      file,
      'logos',
      userId,
    );

    // If this is the first logo for the user, set it as default
    const existingLogos = await this.findAll(userId);
    const isDefault = existingLogos.length === 0;

    // If default, add a tag
    if (isDefault) {
      await this.cloudinary.addTags(uploadResult.public_id, ['default']);
    }

    // Create logo record
    const result = (await db.insert(logos).values({
      userId,
      url: uploadResult.secure_url,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: uploadResult.width,
      height: uploadResult.height,
      publicId: uploadResult.public_id,
      isDefault,
    })) as { id: string }[];

    return this.findOne(result[0].id, userId);
  }

  async update(id: string, updateLogoDto: UpdateLogoDto, userId: string) {
    const logo = await this.findOne(id, userId);

    const updatedLogo = {
      ...logo,
      isDefault:
        updateLogoDto.isDefault !== undefined
          ? updateLogoDto.isDefault
          : logo.isDefault,
      updatedAt: new Date(),
    };

    await this.drizzle.db
      .update(logos)
      .set(updatedLogo)
      .where(and(eq(logos.id, id), eq(logos.userId, userId)));

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const logo = await this.findOne(id, userId);

    // Delete from Cloudinary
    if (logo.publicId) {
      await this.cloudinary.deleteFile(logo.publicId);
    }

    await this.drizzle.db
      .delete(logos)
      .where(and(eq(logos.id, id), eq(logos.userId, userId)));

    return { success: true };
  }

  async setDefault(id: string, userId: string) {
    // First, unset default for all logos
    await this.drizzle.db
      .update(logos)
      .set({ isDefault: false })
      .where(eq(logos.userId, userId));

    // Then set the selected logo as default
    await this.drizzle.db
      .update(logos)
      .set({ isDefault: true })
      .where(and(eq(logos.id, id), eq(logos.userId, userId)));

    return this.findOne(id, userId);
  }

  /**
   * Fetch logos directly from Cloudinary by folder
   * @param folder The folder to fetch logos from
   * @param userId The user ID
   * @param options Additional options for the request
   * @returns Array of logos from Cloudinary
   */
  async findAllFromCloudinary(
    folder: string = 'logos',
    userId: string,
    options: { includeDefaults?: boolean } = {},
  ) {
    try {
      // Check if we should include defaults
      const includeDefaults = options.includeDefaults !== false;

      // If CloudinaryService has getResourcesByBaseFolder method, use it
      if (typeof this.cloudinary.getResourcesByBaseFolder === 'function') {
        const cloudinaryResult = await this.cloudinary.getResourcesByBaseFolder(
          folder,
          userId,
          { includeDefaults },
        );
        console.log('cloudinaryResult', cloudinaryResult);
        // Map Cloudinary resources to our application format
        const cloudinaryLogos = cloudinaryResult.resources.map((resource) => ({
          id: resource.public_id,
          url: resource.secure_url,
          filename: resource.public_id.split('/').pop() || resource.public_id,
          mimeType: `image/${resource.format}`,
          size: resource.bytes,
          width: resource.width,
          height: resource.height,
          publicId: resource.public_id,
          isDefault:
            resource.public_id.includes('/defaults/') ||
            resource.tags?.includes('default') ||
            false,
          createdAt: resource.created_at,
          updatedAt: resource.created_at,
        }));

        // Merge with database records to get additional metadata
        const dbLogos = await this.findAll(userId);
        const dbLogoMap = new Map(dbLogos.map((logo) => [logo.publicId, logo]));

        return {
          resources: cloudinaryLogos.map((cloudLogo) => {
            const dbLogo = dbLogoMap.get(cloudLogo.publicId);
            return dbLogo ? { ...cloudLogo, ...dbLogo } : cloudLogo;
          }),
          next_cursor: cloudinaryResult.next_cursor,
        };
      } else {
        // Fallback to the original implementation
        const cloudinaryResult =
          await this.cloudinary.getResourcesByFolder(folder);

        // Map Cloudinary resources to our application format
        const cloudinaryLogos = cloudinaryResult.resources.map((resource) => ({
          id: resource.public_id,
          url: resource.secure_url,
          filename: resource.public_id.split('/').pop() || resource.public_id,
          mimeType: resource.resource_type + '/' + resource.format,
          size: resource.bytes,
          width: resource.width,
          height: resource.height,
          publicId: resource.public_id,
          isDefault: false,
          createdAt: resource.created_at,
          updatedAt: resource.created_at,
        }));

        // Merge with database records to get additional metadata
        const dbLogos = await this.findAll(userId);
        const dbLogoMap = new Map(dbLogos.map((logo) => [logo.publicId, logo]));

        return cloudinaryLogos.map((cloudLogo) => {
          const dbLogo = dbLogoMap.get(cloudLogo.publicId);
          return dbLogo ? { ...cloudLogo, ...dbLogo } : cloudLogo;
        });
      }
    } catch (error) {
      console.error('Error fetching logos from Cloudinary:', error);
      // Fallback to database if Cloudinary fetch fails
      return this.findAll(userId);
    }
  }

  /**
   * Fetch a single logo from Cloudinary by public ID
   * @param publicId The public ID of the logo
   * @param userId The user ID
   * @returns The logo from Cloudinary
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
        throw new NotFoundException('Logo not found in Cloudinary');
      }

      const resource = cloudinaryResult.resources[0];

      // Map Cloudinary resource to our application format
      const cloudinaryLogo = {
        id: resource.public_id,
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
        const dbLogos = await db
          .select()
          .from(logos)
          .where(and(eq(logos.publicId, publicId), eq(logos.userId, userId)))
          .limit(1);

        if (dbLogos.length > 0) {
          return { ...cloudinaryLogo, ...dbLogos[0] };
        }
      } catch (dbError) {
        console.error('Error fetching logo from database:', dbError);
      }

      return cloudinaryLogo;
    } catch (error) {
      console.error('Error fetching logo from Cloudinary:', error);
      // Try to fallback to database
      const dbLogos = await db
        .select()
        .from(logos)
        .where(and(eq(logos.publicId, publicId), eq(logos.userId, userId)))
        .limit(1);

      if (dbLogos.length > 0) {
        return dbLogos[0];
      }

      throw new NotFoundException('Logo not found');
    }
  }
}
