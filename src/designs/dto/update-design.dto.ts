import {
  IsString,
  IsUUID,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PresetFilterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  filter?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    sepia?: number;
  };
}

class TextOverlayDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsOptional()
  fontSize?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  fontFamily?: string;

  @IsOptional()
  isBold?: boolean;

  @IsOptional()
  isItalic?: boolean;

  @IsOptional()
  isVisible?: boolean;
}

class PositionDto {
  @IsOptional()
  x?: number;

  @IsOptional()
  y?: number;

  @IsOptional()
  rotation?: number;

  @IsOptional()
  scale?: number;
}

export class UpdateDesignDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  imageId?: string;

  @IsUUID()
  @IsOptional()
  logoId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PresetFilterDto)
  preset?: PresetFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TextOverlayDto)
  textOverlay?: TextOverlayDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PositionDto)
  position?: PositionDto;

  @IsString()
  @IsOptional()
  collectionId?: string;

  @IsOptional()
  designState?: any;
}
