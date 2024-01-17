import { Client } from '@prisma/client';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateClientDto } from '../dtos/auth.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async registerClient(@Body() data: CreateClientDto) {
    return await this.authService.createClient(data);
  }
}
