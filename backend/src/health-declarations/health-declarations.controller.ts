import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HealthDeclarationsService, FindAllOptions } from './health-declarations.service';
import { CreateHealthDeclarationDto } from './dto/create-health-declaration.dto';
import { UpdateHealthDeclarationDto } from './dto/update-health-declaration.dto';
import { HealthDeclaration } from './models/health-declaration.model';

@ApiTags('health-declarations')
@Controller('health-declarations')
@UseGuards(ThrottlerGuard)
export class HealthDeclarationsController {
  constructor(private readonly healthDeclarationsService: HealthDeclarationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a new health declaration',
    description: 'Creates a new health declaration with validation and audit logging',
  })
  @ApiBody({
    type: CreateHealthDeclarationDto,
    description: 'Health declaration data to submit',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Health declaration has been successfully created',
    type: HealthDeclaration,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or validation failed',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests, please try again later',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createHealthDeclarationDto: CreateHealthDeclarationDto,
    @Req() request: Request,
  ): Promise<HealthDeclaration> {
    const ipAddress = request.ip || request.socket.remoteAddress;
    const userAgent = request.get('User-Agent');
    
    return this.healthDeclarationsService.create(
      createHealthDeclarationDto,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all health declarations with pagination',
    description: 'Retrieves a paginated list of health declarations with filtering and sorting options',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'name', 'temperature'],
    description: 'Field to sort by (default: createdAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (default: DESC)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'approved', 'rejected'],
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in name, symptoms, or contact details',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns paginated health declarations',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/HealthDeclaration' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 10 },
      },
    },
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'createdAt' | 'name' | 'temperature',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('status') status?: 'pending' | 'approved' | 'rejected',
    @Query('search') search?: string,
  ) {
    const options: FindAllOptions = {
      page: page ? Math.max(1, page) : 1,
      limit: limit ? Math.min(100, Math.max(1, limit)) : 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'DESC',
      status,
      search: search?.trim(),
    };

    return this.healthDeclarationsService.findAll(options);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get health declaration statistics',
    description: 'Returns statistics about health declarations including totals and counts by status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns health declaration statistics',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 100 },
        pending: { type: 'number', example: 15 },
        approved: { type: 'number', example: 80 },
        rejected: { type: 'number', example: 5 },
        todaySubmissions: { type: 'number', example: 12 },
      },
    },
  })
  async getStats() {
    return this.healthDeclarationsService.getStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a health declaration by ID',
    description: 'Retrieves a specific health declaration by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Health declaration UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the health declaration',
    type: HealthDeclaration,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Health declaration not found',
  })
  async findOne(@Param('id') id: string): Promise<HealthDeclaration> {
    return this.healthDeclarationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a health declaration',
    description: 'Updates an existing health declaration (typically used by administrators to change status)',
  })
  @ApiParam({
    name: 'id',
    description: 'Health declaration UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateHealthDeclarationDto,
    description: 'Data to update in the health declaration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health declaration has been successfully updated',
    type: HealthDeclaration,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Health declaration not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or validation failed',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateHealthDeclarationDto: UpdateHealthDeclarationDto,
  ): Promise<HealthDeclaration> {
    return this.healthDeclarationsService.update(id, updateHealthDeclarationDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a health declaration',
    description: 'Permanently deletes a health declaration (admin operation)',
  })
  @ApiParam({
    name: 'id',
    description: 'Health declaration UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Health declaration has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Health declaration not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.healthDeclarationsService.remove(id);
  }
} 