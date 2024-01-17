import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/payment.dto';
import { PaymentProcessorService } from '../services/payment-processor.service';
import { MixedAuthGuard } from 'src/modules/auth/guards';

@Controller('payment')
@UseGuards(MixedAuthGuard)
export class PaymentProcessController {
  constructor(private readonly paymentService: PaymentProcessorService) {}

  @Post('initiate')
  async initiatePayment(@Body() data: CreatePaymentDto) {
    return await this.paymentService.initiatePayment(data);
  }
}
