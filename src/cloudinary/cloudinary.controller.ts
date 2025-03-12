import { Controller, Get, Param, UseGuards, Req, Query } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryResponse } from './interfaces/cloudinary.interfaces';

@Controller('cloudinary')
@UseGuards(JwtAuthGuard)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('folders')
  async listFolders() {
    return this.cloudinaryService.listFolders();
  }

  @Get('folders/:folder')
  async listSubFolders(@Param('folder') folder: string) {
    return this.cloudinaryService.listSubFolders(folder);
  }

  @Get('resources')
  async getResources(
    @Query('folder') folder: string,
    @Query('max_results') maxResults?: string,
    @Query('next_cursor') nextCursor?: string,
  ): Promise<CloudinaryResponse> {
    return this.cloudinaryService.getResourcesByFolder(folder, {
      max_results: maxResults ? parseInt(maxResults) : 100,
      next_cursor: nextCursor,
    });
  }

  @Get('search')
  async searchResources(
    @Query('query') query: string,
    @Query('max_results') maxResults?: string,
    @Query('next_cursor') nextCursor?: string,
  ): Promise<CloudinaryResponse> {
    return this.cloudinaryService.searchResources(query, {
      max_results: maxResults ? parseInt(maxResults) : 100,
      next_cursor: nextCursor,
    });
  }
}
