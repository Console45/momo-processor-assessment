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

export interface PaymentResponseData {
  statusCode: number;
  data: {
    status: string;
    amount: string;
    reference: string;
    externalReference: string;
  };
}

export interface Paging {
  limit?: number;
  page?: number;
  order?: 'asc' | 'desc';
}

export interface PaymentHistoryPaging extends Paging {
  status?: $Enums.PaymentStatus;
}
