import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Liveness/readiness endpoint for the container orchestrator.
 *
 * With the global prefix this serves at GET /api/healthz.
 *
 * Deliberately does NOT touch the database. If it ran `SELECT 1`, a brief Postgres
 * hiccup would fail readiness on every backend Pod simultaneously and turn a database
 * blip into a total outage. This answers only "is this process alive and serving?".
 */
@ApiTags('health')
@Controller('healthz')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness/readiness probe' })
  check(): { status: string } {
    return { status: 'ok' };
  }
}
