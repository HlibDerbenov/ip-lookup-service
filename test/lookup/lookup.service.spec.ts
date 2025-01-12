import { Test, TestingModule } from '@nestjs/testing';
import { LookupService } from '../../src/lookup/lookup.service';
import { CacheService } from '../../src/cache/cache.service';
import { DeleteResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lookup } from '../../src/lookup/lookup.entity';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LookupService', () => {
  let lookupService: LookupService;
  let cacheService: CacheService;
  let lookupRepository: Repository<Lookup>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LookupService,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Lookup),
          useClass: Repository,
        },
      ],
    }).compile();

    lookupService = module.get<LookupService>(LookupService);
    cacheService = module.get<CacheService>(CacheService);
    lookupRepository = module.get<Repository<Lookup>>(
      getRepositoryToken(Lookup),
    );

    jest.spyOn(lookupRepository, 'findOne').mockImplementation((query: any) => {
      if (query.where?.ip === '8.8.8.8') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });

    jest.spyOn(lookupRepository, 'create').mockImplementation(
      (data: Partial<Lookup>) =>
        ({
          id: 'uuid',
          ...data,
          createdAt: new Date(),
        }) as Lookup,
    );
  });

  it('should return cached result if available', async () => {
    jest.spyOn(cacheService, 'get').mockResolvedValue(
      JSON.stringify({
        ip: '1.1.1.1',
        country: 'USA',
        region: 'California',
        city: 'Los Angeles',
      }),
    );

    const result = await lookupService.getOrCreateLookup('1.1.1.1');
    expect(cacheService.get).toHaveBeenCalledWith('1.1.1.1');
    expect(result).toEqual({
      ip: '1.1.1.1',
      country: 'USA',
      region: 'California',
      city: 'Los Angeles',
    });
  });

  it('should fetch from API and save to cache if no cached result', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        ip: '8.8.8.8',
        country: 'USA',
        region: 'California',
        city: 'Mountain View',
      },
    });

    const saveSpy = jest.spyOn(lookupRepository, 'save').mockResolvedValue({
      id: 'uuid',
      ip: '8.8.8.8',
      country: 'USA',
      region: 'California',
      city: 'Mountain View',
      isp: 'Google LLC',
      timezone: 'America/Los_Angeles',
      createdAt: new Date(),
    });

    const result = await lookupService.getOrCreateLookup('8.8.8.8');
    expect(mockedAxios.get).toHaveBeenCalled();
    expect(cacheService.set).toHaveBeenCalledWith(
      '8.8.8.8',
      JSON.stringify(result),
      60,
    );
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should throw error if IP is invalid', async () => {
    mockedAxios.get.mockRejectedValueOnce(new HttpException('Invalid IP', 400));

    await expect(lookupService.getOrCreateLookup('invalid-ip')).rejects.toThrow(
      HttpException,
    );
  });

  it('should fetch from cache if available', async () => {
    const mockIp = '8.8.8.8';
    const cachedData = JSON.stringify({
      id: 'uuid',
      ip: mockIp,
      country: 'USA',
      region: 'California',
      city: 'Mountain View',
      isp: 'Google LLC',
      timezone: 'America/Los_Angeles',
      createdAt: new Date(),
    });

    jest.spyOn(cacheService, 'get').mockResolvedValue(cachedData);

    const result = await lookupService.getOrCreateLookup(mockIp);

    expect(cacheService.get).toHaveBeenCalledWith(mockIp);
    expect(result).toEqual(JSON.parse(cachedData));
  });

  it('should fetch lookup from MongoDB', async () => {
    const mockIp = '8.8.8.8';
    const lookupData = {
      id: 'uuid',
      ip: mockIp,
      country: 'USA',
      region: 'California',
      city: 'Mountain View',
      isp: 'Google LLC',
      timezone: 'America/Los_Angeles',
      createdAt: new Date(),
    };

    jest.spyOn(lookupRepository, 'findOne').mockResolvedValue(lookupData);

    const result = await lookupService.getLookup(mockIp);

    expect(lookupRepository.findOne).toHaveBeenCalledWith({
      where: { ip: mockIp },
    });
    expect(result).toEqual(lookupData);
  });

  it('should delete lookup from both MongoDB and Redis', async () => {
    const mockIp = '8.8.8.8';

    jest.spyOn(lookupRepository, 'delete').mockResolvedValue({
      raw: {},
      affected: 1,
    } as DeleteResult);

    jest.spyOn(cacheService, 'delete').mockResolvedValue();

    const result = await lookupService.deleteLookup(mockIp);

    expect(lookupRepository.delete).toHaveBeenCalledWith({ ip: mockIp });
    expect(cacheService.delete).toHaveBeenCalledWith(mockIp);
    expect(result).toBe(true);
  });
});
