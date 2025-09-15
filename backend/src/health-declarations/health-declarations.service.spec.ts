import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { HealthDeclarationsService } from './health-declarations.service';
import { HealthDeclaration } from './models/health-declaration.model';
import { CreateHealthDeclarationDto } from './dto/create-health-declaration.dto';
import { UpdateHealthDeclarationDto } from './dto/update-health-declaration.dto';
import { Op } from 'sequelize';

// Mock Sequelize model methods
const mockHealthDeclarationModel = {
  create: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  count: jest.fn(),
};

// Mock instance methods
const mockInstance = {
  update: jest.fn(),
  destroy: jest.fn(),
  id: 'test-uuid',
  name: 'Test User',
  temperature: 36.5,
  hasSymptoms: false,
  symptoms: null,
  hasContact: false,
  contactDetails: null,
  status: 'pending',
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('HealthDeclarationsService', () => {
  let service: HealthDeclarationsService;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthDeclarationsService,
        {
          provide: getModelToken(HealthDeclaration),
          useValue: mockHealthDeclarationModel,
        },
      ],
    }).compile();

    service = module.get<HealthDeclarationsService>(HealthDeclarationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateHealthDeclarationDto = {
      name: 'John Doe',
      temperature: 36.5,
      hasSymptoms: false,
      hasContact: false,
    };

    it('should successfully create a health declaration', async () => {
      const expectedResult = { ...mockInstance, ...createDto };
      mockHealthDeclarationModel.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto, '127.0.0.1', 'test-agent');

      expect(mockHealthDeclarationModel.create).toHaveBeenCalledWith({
        ...createDto,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        status: 'pending',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException when hasSymptoms is true but no symptoms provided', async () => {
      const invalidDto = {
        ...createDto,
        hasSymptoms: true,
        symptoms: '',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockHealthDeclarationModel.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when hasContact is true but no contactDetails provided', async () => {
      const invalidDto = {
        ...createDto,
        hasContact: true,
        contactDetails: '',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockHealthDeclarationModel.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockHealthDeclarationModel.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    const mockResult = {
      rows: [mockInstance],
      count: 1,
    };

    it('should return paginated health declarations', async () => {
      mockHealthDeclarationModel.findAndCountAll.mockResolvedValue(mockResult);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      expect(mockHealthDeclarationModel.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual({
        data: [mockInstance],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should handle search parameter', async () => {
      mockHealthDeclarationModel.findAndCountAll.mockResolvedValue(mockResult);

      await service.findAll({
        page: 1,
        limit: 10,
        search: 'John',
      });

      expect(mockHealthDeclarationModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%John%' } },
            { symptoms: { [Op.like]: '%John%' } },
            { contactDetails: { [Op.like]: '%John%' } },
          ],
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
      });
    });

    it('should handle status filter', async () => {
      mockHealthDeclarationModel.findAndCountAll.mockResolvedValue(mockResult);

      await service.findAll({
        page: 1,
        limit: 10,
        status: 'approved',
      });

      expect(mockHealthDeclarationModel.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'approved' },
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
      });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockHealthDeclarationModel.findAndCountAll.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a health declaration by id', async () => {
      mockHealthDeclarationModel.findByPk.mockResolvedValue(mockInstance);

      const result = await service.findOne('test-uuid');

      expect(mockHealthDeclarationModel.findByPk).toHaveBeenCalledWith('test-uuid');
      expect(result).toEqual(mockInstance);
    });

    it('should throw NotFoundException when health declaration not found', async () => {
      mockHealthDeclarationModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockHealthDeclarationModel.findByPk.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('test-uuid')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateHealthDeclarationDto = {
      status: 'approved',
    };

    it('should successfully update a health declaration', async () => {
      mockHealthDeclarationModel.findByPk.mockResolvedValue(mockInstance);
      mockInstance.update.mockResolvedValue(mockInstance);

      const result = await service.update('test-uuid', updateDto);

      expect(mockHealthDeclarationModel.findByPk).toHaveBeenCalledWith('test-uuid');
      expect(mockInstance.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual(mockInstance);
    });

    it('should throw NotFoundException when health declaration not found', async () => {
      mockHealthDeclarationModel.findByPk.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should validate hasSymptoms with symptoms', async () => {
      const instanceWithoutSymptoms = { ...mockInstance, symptoms: null };
      mockHealthDeclarationModel.findByPk.mockResolvedValue(instanceWithoutSymptoms);

      const invalidUpdate = { hasSymptoms: true, symptoms: '' };

      await expect(service.update('test-uuid', invalidUpdate)).rejects.toThrow(BadRequestException);
    });

    it('should validate hasContact with contactDetails', async () => {
      const instanceWithoutContact = { ...mockInstance, contactDetails: null };
      mockHealthDeclarationModel.findByPk.mockResolvedValue(instanceWithoutContact);

      const invalidUpdate = { hasContact: true, contactDetails: '' };

      await expect(service.update('test-uuid', invalidUpdate)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should successfully delete a health declaration', async () => {
      mockHealthDeclarationModel.findByPk.mockResolvedValue(mockInstance);
      mockInstance.destroy.mockResolvedValue(undefined);

      await service.remove('test-uuid');

      expect(mockHealthDeclarationModel.findByPk).toHaveBeenCalledWith('test-uuid');
      expect(mockInstance.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when health declaration not found', async () => {
      mockHealthDeclarationModel.findByPk.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      mockHealthDeclarationModel.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3)  // pending
        .mockResolvedValueOnce(5)  // approved
        .mockResolvedValueOnce(2)  // rejected
        .mockResolvedValueOnce(1); // todaySubmissions

      const result = await service.getStats();

      expect(result).toEqual({
        total: 10,
        pending: 3,
        approved: 5,
        rejected: 2,
        todaySubmissions: 1,
      });

      expect(mockHealthDeclarationModel.count).toHaveBeenCalledTimes(5);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockHealthDeclarationModel.count.mockRejectedValue(new Error('Database error'));

      await expect(service.getStats()).rejects.toThrow(InternalServerErrorException);
    });
  });
}); 