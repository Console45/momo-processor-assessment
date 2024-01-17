import { $Enums } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum($Enums.PaymentMethod, {
    message: 'Payment method must be one of momo',
  })
  @IsOptional()
  paymentMethod: $Enums.PaymentMethod;

  @IsString()
  @IsNotEmpty()
  paymentReference: string;

  @IsEnum($Enums.Operator, {
    message: 'Operator must be one of AIRTEL_TIGO, MTN, VODAFONE',
  })
  @IsOptional()
  operator: $Enums.Operator;

  @IsPhoneNumber('GH')
  @IsString()
  @IsNotEmpty()
  phoneNumber;
}
