import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '../types';
import { AuthModule } from '../auth/auth.module';
import { PaymentProcessorService } from './services/payment-processor.service';
import { SharedModule } from '../shared/shared.module';
import { PaymentProcessController } from './controllers/payment-processor.controller';
import { DatabaseModule } from '../database/database.module';
import { PaymentProcessor } from './processors/payment.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.PAYMENT,
    }),
    AuthModule,
    SharedModule,
    DatabaseModule,
  ],
  providers: [PaymentProcessorService, PaymentProcessor],
  controllers: [PaymentProcessController],
})
export class PaymentProcessModule {}
