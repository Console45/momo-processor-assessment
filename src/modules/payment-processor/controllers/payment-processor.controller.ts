import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreatePaymentDto } from '../dto/payment.dto';
import { PaymentProcessorService } from '../services/payment-processor.service';
import { MixedAuthGuard } from 'src/modules/auth/guards';
import { PaymentResponseData } from 'src/modules/types';

@Controller('payment')
export class PaymentProcessController {
  constructor(private readonly paymentService: PaymentProcessorService) {}

  @Post('initiate')
  @UseGuards(MixedAuthGuard)
  async initiatePayment(@Body() data: CreatePaymentDto) {
    return await this.paymentService.initiatePayment(data);
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async paymentCallback(@Body() data: PaymentResponseData) {
    return await this.paymentService.handlePaymentCallback(data);
  }
}
