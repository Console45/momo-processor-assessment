import { Injectable } from '@nestjs/common';
import { AppRequestContext, getAppContextALS } from 'src/utils';

@Injectable()
export class ClientService {
  async getClientMe() {
    const ctx = getAppContextALS<AppRequestContext>();
    return ctx.client;
  }
}
