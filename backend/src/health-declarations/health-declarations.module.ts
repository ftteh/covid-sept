import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HealthDeclarationsService } from './health-declarations.service';
import { HealthDeclarationsController } from './health-declarations.controller';
import { HealthDeclaration } from './models/health-declaration.model';

@Module({
  imports: [SequelizeModule.forFeature([HealthDeclaration])],
  controllers: [HealthDeclarationsController],
  providers: [HealthDeclarationsService],
  exports: [HealthDeclarationsService],
})
export class HealthDeclarationsModule {} 