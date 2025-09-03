import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class UpdateUsernameDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Username can only contain letters, numbers, periods, underscores, and hyphens',
  })
  username: string;
}
