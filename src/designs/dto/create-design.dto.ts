import {
  IsString,
  IsUUID,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Placeholder, SQL } from 'drizzle-orm';

class PresetFilterDto {
  @IsString()
  name: string;

  @IsObject()
  filter: {
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

export class CreateDesignDto {
  designState(designState: any) {
    throw new Error('Method not implemented.');
  }
  name: string;
  imageId: string;
  logoId?: string;
  preset: {
    name: string;
    filter: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      sepia?: number;
    };
  };
  textOverlay: {
    text: string;
    fontSize: number;
    color: string;
    fontFamily: string;
    isBold: boolean;
    isItalic: boolean;
    isVisible: boolean;
  };
  position: {
    translationX: number;
    translationY: number;
    rotation: number;
    minSize: number;
    maxSize: number;
    spacing: number;
  };
  collectionId: number;
}
