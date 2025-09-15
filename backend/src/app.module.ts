import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { getDatabaseConfig } from './config/database.config';
import { getLoggerConfig } from './config/logger.config';
import { HealthDeclarationsModule } from './health-declarations/health-declarations.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
   
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),


    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getLoggerConfig,
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60000),
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),

    HealthDeclarationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 