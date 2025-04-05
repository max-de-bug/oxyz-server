import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { db, filters } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateFilterDto } from './dto/create-filter.dto';
import { Filter, FilterValues } from './interfaces/filter.interface';

@Injectable()
export class FiltersService {
  private readonly logger = new Logger(FiltersService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Create a new filter and upload a filter thumbnail to Cloudinary
   */
  async create(
    createFilterDto: CreateFilterDto,
    userId: string,
  ): Promise<Filter> {
    // Generate a unique ID for the filter
    const id = uuidv4();
    const now = new Date();

    // Create a basic gradient image representing the filter
    const gradientData = await this.generateFilterThumbnail(
      createFilterDto.filter,
    );

    // If gradient data is generated, upload it to Cloudinary
    let url: string | undefined = undefined;
    let publicId: string | undefined = undefined;

    if (gradientData) {
      // Convert base64 to buffer
      const buffer = Buffer.from(gradientData.split(',')[1], 'base64');

      // Create a file-like object for the Cloudinary service
      const file = {
        buffer,
        originalname: `${createFilterDto.name.replace(/\s+/g, '-').toLowerCase()}-${id.slice(0, 8)}.png`,
        mimetype: 'image/png',
      } as Express.Multer.File;

      // Upload to Cloudinary in the user's filters folder
      try {
        const uploadResult = await this.cloudinaryService.uploadToUserFolder(
          file,
          userId,
          'filters',
        );

        url = uploadResult?.url;
        publicId = uploadResult?.publicId;
      } catch (error) {
        this.logger.error(`Error uploading filter thumbnail: ${error.message}`);
        // Continue without thumbnail
      }
    }

    // Create filter object to insert into database
    const dbFilter = {
      id,
      userId,
      name: createFilterDto.name,
      filter: createFilterDto.filter,
      url: url || null,
      publicId: publicId || null,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };

    // Insert into database
    await db.insert(filters).values(dbFilter);

    // Return the created filter as the appropriate type
    return {
      id,
      userId,
      name: createFilterDto.name,
      filter: createFilterDto.filter,
      url,
      publicId,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get all filters for a user, optionally including default filters
   */
  async findAll(
    userId: string,
    options: { includeDefaults?: boolean } = {},
  ): Promise<Filter[]> {
    const { includeDefaults = true } = options;

    // Get user-specific filters from database
    const userFilters = await db
      .select()
      .from(filters)
      .where(eq(filters.userId, userId));
    // Convert to Filter type with non-null userId and filter
    const typedUserFilters: Filter[] = userFilters.map((filter) => ({
      ...filter,
      userId: filter.userId || userId, // Fallback to provided userId if null
      isDefault: filter.isDefault === null ? false : filter.isDefault, // Ensure isDefault is boolean, not null
      filter: filter.filter || {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        sepia: 0,
        opacity: 100,
      }, // Default filter values if null
    }));

    // If we don't need to include defaults, return user filters only
    if (!includeDefaults) {
      return typedUserFilters;
    }

    // Get default filters from Cloudinary
    try {
      const cloudinaryResult =
        await this.cloudinaryService.getResourcesByFolder('filters/defaults');

      // If no default resources found, return user filters only
      if (
        !cloudinaryResult.resources ||
        cloudinaryResult.resources.length === 0
      ) {
        return typedUserFilters;
      }

      // Map Cloudinary resources to Filter objects
      const defaultFilters: Filter[] = cloudinaryResult.resources.map(
        (resource) => {
          // Try to parse filter values from resource metadata or context
          const filterContext = resource.context?.custom || {};

          return {
            id: resource.public_id,
            userId: 'system', // Use a constant string for system filters
            name: resource.public_id.split('/').pop() || 'Default Filter',
            filter: {
              brightness: parseFloat(filterContext.brightness) || 100,
              contrast: parseFloat(filterContext.contrast) || 100,
              saturation: parseFloat(filterContext.saturation) || 100,
              sepia: parseFloat(filterContext.sepia) || 0,
              opacity: parseFloat(filterContext.opacity) || 100,
            },
            url: resource.secure_url,
            publicId: resource.public_id,
            isDefault: true,
            createdAt: resource.created_at || new Date().toISOString(),
            updatedAt: resource.created_at || new Date().toISOString(),
          };
        },
      );

      // Combine user filters with default filters
      return [...typedUserFilters, ...defaultFilters];
    } catch (error) {
      this.logger.error(`Error fetching default filters: ${error.message}`);
      // Return only user filters if there's an error fetching defaults
      return typedUserFilters;
    }
  }

  /**
   * Get a specific filter by ID
   */
  async findOne(id: string, userId: string): Promise<Filter> {
    // First, try to find the filter in the database
    const result = await db
      .select()
      .from(filters)
      .where(and(eq(filters.id, id), eq(filters.userId, userId)));

    // If found in database, return it
    if (result.length > 0) {
      const filter = result[0];
      return {
        ...filter,
        userId: filter.userId || userId, // Ensure userId is not null
        isDefault: filter.isDefault === null ? false : filter.isDefault, // Ensure isDefault is not null
        filter: filter.filter || {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          sepia: 0,
          opacity: 100,
        }, // Default filter values if null
      };
    }

    // If not found and ID looks like a Cloudinary public ID, try to fetch from Cloudinary
    if (id.includes('/')) {
      try {
        // Check if this is a default filter from Cloudinary
        const resources = await this.cloudinaryService.getResourcesByIds([id]);

        if (resources.resources && resources.resources.length > 0) {
          const resource = resources.resources[0];
          const filterContext = resource.context?.custom || {};

          return {
            id: resource.public_id,
            userId: 'system', // Use a constant string for system filters
            name: resource.public_id.split('/').pop() || 'Default Filter',
            filter: {
              brightness: parseFloat(filterContext.brightness) || 100,
              contrast: parseFloat(filterContext.contrast) || 100,
              saturation: parseFloat(filterContext.saturation) || 100,
              sepia: parseFloat(filterContext.sepia) || 0,
              opacity: parseFloat(filterContext.opacity) || 100,
            },
            url: resource.secure_url,
            publicId: resource.public_id,
            isDefault: true,
            createdAt: resource.created_at || new Date().toISOString(),
            updatedAt: resource.created_at || new Date().toISOString(),
          };
        }
      } catch (error) {
        this.logger.error(
          `Error fetching filter from Cloudinary: ${error.message}`,
        );
      }
    }

    // If not found anywhere, throw error
    throw new NotFoundException(`Filter with ID ${id} not found`);
  }

  /**
   * Delete a filter by ID
   */
  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    // Get the filter to check if it exists and to get the public ID
    const result = await db
      .select()
      .from(filters)
      .where(and(eq(filters.id, id), eq(filters.userId, userId)));

    if (result.length === 0) {
      throw new NotFoundException(`Filter with ID ${id} not found`);
    }

    const filter = result[0];

    // Delete from Cloudinary if it has a public ID
    if (filter.publicId) {
      try {
        await this.cloudinaryService.deleteUserResource(
          filter.publicId,
          userId,
          'filters',
        );
      } catch (error) {
        this.logger.error(
          `Error deleting filter from Cloudinary: ${error.message}`,
        );
        // Continue with database deletion even if Cloudinary deletion failed
      }
    }

    // Delete from database
    await db
      .delete(filters)
      .where(and(eq(filters.id, id), eq(filters.userId, userId)));

    return { success: true };
  }

  /**
   * Generate a base64 image thumbnail representing the filter
   * @param filterValues The filter values to represent
   * @returns A base64 data URL for the filter thumbnail
   */
  private async generateFilterThumbnail(
    filterValues: FilterValues,
  ): Promise<string | null> {
    try {
      // In a real implementation, you would use a library like Canvas
      // to generate a gradient image that represents the filter
      // For now, we'll return a placeholder base64 image

      // This is a simple 100x100 gradient that will be styled with the filter values
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAhUlEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HQ1kgICIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIADfLGAXTtsVlQmY0QAAAABJRU5ErkJggg==';
    } catch (error) {
      this.logger.error(`Error generating filter thumbnail: ${error.message}`);
      return null;
    }
  }
}
