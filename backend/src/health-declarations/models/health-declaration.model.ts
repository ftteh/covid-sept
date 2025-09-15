import { Column, DataType, Model, Table, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'health_declarations',
  timestamps: true,
  paranoid: false,
  underscored: false,
  indexes: [
    {
      fields: ['createdAt'],
    },
    {
      fields: ['name'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['temperature'],
    },
  ],
})
export class HealthDeclaration extends Model<HealthDeclaration> {
  @ApiProperty({
    description: 'Unique identifier for the health declaration',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({
    description: 'Full name of the person declaring',
    example: 'John Doe',
    maxLength: 100,
  })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
  })
  name: string;

  @ApiProperty({
    description: 'Temperature in Celsius',
    example: 36.5,
    minimum: 30,
    maximum: 45,
  })
  @Column({
    type: DataType.DECIMAL(4, 2),
    allowNull: false,
    validate: {
      min: 30,
      max: 45,
    },
  })
  temperature: number;

  @ApiProperty({
    description: 'Whether the person has any COVID-19 symptoms in the last 14 days',
    example: false,
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  hasSymptoms: boolean;

  @ApiProperty({
    description: 'List of symptoms if any (comma-separated)',
    example: 'cough, fever',
    required: false,
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  symptoms: string;

  @ApiProperty({
    description: 'Whether the person has been in contact with COVID-19 case in last 14 days',
    example: false,
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  hasContact: boolean;

  @ApiProperty({
    description: 'Additional contact details if applicable',
    required: false,
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  contactDetails: string;

  @ApiProperty({
    description: 'Declaration status',
    example: 'approved',
    enum: ['pending', 'approved', 'rejected'],
  })
  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';

  @ApiProperty({
    description: 'IP address of the submitter for audit purposes',
  })
  @Column({
    type: DataType.STRING(45),
    allowNull: true,
  })
  ipAddress: string;

  @ApiProperty({
    description: 'User agent string for audit purposes',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  userAgent: string;

  @ApiProperty({
    description: 'When the declaration was created',
  })
  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the declaration was last updated',
  })
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt: Date;
} 