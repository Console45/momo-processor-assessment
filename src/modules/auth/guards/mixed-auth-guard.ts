import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppRequestContext, getAppContextALS } from '../../../utils';

// prettier-ignore
const allowedAuthTypes = [
   'api-key',
   
];

@Injectable()
export class MixedAuthGuard
  extends AuthGuard(allowedAuthTypes)
  implements CanActivate
{
  getRequest(context: ExecutionContext) {
    const type = context.getType();
    if (type !== 'http') {
      throw new Error('Unsupported execution type');
    }
    const ctx = context.switchToHttp();
    return ctx.getRequest();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const res = (await super.canActivate(context)) as boolean;
    if (!res) {
      return false;
    }
    const req = this.getRequest(context);
    const ctx = getAppContextALS<AppRequestContext>();
    ctx.locale = req.headers['accept-language'] ?? 'en';
    ctx.client = req.user.client;

    return res;
  }
}
