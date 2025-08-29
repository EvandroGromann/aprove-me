import { Module } from '@nestjs/common';
import { SharedAuthModule } from '../../shared/auth/shared-auth.module';
import { PrismaModule } from '../../shared/database/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/repositories/users.repository';

@Module({
  imports: [SharedAuthModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository],
  exports: [AuthService],
})
export class AuthModule {}
