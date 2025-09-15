import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions, OrderItem } from 'sequelize';
import { CreateHealthDeclarationDto } from './dto/create-health-declaration.dto';
import { UpdateHealthDeclarationDto } from './dto/update-health-declaration.dto';
import { HealthDeclaration } from './models/health-declaration.model';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'temperature';
  sortOrder?: 'ASC' | 'DESC';
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class HealthDeclarationsService {
  private readonly logger = new Logger(HealthDeclarationsService.name);

  constructor(
    @InjectModel(HealthDeclaration)
    private healthDeclarationModel: typeof HealthDeclaration,
  ) {}

  async create(
    createHealthDeclarationDto: CreateHealthDeclarationDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<HealthDeclaration> {
    try {
      // Custom validation: if hasSymptoms is true, symptoms must be provided
      if (createHealthDeclarationDto.hasSymptoms && !createHealthDeclarationDto.symptoms?.trim()) {
        throw new BadRequestException('Symptoms must be provided when hasSymptoms is true');
      }

      // Custom validation: if hasContact is true, contactDetails must be provided
      if (createHealthDeclarationDto.hasContact && !createHealthDeclarationDto.contactDetails?.trim()) {
        throw new BadRequestException('Contact details must be provided when hasContact is true');
      }

      // Create the health declaration
      const healthDeclaration = await this.healthDeclarationModel.create({
        ...createHealthDeclarationDto,
        ipAddress,
        userAgent,
        status: 'pending',
      });

      this.logger.log(`Health declaration created with ID: ${healthDeclaration.id} for ${healthDeclaration.name}`);
      
      return healthDeclaration;
    } catch (error) {
      this.logger.error(`Failed to create health declaration: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to create health declaration');
    }
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<HealthDeclaration>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        status,
        search,
      } = options;

      // Build where conditions
      const whereConditions: WhereOptions = {};

      if (status) {
        whereConditions.status = status;
      }

      if (search) {
        whereConditions[Op.or as any] = [
          { name: { [Op.like]: `%${search}%` } },
          { symptoms: { [Op.like]: `%${search}%` } },
          { contactDetails: { [Op.like]: `%${search}%` } },
        ];
      }

      // Build order
      const order: OrderItem[] = [[sortBy, sortOrder]];

      // Calculate offset
      const offset = (page - 1) * limit;

      // Execute query with count
      const { rows: data, count: total } = await this.healthDeclarationModel.findAndCountAll({
        where: whereConditions,
        order,
        limit,
        offset,
      });

      const totalPages = Math.ceil(total / limit);

      this.logger.log(`Retrieved ${data.length} health declarations (page ${page} of ${totalPages})`);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch health declarations: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch health declarations');
    }
  }

  async findOne(id: string): Promise<HealthDeclaration> {
    try {
      const healthDeclaration = await this.healthDeclarationModel.findByPk(id);

      if (!healthDeclaration) {
        throw new NotFoundException(`Health declaration with ID ${id} not found`);
      }

      return healthDeclaration;
    } catch (error) {
      this.logger.error(`Failed to find health declaration with ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to fetch health declaration');
    }
  }

  async update(id: string, updateHealthDeclarationDto: UpdateHealthDeclarationDto): Promise<HealthDeclaration> {
    try {
      const existingDeclaration = await this.findOne(id);

      // Custom validation for updates
      if (updateHealthDeclarationDto.hasSymptoms !== undefined) {
        if (updateHealthDeclarationDto.hasSymptoms && !updateHealthDeclarationDto.symptoms?.trim()) {
          if (!existingDeclaration.symptoms?.trim()) {
            throw new BadRequestException('Symptoms must be provided when hasSymptoms is true');
          }
        }
      }

      if (updateHealthDeclarationDto.hasContact !== undefined) {
        if (updateHealthDeclarationDto.hasContact && !updateHealthDeclarationDto.contactDetails?.trim()) {
          if (!existingDeclaration.contactDetails?.trim()) {
            throw new BadRequestException('Contact details must be provided when hasContact is true');
          }
        }
      }

      // Update the entity
      await existingDeclaration.update(updateHealthDeclarationDto);

      this.logger.log(`Health declaration updated with ID: ${id}`);
      
      return existingDeclaration;
    } catch (error) {
      this.logger.error(`Failed to update health declaration with ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to update health declaration');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const existingDeclaration = await this.findOne(id);
      
      await existingDeclaration.destroy();

      this.logger.log(`Health declaration deleted with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete health declaration with ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to delete health declaration');
    }
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    todaySubmissions: number;
  }> {
    try {
      const [
        total,
        pending,
        approved,
        rejected,
        todaySubmissions,
      ] = await Promise.all([
        this.healthDeclarationModel.count(),
        this.healthDeclarationModel.count({ where: { status: 'pending' } }),
        this.healthDeclarationModel.count({ where: { status: 'approved' } }),
        this.healthDeclarationModel.count({ where: { status: 'rejected' } }),
        this.healthDeclarationModel.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

      return {
        total,
        pending,
        approved,
        rejected,
        todaySubmissions,
      };
    } catch (error) {
      this.logger.error(`Failed to get health declaration stats: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get statistics');
    }
  }
} 