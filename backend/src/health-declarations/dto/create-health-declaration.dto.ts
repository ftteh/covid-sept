import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
  Min,
  Max,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateHealthDeclarationDto {
  @ApiProperty({
    description: 'Full name of the person declaring',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s\-',.]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, apostrophes, commas, and periods',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Temperature in Celsius',
    example: 36.5,
    minimum: 30,
    maximum: 45,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(30, { message: 'Temperature must be at least 30°C' })
  @Max(45, { message: 'Temperature must not exceed 45°C' })
  @Transform(({ value }) => parseFloat(value))
  temperature: number;

  @ApiProperty({
    description: 'Whether the person has any COVID-19 symptoms in the last 14 days',
    example: false,
  })
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  hasSymptoms: boolean;

  @ApiProperty({
    description: 'List of symptoms if any (comma-separated). Required if hasSymptoms is true.',
    example: 'cough, fever, headache',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  symptoms?: string;

  @ApiProperty({
    description: 'Whether the person has been in contact with COVID-19 case in last 14 days',
    example: false,
  })
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  hasContact: boolean;

  @ApiProperty({
    description: 'Additional contact details if applicable. Required if hasContact is true.',
    example: 'Family member tested positive on 2023-12-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  contactDetails?: string;
} 