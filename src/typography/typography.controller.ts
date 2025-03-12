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
import { TypographyService } from './typography.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateTypographyDto } from './dto/update-typography.dto';
import { CreateTypographyDto } from './dto/create-typography.dto';

@Controller('typography')
@UseGuards(JwtAuthGuard)
export class TypographyController {
  constructor(private readonly typographyService: TypographyService) {}

  @Get()
  async findAll(
    @Req() req,
    @Query('source') source?: string,
    @Query('folder') folder?: string,
  ) {
    const userId = req.user.id;

    if (source === 'cloudinary') {
      return this.typographyService.findAllFromCloudinary(
        folder || 'typography',
        userId,
      );
    }

    return this.typographyService.findAll(userId);
  }

  @Get('cloudinary/:publicId')
  async findOneFromCloudinary(@Param('publicId') publicId: string, @Req() req) {
    const userId = req.user.id;
    return this.typographyService.findOneFromCloudinary(publicId, userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createTypographyDto: CreateTypographyDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.typographyService.create(file, createTypographyDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTypographyDto: UpdateTypographyDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.typographyService.update(id, updateTypographyDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.typographyService.remove(id, userId);
  }
}
