import { Module } from '@nestjs/common';
import { LookupModule } from './lookup/lookup.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [LookupModule, DatabaseModule, CacheModule],
})
export class AppModule {}
