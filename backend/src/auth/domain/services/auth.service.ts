import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterTransactionScript } from '../transaction-scripts/register-ts/register.transaction.script';
import { LoginTransactionScript } from '../transaction-scripts/login-ts/login.transaction.script';
import { RegisterDto } from 'src/auth/apps/dtos/requests/register.dto';
import { LoginDto } from 'src/auth/apps/dtos/requests/login.dto';
import { AuthResponseDto } from 'src/auth/apps/dtos/responses/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly registerTransactionScript: RegisterTransactionScript,
    private readonly loginTransactionScript: LoginTransactionScript,
  ) {}

  register = async (dto: RegisterDto): Promise<AuthResponseDto> => {
    const user = await this.registerTransactionScript.apply(dto);
    const accessToken = this.generateToken(user.id, user.email);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        defaultHourlyRate: Number(user.defaultHourlyRate),
      },
    };
  };

  login = async (dto: LoginDto): Promise<AuthResponseDto> => {
    const user = await this.loginTransactionScript.apply(dto);
    const accessToken = this.generateToken(user.id, user.email);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        defaultHourlyRate: Number(user.defaultHourlyRate),
      },
    };
  };

  private generateToken = (userId: number, email: string): string => {
    return this.jwtService.sign({ sub: userId, email });
  };
}
