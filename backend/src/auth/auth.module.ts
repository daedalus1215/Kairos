import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './domain/services/auth.service';
import { RegisterTransactionScript } from './domain/transaction-scripts/register-ts/register.transaction.script';
import { LoginTransactionScript } from './domain/transaction-scripts/login-ts/login.transaction.script';
import { RegisterAction } from './apps/actions/register-action/register.action';
import { LoginAction } from './apps/actions/login-action/login.action';
import { MeAction } from './apps/actions/me-action/me.action';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        signOptions: { expiresIn: '7d' as const },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RegisterAction, LoginAction, MeAction],
  providers: [
    JwtStrategy,
    AuthService,
    RegisterTransactionScript,
    LoginTransactionScript,
  ],
  exports: [AuthService],
})
export class AuthModule {}
