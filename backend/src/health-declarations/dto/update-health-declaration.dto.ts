import { PartialType } from '@nestjs/swagger';
import { CreateHealthDeclarationDto } from './create-health-declaration.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateHealthDeclarationDto extends PartialType(CreateHealthDeclarationDto) {
  @ApiProperty({
    description: 'Declaration status',
    example: 'approved',
    enum: ['pending', 'approved', 'rejected'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';
} 