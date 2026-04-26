import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ConfigurableIoAdapter } from './io-adapter';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  const corsOrigins = (
    configService.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173'
  )
    .split(',')
    .map((o) => o.trim());

  app.enableCors({ origin: corsOrigins, credentials: true });
  app.useWebSocketAdapter(new ConfigurableIoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Kairos API')
    .setDescription('Meeting Cost Calculator API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`Kairos API running on http://localhost:${port}`);
  console.log(`Swagger documentation at http://localhost:${port}/api`);
};

bootstrap();
