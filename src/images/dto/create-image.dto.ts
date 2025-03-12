import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
