import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTypographyDto {
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
