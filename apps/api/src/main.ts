import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';
import { CustomLogger } from './shared/logger/custom-logger.service';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // Buffer logs until logger is attached
  });
  
  // Get custom logger instance
  const logger = await app.resolve(CustomLogger);
  logger.setContext('Bootstrap');
  app.useLogger(logger);
  
  // Register global exception filter
  const exceptionFilter = new HttpExceptionFilter(logger);
  app.useGlobalFilters(exceptionFilter);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const configPath = join(__dirname, '..', 'api-info.json');
  const apiConfig = JSON.parse(readFileSync(configPath, 'utf8'));

  app.useStaticAssets(join(__dirname, '..', 'assets'), {
    prefix: '/config/',
  });

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  const config = new DocumentBuilder()
    .setTitle(apiConfig.name)
    .setDescription(apiConfig.description)
    .setVersion(apiConfig.version)
    .setContact(apiConfig.contact.name, apiConfig.contact.url, apiConfig.contact.email)
    .setLicense(apiConfig.license.name, apiConfig.license.url)
    .addServer(apiConfig.servers[0].url, apiConfig.servers[0].description)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT obtido através do endpoint de autenticação',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Autenticação', 'Endpoints de autenticação e autorização')
    .addTag('assignors', 'Gerenciamento de cedentes')
    .addTag('payables', 'Gerenciamento de pagáveis')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: `${apiConfig.name} - Documentation`,
    customfavIcon: '/config/assets/logo.png',
    customCss: `
      .swagger-ui .topbar { 
        background-color: ${apiConfig.branding.primaryColor}; 
      }
      .swagger-ui .topbar .download-url-wrapper { 
        display: none; 
      }
    `,
  });

  await app.listen(3000);
  logger.log('🚀 Server running on http://localhost:3000');
  logger.log('📚 API Documentation: http://localhost:3000/api/docs');
  logger.log(`📋 API Info: ${apiConfig.name} v${apiConfig.version}`);
}
bootstrap();
