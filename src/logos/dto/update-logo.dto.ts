import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLogoDto {
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
