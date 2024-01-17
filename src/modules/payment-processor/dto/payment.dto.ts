import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { OPERATORS, PAYMENT_METHODS } from 'src/modules/types';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum(PAYMENT_METHODS, {
    message: 'Payment method must be one of momo',
  })
  @IsOptional()
  paymentMethod: PAYMENT_METHODS;

  @IsString()
  @IsNotEmpty()
  paymentReference: string;

  @IsEnum(OPERATORS, {
    message: 'Operator must be one of airtel_tigo, mtn, vodafone',
  })
  @IsNotEmpty()
  operator: OPERATORS;

  @IsPhoneNumber('GH')
  @IsString()
  @IsNotEmpty()
  phoneNumber;
}
