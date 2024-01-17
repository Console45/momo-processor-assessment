import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ClientService } from '../services/client.service';
import { MixedAuthGuard } from 'src/modules/auth/guards';
import { PaymentHistoryPaging } from 'src/modules/types';

@Controller('client')
@UseGuards(MixedAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('me')
  async getClientMe() {
    return await this.clientService.getClientMe();
  }

  @Get('payment/history')
  async getClientPaymentHistory(@Query() data: PaymentHistoryPaging) {
    return await this.clientService.getClientPaymentHistory(data);
  }
}
