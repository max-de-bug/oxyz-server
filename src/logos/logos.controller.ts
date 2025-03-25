import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogosService } from './logos.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import multer from 'multer';

import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
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

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createLogoDto: CreateLogoDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.logosService.create(file, createLogoDto, userId);
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

  @Post(':id/set-default')
  async setDefault(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.logosService.setDefault(id, userId);
  }

  @Get('public')
  getPublicLogos() {
    // Implementation
  }
}
