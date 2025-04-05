import { Module } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { FiltersController } from './filters.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [CloudinaryModule, DrizzleModule],
  controllers: [FiltersController],
  providers: [FiltersService],
  exports: [FiltersService],
})
export class FiltersModule {}
