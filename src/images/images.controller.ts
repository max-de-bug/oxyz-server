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
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Controller('images')
@UseGuards(SupabaseAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Log upload attempt
    console.log(
      `Uploading file: ${file.originalname}, mime: ${file.mimetype}, size: ${file.size}`,
    );

    // Upload directly to Cloudinary
    const result = await this.imagesService.uploadImage(file, req.user.id);
    return result;
  }

  @Get('user/:userId')
  async getUserImages(@Param('userId') userId: string) {
    return this.imagesService.getUserImages(userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.imagesService.remove(id, userId);
  }

  @Delete('cloudinary/:publicId')
  async removeFromCloudinary(
    @Param('publicId') publicId: string,
    @Query('folder') folder: string = 'images',
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.imagesService.deleteImage(publicId, userId, folder);
  }
}
