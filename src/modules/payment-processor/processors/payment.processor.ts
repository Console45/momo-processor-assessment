import { PaymentProcessorService } from './../services/payment-processor.service';
import {
  OnQueueActive,
  OnQueueCompleted,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { Job } from 'bull';
import { QUEUE_NAMES } from 'src/modules/types';

@Processor(QUEUE_NAMES.PAYMENT)
export class PaymentProcessor {
  @Inject(PaymentProcessorService)
  paymentProcessorService: PaymentProcessorService;

  @Process()
  async processPayment(job: Job<unknown>) {
    await this.paymentProcessorService.submitPayment(job.data as Payment);
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} with reference ${
        job.data.paymentReference
      } and data ${job.data}... at ${new Date()}`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.log(
      `Completed job ${job.id} with reference ${
        job.data.paymentReference
      } and data ${job.data}... at ${new Date()}`,
    );
  }
}
