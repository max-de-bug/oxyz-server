import { Injectable, Logger } from '@nestjs/common';
import { db, presets } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CloudinaryResource } from '../cloudinary/interfaces/cloudinary.interfaces';

@Injectable()
export class PresetsService {
  private readonly logger = new Logger(PresetsService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Find all presets for a user
   */
  async findAll(userId: string) {
    return db.select().from(presets).where(eq(presets.userId, userId));
  }

  /**
   * Fetch presets directly from Cloudinary by folder
   * @param folder The folder to fetch presets from
   * @param userId The user ID
   * @param options Additional options for the request
   * @returns Array of presets from Cloudinary
   */
  async findAllFromCloudinary(
    folder: string = 'presets',
    userId: string,
    options: { includeDefaults?: boolean } = {},
  ) {
    console.log('DEBUGGING: findAllFromCloudinary called with:', {
      folder,
      userId,
      options,
    });
    this.logger.debug(
      `Finding all presets from Cloudinary for user ${userId} in folder ${folder}`,
    );

    try {
      console.log('DEBUGGING: Before includeDefaults check');
      // Check if we should include defaults
      const includeDefaults = options.includeDefaults !== false;
      console.log('DEBUGGING: includeDefaults =', includeDefaults);

      console.log('DEBUGGING: Before cloudinaryService call');
      // Check if cloudinaryService is properly injected
      if (!this.cloudinaryService) {
        console.error('DEBUGGING: cloudinaryService is not defined!');
        return { resources: [] };
      }

      // Check if the method exists
      if (
        typeof this.cloudinaryService.getResourcesByBaseFolder !== 'function'
      ) {
        console.error(
          'DEBUGGING: getResourcesByBaseFolder method does not exist!',
        );
        return { resources: [] };
      }

      // Call getResourcesByBaseFolder with proper parameters
      console.log('DEBUGGING: Calling getResourcesByBaseFolder with:', {
        folder,
        userId,
        includeDefaults,
      });

      try {
        const cloudinaryResult =
          await this.cloudinaryService.getResourcesByBaseFolder(
            folder,
            userId,
            { includeDefaults },
          );

        console.log('DEBUGGING: After getResourcesByBaseFolder call');
        console.log(
          'DEBUGGING: cloudinaryResult =',
          JSON.stringify(cloudinaryResult, null, 2),
        );

        // If no resources were found, return empty array
        if (
          !cloudinaryResult ||
          !cloudinaryResult.resources ||
          !Array.isArray(cloudinaryResult.resources)
        ) {
          console.log('DEBUGGING: No resources found or invalid structure');
          this.logger.warn('No resources found in Cloudinary');
          return { resources: [] };
        }

        console.log(
          'DEBUGGING: Found resources:',
          cloudinaryResult.resources.length,
        );

        // Map Cloudinary resources to our application format
        const cloudinaryPresets = cloudinaryResult.resources.map(
          (resource: CloudinaryResource) => ({
            id: resource.public_id,
            url: resource.secure_url,
            filename: resource.public_id.split('/').pop() || resource.public_id,
            mimeType: `image/${resource.format || 'jpeg'}`,
            size: resource.bytes || 0,
            width: resource.width || 0,
            height: resource.height || 0,
            publicId: resource.public_id,
            isDefault:
              resource.public_id.includes('_defaults/') ||
              (resource.tags && resource.tags.includes('default')) ||
              false,
            createdAt: resource.created_at || new Date().toISOString(),
            updatedAt: resource.created_at || new Date().toISOString(),
          }),
        );

        // Merge with database records to get additional metadata
        const dbPresets = await this.findAll(userId);

        // Create a map of presets by publicId for efficient lookup
        const dbPresetMap = new Map();
        for (const preset of dbPresets) {
          if (preset.id) {
            dbPresetMap.set(preset.id, preset);
          }
        }

        // Return the merged resources
        return {
          resources: cloudinaryPresets.map((cloudPreset) => {
            const dbPreset = dbPresetMap.get(cloudPreset.publicId);
            return dbPreset ? { ...cloudPreset, ...dbPreset } : cloudPreset;
          }),
          next_cursor: cloudinaryResult.next_cursor,
        };
      } catch (innerError) {
        console.error(
          'DEBUGGING: Error in getResourcesByBaseFolder call:',
          innerError,
        );
        throw innerError; // Re-throw to be caught by the outer try/catch
      }
    } catch (error) {
      console.error('DEBUGGING: Error in findAllFromCloudinary:', error);
      this.logger.error(
        `Error fetching presets from Cloudinary: ${error.message}`,
      );
      return { resources: [] };
    }
  }

  /**
   * Fetch presets from Cloudinary with pagination
   * @param folder The folder to fetch presets from
   * @param userId The user ID
   * @param options Pagination options
   * @returns Paginated array of presets from Cloudinary
   */
  async findAllFromCloudinaryWithPagination(
    folder: string = 'presets',
    userId: string,
    options: {
      maxResults?: number;
      nextCursor?: string;
      includeDefaults?: boolean;
    } = {},
  ) {
    const {
      maxResults = 10,
      nextCursor = null,
      includeDefaults = true,
    } = options;

    try {
      // If CloudinaryService has getResourcesByBaseFolder method, use it
      if (
        typeof this.cloudinaryService.getResourcesByBaseFolder === 'function'
      ) {
        const cloudinaryResult =
          await this.cloudinaryService.getResourcesByBaseFolder(
            folder,
            userId,
            {
              max_results: maxResults,
              next_cursor: nextCursor || undefined,
              includeDefaults,
            },
          );

        // Map Cloudinary resources to our application format
        const cloudinaryPresets = cloudinaryResult.resources.map(
          (resource) => ({
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
          }),
        );

        // Merge with database records to get additional metadata
        const dbPresets = await this.findAll(userId);
        const dbPresetMap = new Map(
          dbPresets.map((preset) => [preset.id, preset]),
        );

        return {
          resources: cloudinaryPresets.map((cloudPreset) => {
            const dbPreset = dbPresetMap.get(cloudPreset.publicId);
            return dbPreset ? { ...cloudPreset, ...dbPreset } : cloudPreset;
          }),
          next_cursor: cloudinaryResult.next_cursor,
        };
      } else {
        // Fallback if getResourcesByBaseFolder is not available
        console.error(
          'CloudinaryService.getResourcesByBaseFolder is not available',
        );
        return { resources: [] };
      }
    } catch (error) {
      console.error('Error fetching paginated presets from Cloudinary:', error);
      return { resources: [] };
    }
  }

  /**
   * Find a preset by ID
   */
  async findOne(id: string, userId: string) {
    const results = await db
      .select()
      .from(presets)
      .where(and(eq(presets.id, id), eq(presets.userId, userId)));

    return results[0];
  }

  /**
   * Create a new preset
   */
  async create(createPresetDto: any, userId: string) {
    // If this is the first preset for the user, set it as default
    const existingPresets = await this.findAll(userId);
    const isDefault = existingPresets.length === 0;

    const result = await db.insert(presets).values({
      ...createPresetDto,
      userId,
      isDefault,
    });

    return this.findOne(result[0], userId);
  }

  /**
   * Update a preset
   */
  async update(id: string, updatePresetDto: any, userId: string) {
    await db
      .update(presets)
      .set(updatePresetDto)
      .where(and(eq(presets.id, id), eq(presets.userId, userId)));

    return this.findOne(id, userId);
  }

  /**
   * Delete a preset
   */
  async remove(id: string, userId: string) {
    await db
      .delete(presets)
      .where(and(eq(presets.id, id), eq(presets.userId, userId)));

    return { id };
  }

  async setDefault(id: string, userId: string) {
    // First, unset any existing default
    await db
      .update(presets)
      .set({ isDefault: false })
      .where(eq(presets.userId, userId));

    // Then set the new default
    await db
      .update(presets)
      .set({ isDefault: true })
      .where(and(eq(presets.id, id), eq(presets.userId, userId)));

    return this.findOne(id, userId);
  }
}
