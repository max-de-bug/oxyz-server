import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { LogosService } from './logos.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';

import { SupabaseAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('logos')
@UseGuards(SupabaseAuthGuard)
export class LogosController {
  constructor(private readonly logosService: LogosService) {}

  @Get()
  async findAll(
    @Req() req,
    @Query('source') source?: string,
    @Query('folder') folder?: string,
    @Query('includeDefaults') includeDefaults?: string,
  ) {
    const userId = req.user.id;

    if (source === 'cloudinary') {
      return this.logosService.findAllFromCloudinary(
        folder || 'logos',
        userId,
        { includeDefaults: includeDefaults !== 'false' },
      );
    }

    return this.logosService.findAll(userId);
  }

  @Get('cloudinary/:publicId')
  async findOneFromCloudinary(@Param('publicId') publicId: string, @Req() req) {
    const userId = req.user.id;
    return this.logosService.findOneFromCloudinary(publicId, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.logosService.findOne(id, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLogoDto: UpdateLogoDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.logosService.update(id, updateLogoDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.logosService.remove(id, userId);
  }
}
