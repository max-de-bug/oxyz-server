import { IsBoolean, IsOptional } from 'class-validator';

export class CreateTypographyDto {
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
