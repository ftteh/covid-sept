import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status with environment info', () => {
      mockConfigService.get.mockReturnValue('development');

      const result = service.getHealth();

      expect(result).toMatchObject({
        status: 'ok',
        service: 'health-declaration-api',
        version: '1.0.0',
        environment: 'development',
        database: 'connected',
      });
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV', 'development');
    });

    it('should handle missing environment variable', () => {
      mockConfigService.get.mockReturnValue('development');

      const result = service.getHealth();

      expect(result.environment).toBe('development');
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV', 'development');
    });
  });

  describe('getRoot', () => {
    it('should return API information with default prefix', () => {
      mockConfigService.get.mockReturnValue('api');

      const result = service.getRoot();

      expect(result).toEqual({
        message: 'Health Declaration API is running',
        documentation: '/api/docs',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          declarations: '/api/health-declarations',
          docs: '/api/docs',
        },
      });
      expect(configService.get).toHaveBeenCalledWith('API_PREFIX', 'api');
    });

    it('should handle custom API prefix', () => {
      mockConfigService.get.mockReturnValue('v1');

      const result = service.getRoot();

      expect(result).toEqual({
        message: 'Health Declaration API is running',
        documentation: '/v1/docs',
        version: '1.0.0',
        endpoints: {
          health: '/v1/health',
          declarations: '/v1/health-declarations',
          docs: '/v1/docs',
        },
      });
    });
  });
}); 