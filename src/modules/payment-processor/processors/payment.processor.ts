import {
  OnQueueActive,
  OnQueueCompleted,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUE_NAMES } from 'src/modules/types';

@Processor(QUEUE_NAMES.PAYMENT)
export class PaymentProcessor {
  @Process()
  async processPayment(job: Job<unknown>) {
    try {
      console.log(job.data);
    } catch (err) {}
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
