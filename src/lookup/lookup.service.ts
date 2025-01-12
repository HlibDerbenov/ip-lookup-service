import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lookup } from './lookup.entity';
import axios from 'axios';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class LookupService {
  constructor(
    @InjectRepository(Lookup)
    private readonly lookupRepository: Repository<Lookup>,
    private readonly cacheService: CacheService,
  ) {}

  async getOrCreateLookup(ip: string): Promise<Lookup> {
    // Попробуем получить данные из Redis
    const cached = await this.cacheService.get(ip);
    if (cached) {
      return JSON.parse(cached);
    }

    // Проверяем в базе данных
    const lookup = await this.lookupRepository.findOne({ where: { ip } });
    if (lookup) {
      return lookup;
    }

    // Если данных нет в кэше и базе, запрашиваем API
    const apiResponse = await this.fetchIpInfoFromApi(ip);
    const newLookup = this.lookupRepository.create({
      ip,
      ...apiResponse,
    });
    await this.lookupRepository.save(newLookup);

    // Сохраняем данные в Redis
    await this.cacheService.set(ip, JSON.stringify(newLookup), 60); // TTL 60 секунд
    return newLookup;
  }

  async deleteLookup(ip: string): Promise<boolean> {
    // Удаляем из базы данных
    const deleteResult = await this.lookupRepository.delete({ ip });
    // Удаляем из Redis
    await this.cacheService.delete(ip);
    return deleteResult.affected > 0;
  }

  async getLookup(ip: string): Promise<Lookup> {
    const lookup = await this.lookupRepository.findOne({ where: { ip } });
    if (!lookup) {
      throw new HttpException('IP not found', HttpStatus.NOT_FOUND);
    }
    return lookup;
  }

  private async fetchIpInfoFromApi(ip: string) {
    const { data } = await axios.get(`https://ipwhois.app/json/${ip}`);
    if (!data || data.success === false) {
      throw new HttpException(
        'Failed to fetch IP info from API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      country: data.country,
      region: data.region,
      city: data.city,
      isp: data.isp,
      timezone: data.timezone,
    };
  }
}
