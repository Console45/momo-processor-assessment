import { PhoneNumberService } from './../../shared/services/phone-number.service';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { CreatePaymentDto } from '../dto/payment.dto';
import { getAppContextALS, AppRequestContext } from 'src/utils';
import { OPERATORS, QUEUE_NAMES } from 'src/modules/types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class PaymentProcessorService {
  @Inject(DatabaseService)
  private readonly databaseService: DatabaseService;

  @Inject(PhoneNumberService)
  private readonly phoneNumberService: PhoneNumberService;

  constructor(
    @InjectQueue(QUEUE_NAMES.PAYMENT)
    private readonly paymentQueue: Queue,
  ) {}

  async initiatePayment(data: CreatePaymentDto) {
    const ctx = getAppContextALS<AppRequestContext>();
    if (!data.operator) {
      data.operator = this.phoneNumberService.provider(
        data.phoneNumber,
      ) as OPERATORS;
    }
    const existingReference = await this.databaseService.payment.findUnique({
      where: {
        paymentReference: data.paymentReference,
      },
    });
    if (existingReference) {
      throw new ConflictException('Payment reference already exist');
    }
    const payment = await this.databaseService.payment.create({
      data: {
        phoneNumber: this.phoneNumberService.toCode(data.phoneNumber),
        paymentReference: data.paymentReference,
        clientId: ctx.client.id,
        oparator: data.operator,
        amount: data.amount,
      },
    });
    this.paymentQueue.add(payment);
    return payment;
  }
}
