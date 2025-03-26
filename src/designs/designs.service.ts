import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import {
  designs,
  designExports,
  sharedDesigns,
  images,
} from '../drizzle/schema';
import { eq, and, inArray, SQL } from 'drizzle-orm';
import { ImagesService } from '../images/images.service';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { createCanvas, loadImage } from 'canvas';
import { v4 as uuidv4 } from 'uuid';
import { LogosService } from 'src/logos/logos.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Fix the CanvasRenderingContext2D interface declaration
declare global {
  namespace NodeJS {
    interface CanvasRenderingContext2D {
      filter: string;
    }
  }
}

@Injectable()
export class DesignsService {
  constructor(
    private drizzle: DrizzleService,
    private imagesService: ImagesService,
    private logosService: LogosService,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Find all designs for a user from both database and Cloudinary
   */
  async findAll(userId: string, collectionId?: string) {
    // Start with the base condition that is always applied
    let conditions: SQL<unknown>[] = [eq(designs.userId, userId)];

    // If collectionId is provided, add it to the conditions
    if (collectionId) {
      conditions.push(eq(designs.collectionId, collectionId));
    }

    // Apply all conditions in a single where clause
    const dbResults = await this.drizzle.db
      .select()
      .from(designs)
      .where(and(...conditions))
      .orderBy(designs.createdAt);

    // Map database results
    const dbDesigns = dbResults.map((design) => {
      try {
        return {
          ...design,
          designState: this.parseDesignState(design.designState),
          source: 'database',
        };
      } catch (error) {
        console.error('Error parsing design state:', error);
        return {
          ...design,
          designState: {},
          source: 'database',
        };
      }
    });

    try {
      // Check if Cloudinary is properly configured
      if (
        !this.cloudinaryService ||
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        console.warn(
          'Cloudinary is not properly configured. Skipping Cloudinary designs.',
        );
        return dbDesigns;
      }

      // Fetch designs from Cloudinary
      const cloudinaryFolder = `users/${userId}/designs`;
      const cloudinaryResults =
        await this.cloudinaryService.getResourcesByFolder(cloudinaryFolder);

      if (!cloudinaryResults || !cloudinaryResults.resources) {
        console.warn('No resources returned from Cloudinary');
        return dbDesigns;
      }

      // Map Cloudinary results to match design structure
      const cloudinaryDesigns = cloudinaryResults.resources
        .map((resource) => {
          try {
            // Extract metadata from tags or context if available
            const metadata = resource.context?.custom || {};
            const tags = resource.tags || [];

            // Try to extract design information from the filename or path
            const filename = resource.public_id.split('/').pop();
            const designId = resource.public_id;

            // Create a design object from Cloudinary resource
            return {
              id: designId,
              name: metadata.name || filename || 'Untitled Design',
              userId,
              imageData: JSON.stringify({
                imageId: metadata.imageId,
                logoId: metadata.logoId,
                publicId: resource.public_id,
                url: resource.secure_url,
              }),
              designState: metadata.designState || '{}',
              url: resource.secure_url,
              publicId: resource.public_id,
              createdAt: new Date(resource.created_at),
              updatedAt: new Date(resource.created_at),
              source: 'cloudinary',
              // Add any other fields that might be available
              width: resource.width,
              height: resource.height,
              format: resource.format,
            };
          } catch (resourceError) {
            console.error(
              'Error processing Cloudinary resource:',
              resourceError,
            );
            return null;
          }
        })
        .filter((design) => design !== null); // Filter out any failed conversions

      // Filter out Cloudinary designs that already exist in the database
      // to avoid duplicates (based on publicId if available)
      const dbPublicIds = new Set(
        dbDesigns
          .filter((design) => {
            try {
              const imageData =
                typeof design.imageData === 'string'
                  ? JSON.parse(design.imageData)
                  : design.imageData;
              return imageData?.publicId;
            } catch (error) {
              console.error('Error parsing imageData:', error);
              return false;
            }
          })
          .map((design) => {
            try {
              const imageData =
                typeof design.imageData === 'string'
                  ? JSON.parse(design.imageData)
                  : design.imageData;
              return imageData.publicId;
            } catch (error) {
              console.error('Error extracting publicId:', error);
              return null;
            }
          })
          .filter((id) => id !== null),
      );

      const uniqueCloudinaryDesigns = cloudinaryDesigns.filter(
        (design) => !dbPublicIds.has(design.publicId),
      );

      // Combine and sort results
      const allDesigns = [...dbDesigns, ...uniqueCloudinaryDesigns].sort(
        (a, b) => {
          try {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          } catch (error) {
            console.error('Error sorting designs:', error);
            return 0;
          }
        },
      );

      return allDesigns;
    } catch (error) {
      console.error('Error fetching designs from Cloudinary:', error);
      // If Cloudinary fetch fails, return only database results
      return dbDesigns;
    }
  }

  async findOne(id: string, userId: string) {
    const [design] = await this.drizzle.db
      .select()
      .from(designs)
      .where(and(eq(designs.id, id), eq(designs.userId, userId)));

    if (!design) {
      // Check if it's a shared design
      const [shared] = await this.drizzle.db
        .select()
        .from(sharedDesigns)
        .where(
          and(
            eq(sharedDesigns.designId, id),
            eq(sharedDesigns.sharedWithUserId, userId),
          ),
        );

      if (shared) {
        const [sharedDesign] = await this.drizzle.db
          .select()
          .from(designs)
          .where(eq(designs.id, id));

        if (sharedDesign) {
          return {
            ...sharedDesign,
            designState: this.parseDesignState(sharedDesign.designState),
            isShared: true,
            permissions: shared.permissions,
          };
        }
      }

      throw new NotFoundException(`Design with ID ${id} not found`);
    }

    return {
      ...design,
      designState: this.parseDesignState(design.designState),
    };
  }

  async create(createDesignDto: CreateDesignDto, userId: string) {
    const id = uuidv4();

    // Create a design state from the DTO properties
    const designState = {
      preset: createDesignDto.preset,
      textOverlay: createDesignDto.textOverlay,
      position: createDesignDto.position,
    };

    // Match the schema structure
    const newDesign = {
      id,
      name: createDesignDto.name,
      userId,
      imageData: JSON.stringify({
        imageId: createDesignDto.imageId,
        logoId: createDesignDto.logoId,
      }),
      designState: JSON.stringify(designState),
      collectionId: createDesignDto.collectionId
        ? String(createDesignDto.collectionId)
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.drizzle.db.insert(designs).values(newDesign);
    return this.findOne(id, userId);
  }

  async update(id: string, updateDesignDto: UpdateDesignDto, userId: string) {
    const existingDesign = await this.findOne(id, userId);
    const currentDesignState = this.parseDesignState(
      existingDesign.designState,
    );

    // Update design state with new values
    const updatedDesignState = {
      preset: updateDesignDto.preset || currentDesignState.preset,
      textOverlay:
        updateDesignDto.textOverlay || currentDesignState.textOverlay,
      position: updateDesignDto.position || currentDesignState.position,
    };

    // If designState is directly provided, use it instead
    const finalDesignState = updateDesignDto.designState || updatedDesignState;

    // Parse existing imageData
    const currentImageData = existingDesign.imageData
      ? JSON.parse(existingDesign.imageData as string)
      : {};

    // Update imageData with new values if provided
    const updatedImageData = {
      ...currentImageData,
      imageId: updateDesignDto.imageId || currentImageData.imageId,
      logoId: updateDesignDto.logoId || currentImageData.logoId,
    };

    const updatedDesign = {
      name: updateDesignDto.name ?? existingDesign.name,
      imageData: JSON.stringify(updatedImageData),
      designState: JSON.stringify(finalDesignState),
      collectionId: updateDesignDto.collectionId ?? existingDesign.collectionId,
      updatedAt: new Date(),
    };

    await this.drizzle.db
      .update(designs)
      .set(updatedDesign)
      .where(and(eq(designs.id, id), eq(designs.userId, userId)));

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const design = await this.findOne(id, userId);

    // Delete any associated exports from Cloudinary
    const exports = await this.drizzle.db
      .select()
      .from(designExports)
      .where(eq(designExports.designId, id));

    // Delete exports from Cloudinary
    for (const exportItem of exports) {
      if (exportItem.publicId) {
        try {
          await this.cloudinaryService.deleteFile(exportItem.publicId);
        } catch (error) {
          console.warn(
            `Failed to delete export from Cloudinary: ${error.message}`,
          );
        }
      }
    }

    // Delete the design from the database
    await this.drizzle.db
      .delete(designs)
      .where(and(eq(designs.id, id), eq(designs.userId, userId)));

    return { success: true };
  }

  async exportDesign(id: string, exportOptions: any, userId: string) {
    // Find the design
    const design = await this.findOne(id, userId);
    if (!design) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }

    try {
      // Parse imageData to get imageId and logoId
      const imageData = design.imageData
        ? JSON.parse(design.imageData as string)
        : {};

      // Get the image
      if (!imageData.imageId) {
        throw new Error('Design has no associated image');
      }

      const image = await this.imagesService.findOne(imageData.imageId, userId);

      // Get the logo if it exists
      let logo: any = null;
      if (imageData.logoId) {
        try {
          logo = await this.logosService.findOne(imageData.logoId, userId);
        } catch (error) {
          console.warn(`Logo not found for design ${id}: ${error.message}`);
        }
      }

      // Parse design state
      const designState = this.parseDesignState(design.designState);
      // Create a canvas with the image dimensions
      // The image object doesn't have width/height properties directly
      // We'll need to load the image first to get its dimensions
      const img = await loadImage(image.url);
      const canvas = createCanvas(img.width || 800, img.height || 600);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Apply design transformations if available
      if (designState) {
        // Apply preset filter if available
        // if (designState.preset?.filter) {
        //   const filter = designState.preset.filter;

        //   // Apply filters (simplified implementation)
        //   if (filter.brightness) {
        //     ctx.filter = `brightness(${filter.brightness})`;
        //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        //     ctx.filter = 'none';
        //   }

        //   if (filter.contrast) {
        //     ctx.filter = `contrast(${filter.contrast})`;
        //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        //     ctx.filter = 'none';
        //   }

        //   if (filter.saturation !== undefined) {
        //     ctx.filter = `saturate(${filter.saturation})`;
        //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        //     ctx.filter = 'none';
        //   }

        //   if (filter.sepia) {
        //     ctx.filter = `sepia(${filter.sepia})`;
        //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        //     ctx.filter = 'none';
        //   }
        // }

        // Draw logo if available
        if (logo) {
          const logoImg = await loadImage(logo.url);

          // Save context state
          ctx.save();

          // Apply transformations
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;

          // Position based on design settings
          const position = designState.position || {};
          const x = position.x || 0;
          const y = position.y || 0;
          const rotation = position.rotation || 0;
          const scale = position.scale || 1;

          // Apply transformations
          ctx.translate(centerX + x, centerY + y);
          ctx.rotate((rotation * Math.PI) / 180);

          // Draw logo centered at the transformed position
          const logoWidth = logoImg.width * scale;
          const logoHeight = logoImg.height * scale;
          ctx.drawImage(
            logoImg,
            -logoWidth / 2,
            -logoHeight / 2,
            logoWidth,
            logoHeight,
          );

          // Restore context state
          ctx.restore();
        }

        // Draw text overlay if available
        if (
          designState.textOverlay?.isVisible &&
          designState.textOverlay?.text
        ) {
          const textOverlay = designState.textOverlay;

          // Save context state
          ctx.save();

          // Set text properties
          ctx.fillStyle = textOverlay.color || '#ffffff';

          // Build font string
          const fontStyle = [
            textOverlay.isItalic ? 'italic' : '',
            textOverlay.isBold ? 'bold' : '',
            `${textOverlay.fontSize || 24}px`,
            textOverlay.fontFamily || 'Arial',
          ]
            .filter(Boolean)
            .join(' ');

          ctx.font = fontStyle;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Position text
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const position = designState.position || {};
          const x = position.x || 0;
          const y = position.y || 0;

          // Draw text
          ctx.fillText(textOverlay.text, centerX + x, centerY + y);

          // Restore context state
          ctx.restore();
        }
      }

      // Convert canvas to buffer
      const buffer = canvas.toBuffer('image/png');

      // Generate a unique filename
      const filename = `design_export_${id}_${Date.now()}.png`;

      // Prepare export options
      const cloudinaryOptions = {
        resource_type: 'image',
        format: exportOptions?.format || 'png',
        quality: exportOptions?.quality || 90,
        transformation: [
          { width: exportOptions?.width || 'auto' },
          { height: exportOptions?.height || 'auto' },
          { crop: 'limit' },
        ],
      };

      // Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadBuffer(
        buffer,
        `users/${userId}/exports`,
        filename,
        cloudinaryOptions,
      );

      // Save export record in database
      const exportId = uuidv4();
      await this.drizzle.db.insert(designExports).values({
        id: exportId,
        designId: id,
        userId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        options: exportOptions || {},
        createdAt: new Date(),
      });

      // Return the export URL and details
      return {
        id: exportId,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      };
    } catch (error) {
      console.error(`Error exporting design ${id}:`, error);
      throw new Error(`Failed to export design: ${error.message}`);
    }
  }

  /**
   * Helper method to parse design state
   */
  private parseDesignState(designState: any): any {
    if (!designState) return {};

    if (typeof designState === 'string') {
      try {
        return JSON.parse(designState);
      } catch (error) {
        console.error('Error parsing design state:', error);
        return {};
      }
    }

    // If it's already an object, ensure it's a valid design state
    if (typeof designState === 'object') {
      try {
        // Return a safe copy to avoid reference issues
        return JSON.parse(JSON.stringify(designState));
      } catch (error) {
        console.error('Error stringifying design state object:', error);
        return {};
      }
    }

    return {};
  }
}
