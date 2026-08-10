import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { networkInterfaces } from 'os';
import { AppModule } from './app.module';
import { ConfigurableIoAdapter } from './io-adapter';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  // Everything the HTTP API serves lives under /api, so a single hostname can be split
  // by path: /api -> this backend, / -> the frontend. Does NOT affect the WebSocket
  // gateway, whose '/meetings' namespace is unchanged.
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  const host = configService.get<string>('HOST') ?? '0.0.0.0';
  const corsOriginsRaw =
    configService.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173';
  const corsOrigins =
    corsOriginsRaw === '*'
      ? true
      : corsOriginsRaw.split(',').map((o) => o.trim());

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
  // 'api' now belongs to the API itself; the docs move to /docs.
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, host);

  const nets = networkInterfaces();
  const localIp = Object.values(nets)
    .flat()
    .find((iface) => iface && iface.family === 'IPv4' && !iface.internal)
    ?.address ?? 'localhost';

  console.log(`Kairos API running on http://localhost:${port}/api (local)`);
  console.log(`Kairos API running on http://${localIp}:${port}/api (network)`);
  console.log(`Swagger documentation at http://${localIp}:${port}/docs`);
};

bootstrap();
