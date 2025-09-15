import { WinstonModuleOptions } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

export const getLoggerConfig = (configService: ConfigService): WinstonModuleOptions => {
  const logLevel = configService.get<string>('LOG_LEVEL', 'info');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const logFilePath = configService.get<string>('LOG_FILE_PATH', 'logs/app.log');

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
        }),
      ),
    }),
  ];

  if (nodeEnv === 'production') {
    transports.push(
      new winston.transports.File({
        filename: logFilePath,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
    );
  }

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    defaultMeta: { service: 'health-declaration-api' },
    transports,
  };
}; 