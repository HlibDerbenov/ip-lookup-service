import { Test, TestingModule } from '@nestjs/testing';
import { LookupController } from '../../src/lookup/lookup.controller';
import { LookupService } from '../../src/lookup/lookup.service';

describe('LookupController', () => {
  let lookupController: LookupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LookupController],
      providers: [
        {
          provide: LookupService,
          useValue: {
            getOrCreateLookup: jest.fn().mockResolvedValue({
              ip: '8.8.8.8',
              country: 'USA',
              region: 'California',
              city: 'Mountain View',
            }),
            deleteLookup: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    lookupController = module.get<LookupController>(LookupController);
  });

  it('should return IP info', async () => {
    const result = await lookupController.getIpInfo({ ip: '8.8.8.8' });
    expect(result).toEqual({
      ip: '8.8.8.8',
      country: 'USA',
      region: 'California',
      city: 'Mountain View',
    });
  });

  it('should delete cached IP info', async () => {
    const result = await lookupController.deleteIpInfo('8.8.8.8');
    expect(result).toEqual({ message: 'IP 8.8.8.8 successfully deleted' });
  });
});
