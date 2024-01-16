import { RequestContext } from '@medibloc/nestjs-request-context';
import { Client } from '@prisma/client';

export class AppRequestContext extends RequestContext {
  client: Client;
  locale: string;
}
