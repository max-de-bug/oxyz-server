import { Controller, Get, Param, UseGuards, Req, Query } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryResponse } from './interfaces/cloudinary.interfaces';
import { SupabaseAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('cloudinary')
@UseGuards(SupabaseAuthGuard)
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
    // Create search options object
    const searchOptions = {
      expression: `folder:${folder}`,
      max_results: maxResults ? parseInt(maxResults) : 100,
      next_cursor: nextCursor,
    };

    // Use searchResources instead of getResourcesByFolder
    return this.cloudinaryService.searchResources(
      `folder:${folder}`,
      searchOptions,
    );
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
