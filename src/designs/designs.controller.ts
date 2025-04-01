import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { SupabaseAuthGuard } from '../auth/guards/auth.guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('designs')
@UseGuards(SupabaseAuthGuard)
export class DesignsController {
  constructor(
    private readonly designsService: DesignsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  async saveDesign(@Req() req, @Body() createDesignDto: CreateDesignDto) {
    const userId = req.user.id;
    return await this.designsService.saveDesign(userId, createDesignDto);
  }

  @Get()
  async getDesigns(@Req() req) {
    const userId = req.user.id;
    return await this.designsService.getDesigns(userId);
  }

  @Delete(':id')
  async deleteDesign(@Req() req, @Param('id') designId: string) {
    const userId = req.user.id;
    return await this.designsService.deleteDesign(userId, designId);
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

      // Remove the second argument since getResourcesByFolder only accepts the folder path
      const result =
        await this.cloudinaryService.getResourcesByFolder(folderPath);

      // If you need to limit results, do it after getting the response
      if (result.resources && maxResults) {
        result.resources = result.resources.slice(0, maxResults);
        result.total = Math.min(result.total || 0, maxResults);
      }

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to get assets by folder: ${error.message}`,
      );
    }
  }
}
