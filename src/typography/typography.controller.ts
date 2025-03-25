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
import { UpdateTypographyDto } from './dto/update-typography.dto';
import { CreateTypographyDto } from './dto/create-typography.dto';
import { SupabaseAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('typography')
@UseGuards(SupabaseAuthGuard)
export class TypographyController {
  constructor(private readonly typographyService: TypographyService) {}

  @Get('public')
  getPublicTypography() {
    // ...
  }

  @Get()
  getTypography(@Req() req) {
    const userId = req.user.id;
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
