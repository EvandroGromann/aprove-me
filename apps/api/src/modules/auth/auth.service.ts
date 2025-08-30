import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UsersRepository } from '../users/repositories/users.repository';
import { CustomLogger } from '../../shared/logger/custom-logger.service';
import { Log } from '../../shared/decorators/log.decorator';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  private usersRepository: UsersRepository,
  private logger: CustomLogger,
  ) {}

  @Log()
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { login, password } = loginDto;

    const user = await this.usersRepository.findByLogin(login);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      login: user.login,
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

  @Log()
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
