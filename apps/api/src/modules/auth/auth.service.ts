import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UsersRepository } from '../users/repositories/users.repository';
import { CustomLogger } from '../../shared/logger/custom-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private logger: CustomLogger,
  ) {
    this.logger.setContext('AuthService');
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const startTime = Date.now();
    const { login, password } = loginDto;

    this.logger.log(`Login attempt for user: ${login}`);

    try {
      const user = await this.usersRepository.findByLogin(login);

      if (!user) {
        this.logger.security('Login failed - user not found', { login, ip: 'unknown' });
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.security('Login failed - invalid password', { 
          login,
          userId: user.id,
          ip: 'unknown'
        });
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const payload = {
        sub: user.id,
        login: user.login,
      };

      const access_token = this.jwtService.sign(payload, {
        expiresIn: '1m',
      });

      const duration = Date.now() - startTime;
      this.logger.audit('User login successful', {
        userId: user.id,
        login: user.login,
        tokenExpiry: '1m'
      }, user.id.toString());

      this.logger.performance('Login process', duration, {
        userId: user.id,
        success: true
      });

      return {
        access_token,
        token_type: 'Bearer',
        expires_in: 60,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.performance('Login process', duration, {
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  async validateToken(token: string): Promise<any> {
    this.logger.debug('Validating JWT token');
    
    try {
      const payload = this.jwtService.verify(token);
      this.logger.debug('Token validation successful', 'AuthService', {
        userId: payload.sub,
        login: payload.login
      });
      return payload;
    } catch (error) {
      this.logger.security('Token validation failed', {
        error: error.message,
        tokenPrefix: token ? token.substring(0, 10) + '...' : 'empty'
      });
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
