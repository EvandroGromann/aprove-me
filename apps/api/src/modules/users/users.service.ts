import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { UsersRepository } from './repositories';
import { CustomLogger } from '../../shared/logger/custom-logger.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext('UsersService');
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Creating new user with login: ${createUserDto.login}`);

    try {
      const existingUser = await this.usersRepository.findByLogin(createUserDto.login);
      if (existingUser) {
        this.logger.warn(`User creation failed - login already exists: ${createUserDto.login}`);
        throw new ConflictException('Login já existe');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const duration = Date.now() - startTime;
      this.logger.audit('User created', {
        userId: user.id,
        login: user.login,
      }, user.id.toString());

      this.logger.performance('User creation', duration, {
        userId: user.id,
        success: true
      });

      return this.toResponseDto(user);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.performance('User creation', duration, {
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const startTime = Date.now();
    this.logger.debug('Fetching all users');

    const users = await this.usersRepository.findAll();
    const duration = Date.now() - startTime;
    
    this.logger.performance('Find all users', duration, {
      count: users.length
    });

    return users.map(user => this.toResponseDto(user));
  }

  async findById(id: string): Promise<UserResponseDto> {
    this.logger.debug(`Finding user by ID: ${id}`);
    
    const user = await this.usersRepository.findById(id);
    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new NotFoundException('Usuário não encontrado');
    }
    
    this.logger.debug(`User found: ${user.login}`);
    return this.toResponseDto(user);
  }

  async findByLogin(login: string) {
    this.logger.debug(`Finding user by login: ${login}`);
    return this.usersRepository.findByLogin(login);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Updating user with ID: ${id}`);

    try {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        this.logger.warn(`Update failed - user not found: ${id}`);
        throw new NotFoundException('Usuário não encontrado');
      }

      if (updateUserDto.login) {
        const existingUser = await this.usersRepository.findByLogin(updateUserDto.login);
        if (existingUser && existingUser.id !== id) {
          this.logger.warn(`Update failed - login already exists: ${updateUserDto.login}`);
          throw new ConflictException('Login já existe');
        }
      }

      const updateData: UpdateUserDto = { ...updateUserDto };
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        this.logger.debug(`Password updated for user: ${id}`);
      }

      const updatedUser = await this.usersRepository.update(id, updateData);
      const duration = Date.now() - startTime;
      
      this.logger.audit('User updated', {
        userId: id,
        login: updatedUser.login,
        fieldsUpdated: Object.keys(updateUserDto)
      }, id);

      this.logger.performance('User update', duration, {
        userId: id,
        success: true
      });

      return this.toResponseDto(updatedUser);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.performance('User update', duration, {
        userId: id,
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Removing user with ID: ${id}`);

    try {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        this.logger.warn(`Remove failed - user not found: ${id}`);
        throw new NotFoundException('Usuário não encontrado');
      }
      
      await this.usersRepository.delete(id);
      const duration = Date.now() - startTime;
      
      this.logger.audit('User removed', {
        userId: id,
        login: user.login
      }, id);

      this.logger.performance('User removal', duration, {
        userId: id,
        success: true
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.performance('User removal', duration, {
        userId: id,
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  async validatePassword(user: any, password: string): Promise<boolean> {
    this.logger.debug(`Validating password for user: ${user.id}`);
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
