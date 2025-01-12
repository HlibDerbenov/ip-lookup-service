import { Module } from '@nestjs/common';
import { LookupModule } from './lookup/lookup.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LookupModule,
    DatabaseModule,
    CacheModule,
  ],
})
export class AppModule {}
