import { PhoneNumberService } from './../../shared/services/phone-number.service';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { CreatePaymentDto } from '../dto/payment.dto';
import { getAppContextALS, AppRequestContext } from 'src/utils';
import { PaymentResponseData, QUEUE_NAMES } from 'src/modules/types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { XYZService } from 'src/modules/shared/services/xyz.service';
import { Payment, $Enums } from '@prisma/client';
import { GlobalConfig, globalConfig } from 'src/config';

@Injectable()
export class PaymentProcessorService {
  @Inject(DatabaseService)
  private readonly databaseService: DatabaseService;

  @Inject(PhoneNumberService)
  private readonly phoneNumberService: PhoneNumberService;

  @Inject(XYZService)
  xyzService: XYZService;

  @Inject(globalConfig.KEY)
  config: GlobalConfig;

  constructor(
    @InjectQueue(QUEUE_NAMES.PAYMENT)
    private readonly paymentQueue: Queue,
  ) {}

  async initiatePayment(data: CreatePaymentDto) {
    const ctx = getAppContextALS<AppRequestContext>();
    if (!data.operator) {
      data.operator = this.phoneNumberService.provider(
        data.phoneNumber,
      ) as $Enums.Operator;
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

  async submitPayment(data: Payment) {
    try {
      const res = this.xyzService.processPayment({
        amount: data.amount,
        callbackUrl: `${this.config.backendUrl}/payment/callback`,
        externalReference: data.paymentReference,
        operator: data.oparator,
        paymentMethod: 'momo',
        phoneNumber: data.phoneNumber,
      });
      const paymentData = await this.databaseService.paymentData.create({
        data: {
          apiResponseText: JSON.stringify(res),
        },
      });
      await this.databaseService.payment.update({
        where: {
          id: data.id,
        },
        data: {
          status:
            res?.statusCode === 200
              ? $Enums.PaymentStatus.pending
              : $Enums.PaymentStatus.failed,
          paymentDataId: paymentData.id,
        },
      });
    } catch (err) {
      await this.databaseService.payment.update({
        where: {
          id: data.id,
        },
        data: {
          status: $Enums.PaymentStatus.failed,
        },
      });
    }
  }
  async handlePaymentCallback(data: PaymentResponseData) {
    if (!data) throw new NotFoundException('Payment not found');
    const existingPayment = await this.databaseService.payment.findUnique({
      where: {
        paymentReference: data?.data?.externalReference,
      },
    });
    if (!existingPayment) throw new NotFoundException('Payment not found');
    await this.databaseService.payment.update({
      where: {
        id: existingPayment.id,
      },
      data: {
        status: data?.data?.status as $Enums.PaymentStatus,
        paymentData: {
          update: {
            where: {
              id: existingPayment.paymentDataId,
            },
            data: {
              callbackResponseText: JSON.stringify(data),
              paymentVendorReference: data?.data?.reference,
              callbackResponseTime: new Date(),
            },
          },
        },
      },
    });
    return 'OK';
  }
}
