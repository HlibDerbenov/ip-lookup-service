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
} from '@nestjs/common';
import { LookupService } from './lookup.service';
import { CreateLookupDto } from './dto/create-lookup.dto';

@Controller('lookup')
export class LookupController {
  private readonly logger = new Logger(LookupController.name);

  constructor(private readonly lookupService: LookupService) {}

  @Post()
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
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':ip')
  async deleteIpInfo(@Param('ip') ip: string) {
    this.logger.log(`Received request to delete IP: ${ip}`);

    try {
      const result = await this.lookupService.deleteLookup(ip);
      if (!result) {
        throw new HttpException('IP address not found', HttpStatus.NOT_FOUND);
      }
      return { message: `IP ${ip} successfully deleted` };
    } catch (error) {
      this.logger.error(`Error deleting IP ${ip}: ${error.message}`);
      throw new HttpException(
        'Failed to delete IP address',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':ip')
  async getLookup(@Param('ip') ip: string) {
    this.logger.log(`Received request to fetch IP info: ${ip}`);

    try {
      const result = await this.lookupService.getLookup(ip);
      if (!result) {
        throw new HttpException('IP address not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error fetching IP info for ${ip}: ${error.message}`);
      throw new HttpException(
        'Failed to fetch IP address info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
