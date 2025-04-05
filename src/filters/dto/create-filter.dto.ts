import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterValues {
  @ApiProperty({ description: 'Brightness value (0-200)', example: 100 })
  @IsNumber()
  @Min(0)
  @Max(200)
  @IsOptional()
  brightness?: number = 100;

  @ApiProperty({ description: 'Contrast value (0-200)', example: 100 })
  @IsNumber()
  @Min(0)
  @Max(200)
  @IsOptional()
  contrast?: number = 100;

  @ApiProperty({ description: 'Saturation value (0-200)', example: 100 })
  @IsNumber()
  @Min(0)
  @Max(200)
  @IsOptional()
  saturation?: number = 100;

  @ApiProperty({ description: 'Sepia value (0-100)', example: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  sepia?: number = 0;

  @ApiProperty({ description: 'Opacity value (0-100)', example: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  opacity?: number = 100;
}

export class CreateFilterDto {
  @ApiProperty({ description: 'Filter name', example: 'Summer Vibes' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Filter values',
    type: FilterValues,
    example: {
      brightness: 110,
      contrast: 120,
      saturation: 130,
      sepia: 10,
      opacity: 100,
    },
  })
  @IsObject()
  @IsNotEmpty()
  filter: FilterValues;
}
