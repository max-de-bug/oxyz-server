import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FiltersService } from './filters.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('filters')
@Controller('filters')
@UseGuards(SupabaseAuthGuard)
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new filter' })
  @ApiResponse({
    status: 201,
    description: 'The filter has been successfully created',
  })
  async create(@Body() createFilterDto: CreateFilterDto, @Req() req) {
    try {
      const userId = req.user.id;
      return this.filtersService.create(createFilterDto, userId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create filter: ${error.message}`,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all filters for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all filters for the current user',
  })
  async findAll(
    @Req() req,
    @Query('includeDefaults') includeDefaults?: string,
  ) {
    try {
      const userId = req.user.id;
      const includeDefaultsFlag = includeDefaults !== 'false';
      return this.filtersService.findAll(userId, {
        includeDefaults: includeDefaultsFlag,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch filters: ${error.message}`,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a filter by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a filter by ID',
  })
  async findOne(@Param('id') id: string, @Req() req) {
    try {
      const userId = req.user.id;
      return this.filtersService.findOne(id, userId);
    } catch (error) {
      throw new BadRequestException(`Failed to fetch filter: ${error.message}`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a filter' })
  @ApiResponse({
    status: 200,
    description: 'The filter has been successfully deleted',
  })
  async remove(@Param('id') id: string, @Req() req) {
    try {
      const userId = req.user.id;
      return this.filtersService.remove(id, userId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete filter: ${error.message}`,
      );
    }
  }
}
