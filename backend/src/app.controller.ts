import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the health status of the API',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
        uptime: { type: 'number', example: 3600.123 },
        service: { type: 'string', example: 'health-declaration-api' },
        version: { type: 'string', example: '1.0.0' },
        database: { type: 'string', example: 'connected' },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  @ApiOperation({
    summary: 'API root endpoint',
    description: 'Returns basic API information',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns API information',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Health Declaration API is running' },
        documentation: { type: 'string', example: '/api/docs' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getRoot() {
    return this.appService.getRoot();
  }
} 