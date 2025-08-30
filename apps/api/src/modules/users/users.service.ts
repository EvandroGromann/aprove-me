import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { UsersRepository } from './repositories';
import { CustomLogger } from '../../shared/logger/custom-logger.service';
import { Log } from '../../shared/decorators/log.decorator';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  @Log()
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findByLogin(createUserDto.login);
    if (existingUser) {
      throw new ConflictException('Login já existe');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.toResponseDto(user);
  }

  @Log()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map(user => this.toResponseDto(user));
  }

  @Log()
  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    return this.toResponseDto(user);
  }

  @Log()
  async findByLogin(login: string) {
    return this.usersRepository.findByLogin(login);
  }

  @Log()
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateUserDto.login) {
      const existingUser = await this.usersRepository.findByLogin(updateUserDto.login);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Login já existe');
      }
    }

    const updateData: UpdateUserDto = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.usersRepository.update(id, updateData);
    return this.toResponseDto(updatedUser);
  }

  @Log()
  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    await this.usersRepository.delete(id);
  }

  @Log()
  async validatePassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  private toResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      login: user.login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
