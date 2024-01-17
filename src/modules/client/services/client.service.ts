import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { PaymentHistoryPaging } from 'src/modules/types';
import { AppRequestContext, getAppContextALS } from 'src/utils';

@Injectable()
export class ClientService {
  @Inject(DatabaseService)
  databaseService: DatabaseService;

  async getClientMe() {
    const ctx = getAppContextALS<AppRequestContext>();
    return ctx.client;
  }

  async getClientPaymentHistory(paging: PaymentHistoryPaging) {
    const ctx = getAppContextALS<AppRequestContext>();
    let where: any = {
      clientId: ctx.client.id,
    };
    if (paging.status) {
      where = {
        ...where,
        status: paging.status,
      };
    }
    return await this.databaseService.payment.findMany({
      where,
      skip: paging.page || 0,
      take: paging.limit || 10,
      orderBy: {
        createdAt: paging.order || 'desc',
      },
    });
  }
}
