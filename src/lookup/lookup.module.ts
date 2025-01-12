import { Module } from '@nestjs/common';
import { LookupService } from './lookup.service';
import { LookupController } from './lookup.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lookup } from './lookup.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lookup]), CacheModule],
  controllers: [LookupController],
  providers: [LookupService],
})
export class LookupModule {}
