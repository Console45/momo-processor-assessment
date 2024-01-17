import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '../types';
import { AuthModule } from '../auth/auth.module';
import { PaymentProcessorService } from './services/payment-processor.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.PAYMENT,
    }),
    AuthModule,
  ],
  providers: [PaymentProcessorService],
  exports: [],
})
export class PaymentProcessModule {}
