import { IsIP, IsNotEmpty } from 'class-validator';

export class LookupDto {
  @IsIP()
  @IsNotEmpty()
  ip: string;
}
