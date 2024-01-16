import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClientService } from '../services/client.service';
import { MixedAuthGuard } from 'src/modules/auth/guards';

@Controller('client')
@UseGuards(MixedAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('me')
  async getClientMe() {
    return await this.clientService.getClientMe();
  }
}
