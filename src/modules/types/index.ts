import { $Enums } from '@prisma/client';

export enum QUEUE_NAMES {
  PAYMENT = 'payment',
}

export interface PaymentRequestData {
  phoneNumber: string;
  amount: number;
  paymentMethod: $Enums.PaymentMethod;
  operator: $Enums.Operator;
  externalReference: string;
  callbackUrl: string;
}
