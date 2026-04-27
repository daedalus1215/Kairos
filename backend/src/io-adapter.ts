import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerOptions } from 'socket.io';

export class ConfigurableIoAdapter extends IoAdapter {
  private readonly corsOrigins: string[] | true;

  constructor(app: INestApplication) {
    super(app);
    const configService = app.get(ConfigService);
    const originsEnv =
      configService.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173';
    this.corsOrigins =
      originsEnv === '*' ? true : originsEnv.split(',').map((o) => o.trim());
  }

  createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: this.corsOrigins, credentials: true },
    });
  }
}
