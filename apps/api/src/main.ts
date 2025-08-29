import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Carregar configurações da API
  const configPath = join(__dirname, '..', 'config', 'api-info.json');
  const apiConfig = JSON.parse(readFileSync(configPath, 'utf8'));

  // Servir arquivos de configuração estáticos
  app.useStaticAssets(join(__dirname, '..', 'config'), {
    prefix: '/config/',
  });

  // Servir arquivos públicos
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle(apiConfig.name)
    .setDescription(apiConfig.description)
    .setVersion(apiConfig.version)
    .setContact(apiConfig.contact.name, apiConfig.contact.url, apiConfig.contact.email)
    .setLicense(apiConfig.license.name, apiConfig.license.url)
    .addServer(apiConfig.servers[0].url, apiConfig.servers[0].description)
    .addTag('integrations', 'Endpoints de integração')
    .addTag('assignors', 'Gerenciamento de cedentes')
    .addTag('payables', 'Gerenciamento de pagáveis')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: `${apiConfig.name} - Documentation`,
    customfavIcon: '/config/assets/logo.png', // ← Logo da pasta config
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
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📚 API Documentation: http://localhost:3000/api/docs');
  console.log(`📋 API Info: ${apiConfig.name} v${apiConfig.version}`);
}
bootstrap();
