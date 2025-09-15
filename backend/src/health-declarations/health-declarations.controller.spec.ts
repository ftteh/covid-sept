import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthDeclarationsController } from './health-declarations.controller';
import { HealthDeclarationsService } from './health-declarations.service';
import { CreateHealthDeclarationDto } from './dto/create-health-declaration.dto';
import { UpdateHealthDeclarationDto } from './dto/update-health-declaration.dto';

describe('HealthDeclarationsController', () => {
  let controller: HealthDeclarationsController;
  let service: HealthDeclarationsService;

  const mockHealthDeclaration = {
    id: 'test-uuid',
    name: 'John Doe',
    temperature: 36.5,
    hasSymptoms: false,
    symptoms: null,
    hasContact: false,
    contactDetails: null,
    status: 'pending' as const,
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
  };

  const mockRequest = {
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    get: jest.fn().mockReturnValue('test-user-agent'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 100,
        }]),
      ],
      controllers: [HealthDeclarationsController],
      providers: [
        {
          provide: HealthDeclarationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<HealthDeclarationsController>(HealthDeclarationsController);
    service = module.get<HealthDeclarationsService>(HealthDeclarationsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateHealthDeclarationDto = {
      name: 'John Doe',
      temperature: 36.5,
      hasSymptoms: false,
      hasContact: false,
    };

    it('should create a health declaration', async () => {
      mockService.create.mockResolvedValue(mockHealthDeclaration);

      const result = await controller.create(createDto, mockRequest as any);

      expect(mockService.create).toHaveBeenCalledWith(
        createDto,
        '127.0.0.1',
        'test-user-agent'
      );
      expect(result).toEqual(mockHealthDeclaration);
    });

    it('should handle IP address extraction from socket when request.ip is not available', async () => {
      const requestWithoutIp = {
        ip: undefined,
        socket: { remoteAddress: '192.168.1.1' },
        get: jest.fn().mockReturnValue('test-user-agent'),
      };
      mockService.create.mockResolvedValue(mockHealthDeclaration);

      await controller.create(createDto, requestWithoutIp as any);

      expect(mockService.create).toHaveBeenCalledWith(
        createDto,
        '192.168.1.1',
        'test-user-agent'
      );
    });
  });

  describe('findAll', () => {
    const mockPaginatedResult = {
      data: [mockHealthDeclaration],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return paginated health declarations with default parameters', async () => {
      mockService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        status: undefined,
        search: undefined,
      });
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle query parameters', async () => {
      mockService.findAll.mockResolvedValue(mockPaginatedResult);

      await controller.findAll(2, 5, 'name', 'ASC', 'approved', 'John');

      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'ASC',
        status: 'approved',
        search: 'John',
      });
    });

    it('should apply bounds to page and limit parameters', async () => {
      mockService.findAll.mockResolvedValue(mockPaginatedResult);

      await controller.findAll(-1, 200); // Invalid values

      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 1, // Should be clamped to minimum 1
        limit: 100, // Should be clamped to maximum 100
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        status: undefined,
        search: undefined,
      });
    });

    it('should trim search parameter', async () => {
      mockService.findAll.mockResolvedValue(mockPaginatedResult);

      await controller.findAll(1, 10, 'createdAt', 'DESC', undefined, '  John  ');

      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        status: undefined,
        search: 'John',
      });
    });
  });

  describe('getStats', () => {
    const mockStats = {
      total: 10,
      pending: 3,
      approved: 5,
      rejected: 2,
      todaySubmissions: 1,
    };

    it('should return health declaration statistics', async () => {
      mockService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(mockService.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('findOne', () => {
    it('should return a health declaration by ID', async () => {
      mockService.findOne.mockResolvedValue(mockHealthDeclaration);

      const result = await controller.findOne('test-uuid');

      expect(mockService.findOne).toHaveBeenCalledWith('test-uuid');
      expect(result).toEqual(mockHealthDeclaration);
    });
  });

  describe('update', () => {
    const updateDto: UpdateHealthDeclarationDto = {
      status: 'approved',
    };

    it('should update a health declaration', async () => {
      const updatedDeclaration = { ...mockHealthDeclaration, status: 'approved' as const };
      mockService.update.mockResolvedValue(updatedDeclaration);

      const result = await controller.update('test-uuid', updateDto);

      expect(mockService.update).toHaveBeenCalledWith('test-uuid', updateDto);
      expect(result).toEqual(updatedDeclaration);
    });
  });

  describe('remove', () => {
    it('should remove a health declaration', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('test-uuid');

      expect(mockService.remove).toHaveBeenCalledWith('test-uuid');
    });
  });
}); 