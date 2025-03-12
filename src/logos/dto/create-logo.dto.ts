import { IsBoolean, IsOptional } from 'class-validator';

export class CreateLogoDto {
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
