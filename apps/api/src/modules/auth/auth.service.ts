import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { login, password } = loginDto;

    if (login !== 'aprovame' || password !== 'aprovame') {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: '1',
      login: login,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1m',
    });

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 60,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
