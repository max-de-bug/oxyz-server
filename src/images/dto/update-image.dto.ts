import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateImageDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
