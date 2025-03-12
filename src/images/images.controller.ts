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
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('images')
@UseGuards(JwtAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async findAll(
    @Req() req,
    @Query('source') source?: string,
    @Query('folder') folder?: string,
  ) {
    const userId = req.user.id;

    if (source === 'cloudinary') {
      return this.imagesService.findAllFromCloudinary(
        folder || 'images',
        userId,
      );
    }

    return this.imagesService.findAll(userId);
  }

  @Get('cloudinary/:publicId')
  async findOneFromCloudinary(@Param('publicId') publicId: string, @Req() req) {
    const userId = req.user.id;
    return this.imagesService.findOneFromCloudinary(publicId, userId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.imagesService.create(file, createImageDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.imagesService.update(id, updateImageDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.imagesService.remove(id, userId);
  }
}
