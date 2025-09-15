import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) { }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'health-declaration-api',
      version: '1.0.0',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      database: 'connected',
    };
  }

  getRoot() {
    const apiPrefix = this.configService.get<string>('API_PREFIX', 'api');

    return {
      message: 'Health Declaration API is running',
      documentation: `/${apiPrefix}/docs`,
      version: '1.0.0',
      endpoints: {
        health: `/${apiPrefix}/health`,
        declarations: `/${apiPrefix}/health-declarations`,
        docs: `/${apiPrefix}/docs`,
      },
    };
  }
} 