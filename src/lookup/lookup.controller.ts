import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { LookupService } from './lookup.service';
import { CreateLookupDto } from './dto/create-lookup.dto';

@Controller('lookup')
export class LookupController {
  private readonly logger = new Logger(LookupController.name);

  constructor(private readonly lookupService: LookupService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async getIpInfo(@Body() createLookupDto: CreateLookupDto) {
    const { ip } = createLookupDto;
    this.logger.log(`Received request to lookup IP: ${ip}`);

    try {
      const result = await this.lookupService.getOrCreateLookup(ip);
      return result;
    } catch (error) {
      this.logger.error(`Error looking up IP ${ip}: ${error.message}`);
      throw new HttpException(
        'Failed to lookup IP address',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Delete(':ip')
  async deleteIpInfo(@Param('ip') ip: string) {
    this.logger.log(`Received request to delete IP: ${ip}`);

    const result = await this.lookupService.deleteLookup(ip);
    if (!result) {
      this.logger.warn(`IP address ${ip} not found`);
      throw new HttpException('IP address not found', HttpStatus.NOT_FOUND);
    }

    this.logger.log(`IP address ${ip} successfully deleted`);
    return { message: `IP ${ip} successfully deleted` };
  }

  @Get(':ip')
  async getLookup(@Param('ip') ip: string) {
    this.logger.log(`Received request to fetch IP info: ${ip}`);

    const result = await this.lookupService.getLookup(ip);

    if (!result) {
      this.logger.warn(`IP address ${ip} not found`);
      throw new HttpException('IP address not found', HttpStatus.NOT_FOUND);
    }

    return result;
  }
}
