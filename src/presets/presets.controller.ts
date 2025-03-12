import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PresetsService } from './presets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('presets')
@UseGuards(JwtAuthGuard)
export class PresetsController {
  constructor(private readonly presetsService: PresetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all presets for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all presets for the current user',
  })
  async findAll(
    @Req() req,
    @Query('source') source?: string,
    @Query('folder') folder?: string,
    @Query('includeDefaults') includeDefaults?: string,
  ) {
    const userId = req.user.id;
    console.log('PRESETS CONTROLLER: findAll called with source =', source);

    if (source === 'cloudinary') {
      console.log('PRESETS CONTROLLER: Fetching from Cloudinary');
      return this.presetsService.findAllFromCloudinary(
        folder || 'presets',
        userId,
        { includeDefaults: includeDefaults !== 'false' },
      );
    }

    console.log('PRESETS CONTROLLER: Fetching from database');
    return this.presetsService.findAll(userId);
  }

  @Get('cloudinary')
  @ApiOperation({
    summary: 'Get all presets from Cloudinary for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all presets from Cloudinary for the current user',
  })
  findAllFromCloudinary(
    @Req() req,
    @Query('includeDefaults') includeDefaults?: string,
  ) {
    try {
      console.log('CONTROLLER ENTRY POINT: findAllFromCloudinary called');
      console.log('CONTROLLER ENTRY POINT: req.user =', req.user);

      if (!req.user || !req.user.id) {
        console.error('CONTROLLER ERROR: User not authenticated or missing ID');
        return { resources: [] };
      }

      const includeDefaultsBool = includeDefaults
        ? includeDefaults === 'true'
        : true;

      console.log('CONTROLLER ENTRY POINT: Calling service method');
      return this.presetsService.findAllFromCloudinary('presets', req.user.id, {
        includeDefaults: includeDefaultsBool,
      });
    } catch (error) {
      console.error('CONTROLLER ERROR:', error);
      return { resources: [] };
    }
  }

  @Get('cloudinary/paginated')
  @ApiOperation({
    summary: 'Get paginated presets from Cloudinary for the current user',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns paginated presets from Cloudinary for the current user',
  })
  findAllFromCloudinaryWithPagination(
    @Req() req,
    @Query('maxResults') maxResults?: number,
    @Query('nextCursor') nextCursor?: string,
    @Query('includeDefaults') includeDefaults?: string,
  ) {
    const includeDefaultsBool = includeDefaults
      ? includeDefaults === 'true'
      : true;
    return this.presetsService.findAllFromCloudinaryWithPagination(
      'presets',
      req.user.id,
      {
        maxResults: maxResults ? Number(maxResults) : undefined,
        nextCursor: nextCursor || undefined,
        includeDefaults: includeDefaultsBool,
      },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a preset by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a preset by ID',
  })
  findOne(@Param('id') id: string, @Req() req) {
    return this.presetsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new preset' })
  @ApiResponse({
    status: 201,
    description: 'The preset has been successfully created',
  })
  create(@Body() createPresetDto: any, @Req() req) {
    return this.presetsService.create(createPresetDto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a preset' })
  @ApiResponse({
    status: 200,
    description: 'The preset has been successfully updated',
  })
  update(@Param('id') id: string, @Body() updatePresetDto: any, @Req() req) {
    return this.presetsService.update(id, updatePresetDto, req.user.id);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set a preset as default' })
  @ApiResponse({
    status: 200,
    description: 'The preset has been successfully set as default',
  })
  setDefault(@Param('id') id: string, @Req() req) {
    return this.presetsService.setDefault(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a preset' })
  @ApiResponse({
    status: 200,
    description: 'The preset has been successfully deleted',
  })
  remove(@Param('id') id: string, @Req() req) {
    return this.presetsService.remove(id, req.user.id);
  }
}
