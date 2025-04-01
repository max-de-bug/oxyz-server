import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FilterDto {
  @IsOptional()
  brightness?: number;

  @IsOptional()
  contrast?: number;

  @IsOptional()
  saturation?: number;

  @IsOptional()
  sepia?: number;

  @IsOptional()
  opacity?: number;
}

class TextOverlayDto {
  @IsString()
  text: string;

  @IsString()
  color: string;

  @IsString()
  fontFamily: string;

  @IsOptional()
  fontSize?: number;

  @IsOptional()
  isBold?: boolean;

  @IsOptional()
  isItalic?: boolean;

  @IsOptional()
  isVisible?: boolean;
}

class LogoPositionDto {
  @IsString()
  url: string;

  @IsObject()
  position: { x: number; y: number };

  @IsOptional()
  size?: number;
}

export class CreateDesignDto {
  @IsString()
  name: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterDto)
  filter?: FilterDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TextOverlayDto)
  textOverlay?: TextOverlayDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogoPositionDto)
  logos?: LogoPositionDto[];

  @IsString()
  aspectRatio: string;
}
