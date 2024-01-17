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
import {
  EVENT_NAMES,
  PaymentResponseData,
  QUEUE_NAMES,
} from 'src/modules/types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { XYZService } from 'src/modules/shared/services/xyz.service';
import { Payment, $Enums } from '@prisma/client';
import { GlobalConfig, globalConfig } from 'src/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

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

  @Inject(EventEmitter2)
  eventEmitter: EventEmitter2;

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
    const paymentData = await this.databaseService.paymentData.create({
      data: {},
    });
    const payment = await this.databaseService.payment.create({
      data: {
        phoneNumber: this.phoneNumberService.toCode(data.phoneNumber),
        paymentReference: data.paymentReference,
        clientId: ctx.client.id,
        oparator: data.operator,
        amount: data.amount,
        paymentDataId: paymentData.id,
      },
      include: {
        paymentData: true,
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
      await this.databaseService.payment.update({
        where: {
          id: data.id,
        },
        data: {
          status:
            res?.statusCode === 200
              ? $Enums.PaymentStatus.pending
              : $Enums.PaymentStatus.failed,
          paymentData: {
            update: {
              where: {
                id: data.paymentDataId,
              },
              data: {
                apiResponseText: JSON.stringify(res),
              },
            },
          },
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
    if (
      (
        [
          $Enums.PaymentStatus.success,
          $Enums.PaymentStatus.failed,
        ] as $Enums.PaymentStatus[]
      ).includes(existingPayment.status)
    )
      return 'OK';
    if (!existingPayment) throw new NotFoundException('Payment not found');
    await this.databaseService.payment.update({
      where: {
        id: existingPayment.id,
      },
      data: {
        status: data?.data?.status as $Enums.PaymentStatus,
        paymentData: {
          upsert: {
            where: {
              id: existingPayment?.paymentDataId,
            },
            create: {
              callbackResponseText: JSON.stringify(data),
              paymentVendorReference: data?.data?.reference,
              callbackResponseTime: new Date(),
            },
            update: {
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

  async checkPaymentStatus(data: Pick<Payment, 'id'>[]) {
    const payments = await this.databaseService.payment.findMany({
      where: {
        id: {
          in: data.map((item) => item.id),
        },
        status: $Enums.PaymentStatus.pending,
      },
    });
    for (const payment of payments) {
      const res = this.xyzService.checkPaymentStatus(payment.paymentReference);
      await this.databaseService.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: res.data.status as $Enums.PaymentStatus,
          paymentData: {
            update: {
              where: {
                id: payment?.paymentDataId,
              },
              data: {
                statusCheckerResponseText: JSON.stringify(res),
                paymentVendorReference: res?.data?.reference,
                statusCheckerResponseTime: new Date(),
              },
            },
          },
        },
      });
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleStatusCheck() {
    const payments = await this.databaseService.payment.findMany({
      where: {
        status: $Enums.PaymentStatus.pending,
      },
      select: {
        id: true,
      },
    });
    this.eventEmitter.emit(EVENT_NAMES.STATUS_CHECK, payments);
  }
}
