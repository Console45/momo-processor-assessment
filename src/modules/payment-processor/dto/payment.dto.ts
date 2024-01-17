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
    message: 'Operator must be one of AIRTEL_TIGO, MTN, VODAFONE',
  })
  @IsOptional()
  operator: OPERATORS;

  @IsPhoneNumber('GH')
  @IsString()
  @IsNotEmpty()
  phoneNumber;
}
