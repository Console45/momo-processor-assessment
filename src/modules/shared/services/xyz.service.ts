import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { GlobalConfig, globalConfig } from 'src/config';
import { PaymentRequestData } from 'src/modules/types';

@Injectable()
export class XYZService {
  @Inject(HttpService)
  httpService: HttpService;

  @Inject(globalConfig.KEY)
  config: GlobalConfig;

  private readonly baseUrl: string = 'https://api.xyz.com';

  processPayment(data: PaymentRequestData) {
    this.httpService.post(`${this.baseUrl}`, data, {
      headers: {
        ['x-api-key']: this.config.paymentProviderKey,
      },
    });

    return {
      statusCode: 200,
      message: 'Payment received successfully',
    };
  }
}
