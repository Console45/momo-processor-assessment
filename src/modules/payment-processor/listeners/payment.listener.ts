import { OnEvent } from '@nestjs/event-emitter';
import { PaymentProcessorService } from './../services/payment-processor.service';
import { Inject, Injectable } from '@nestjs/common';
import { EVENT_NAMES } from 'src/modules/types';
import { Payment } from '@prisma/client';

@Injectable()
export class PaymentListner {
  @Inject(PaymentProcessorService)
  paymentProcessorService: PaymentProcessorService;

  @OnEvent(EVENT_NAMES.STATUS_CHECK)
  async handlePaymentStatusCheck(data: Pick<Payment, 'id'>[]) {
    await this.paymentProcessorService.checkPaymentStatus(data);
  }
}
