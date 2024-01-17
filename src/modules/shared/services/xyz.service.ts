import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { GlobalConfig, globalConfig } from 'src/config';
import { PaymentRequestData } from 'src/modules/types';
import { generateCode } from 'src/utils/calc';

@Injectable()
export class XYZService {
  @Inject(HttpService)
  httpService: HttpService;

  @Inject(globalConfig.KEY)
  config: GlobalConfig;

  private readonly baseUrl: string = 'https://api.xyz.com';

  processPayment(data: PaymentRequestData) {
    this.httpService.post(`${this.baseUrl}/v1/payments`, data, {
      headers: {
        ['x-api-key']: this.config.paymentProviderKey,
      },
    });

    return {
      statusCode: 200,
      message: 'Payment received successfully',
    };
  }

  checkPaymentStatus(reference: string) {
    this.httpService.get(
      `${this.baseUrl}/v1/payments/check-status/${reference}`,
      {
        headers: {
          ['x-api-key']: this.config.paymentProviderKey,
        },
      },
    );
    const status = ['success', 'failed', 'pending'];
    return {
      statusCode: 200,
      data: {
        status: status[Math.floor(Math.random() * status.length)],
        amount: '20',
        reference: generateCode(10),
        externalReference: reference,
      },
    };
  }
}
