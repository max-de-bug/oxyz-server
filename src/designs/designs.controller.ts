import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SupabaseAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('designs')
@UseGuards(SupabaseAuthGuard) // Apply JWT guard to all routes by default
export class DesignsController {
  constructor(
    private readonly designsService: DesignsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Get all designs for the current user
   */
  @Get()
  async findAll(@Req() req, @Query('collection') collectionId?: string) {
    // Get the user ID from the JWT token (added by JwtAuthGuard)
    const userId = req.user.id;
    return this.designsService.findAll(userId, collectionId);
  }

  /**
   * Get a specific design by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.designsService.findOne(id, userId);
  }

  /**
   * Create a new design
   */
  @Post()
  async create(@Body() createDesignDto: CreateDesignDto, @Req() req) {
    const userId = req.user.id;
    return this.designsService.create(createDesignDto, userId);
  }

  /**
   * Upload a design image directly to Cloudinary
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDesignImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Query('type') type: string = 'design',
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.id;
    const folder = `users/${userId}/${type}s`;

    try {
      // Extract metadata from the request body
      const name = body.name || 'Untitled Design';
      let designState = {};

      // Parse design state if provided
      if (body.designState) {
        try {
          designState =
            typeof body.designState === 'string'
              ? JSON.parse(body.designState)
              : body.designState;
        } catch (parseError) {
          console.error('Error parsing design state:', parseError);
          // Continue with empty design state
        }
      }

      // Prepare context for Cloudinary
      const context = {
        name: name,
        designState: JSON.stringify(designState),
      };
      // Upload to Cloudinary with metadata
      const result = await this.cloudinaryService.uploadFile(file, folder);

      // Return the upload result
      return {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        name: name,
        designState: designState,
      };
    } catch (error) {
      console.error('Upload failed:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple design assets to Cloudinary
   */
  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
    @Query('type') type: string = 'design',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const userId = req.user.id;
    const folder = `users/${userId}/${type}s`;

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const result = await this.cloudinaryService.uploadFile(file, folder);

          return {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
          };
        }),
      );

      return results;
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Update an existing design
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDesignDto: UpdateDesignDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.designsService.update(id, updateDesignDto, userId);
  }

  /**
   * Delete a design
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.designsService.remove(id, userId);
  }

  /**
   * Delete a design asset from Cloudinary
   */
  @Delete('asset/:publicId')
  async deleteAsset(@Param('publicId') publicId: string, @Req() req) {
    const userId = req.user.id;

    try {
      const result = await this.cloudinaryService.deleteFile(publicId);
      return { success: true, result };
    } catch (error) {
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Search for design assets in Cloudinary
   */
  @Get('search/:query')
  async searchAssets(
    @Param('query') query: string,
    @Req() req,
    @Query('maxResults') maxResults: number = 100,
  ) {
    const userId = req.user.id;

    try {
      // Build a search expression that includes the user's ID as a tag
      const expression = `tags:${userId} AND ${query}`;
      const result = await this.cloudinaryService.search(expression, {
        maxResults,
      });

      return result;
    } catch (error) {
      throw new BadRequestException(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get design assets by tag
   */
  @Get('assets/tag/:tag')
  async getAssetsByTag(
    @Param('tag') tag: string,
    @Req() req,
    @Query('maxResults') maxResults: number = 100,
  ) {
    const userId = req.user.id;

    try {
      // Combine the user's ID with the requested tag
      const combinedTag = `${userId}_${tag}`;
      const result = await this.cloudinaryService.getResourcesByTag(
        combinedTag,
        { max_results: maxResults },
      );

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to get assets by tag: ${error.message}`,
      );
    }
  }

  /**
   * Get design assets by folder
   */
  @Get('assets/folder/:folder')
  async getAssetsByFolder(
    @Param('folder') folder: string,
    @Req() req,
    @Query('maxResults') maxResults: number = 100,
  ) {
    const userId = req.user.id;

    try {
      // Ensure the folder path includes the user's ID for security
      let folderPath = folder;
      if (!folderPath.startsWith(`users/${userId}`)) {
        folderPath = `users/${userId}/${folderPath}`;
      }

      const result = await this.cloudinaryService.getResourcesByFolder(
        folderPath,
        { max_results: maxResults },
      );

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to get assets by folder: ${error.message}`,
      );
    }
  }

  /**
   * Export a design
   */
  @Post(':id/export')
  async exportDesign(
    @Param('id') id: string,
    @Body() exportOptions: any,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.designsService.exportDesign(id, exportOptions, userId);
  }

  /**
   * Create a zip of design assets
   */
  @Post('assets/zip')
  async createZip(@Body() body: { publicIds: string[] }, @Req() req) {
    const userId = req.user.id;

    try {
      // Ensure all public IDs belong to the user
      const validPublicIds = body.publicIds.filter((id) =>
        id.includes(`users/${userId}`),
      );

      if (validPublicIds.length === 0) {
        throw new BadRequestException('No valid assets to include in zip');
      }

      const zipUrl = await this.cloudinaryService.createZip(validPublicIds);
      return { url: zipUrl };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create zip archive: ${error.message}`,
      );
    }
  }
}
