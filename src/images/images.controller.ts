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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { SupabaseAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('images')
@UseGuards(SupabaseAuthGuard)
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

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('source') source: string,
    @Req() req,
  ) {
    const userId = req.user?.id;
    return this.imagesService.remove(id, userId, source);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.imagesService.uploadImage(file);
  }

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
}
