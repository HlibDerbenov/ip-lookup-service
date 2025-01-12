import { IsIP } from 'class-validator';

export class CreateLookupDto {
  @IsIP()
  ip: string;
}
