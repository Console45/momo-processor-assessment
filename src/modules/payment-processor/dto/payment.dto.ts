import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Payment amount',
    type: Number,
  })
  amount: number;

  @IsEnum($Enums.PaymentMethod, {
    message: 'Payment method must be one of momo',
  })
  @ApiProperty({
    description: 'Payment method',
    type: $Enums.PaymentMethod,
    enum: $Enums.PaymentMethod,
    required: true,
  })
  @IsOptional()
  paymentMethod: $Enums.PaymentMethod;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'payment reference',
    type: String,
    required: true,
  })
  paymentReference: string;

  @IsEnum($Enums.Operator, {
    message: 'Operator must be one of AIRTEL_TIGO, MTN, VODAFONE',
  })
  @ApiProperty({
    example: 'Payment method',
    description: 'Payment method',
    type: $Enums.Operator,
    enum: $Enums.Operator,
  })
  @IsOptional()
  operator: $Enums.Operator;

  @IsPhoneNumber('GH')
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'phone number',
    type: String,
    required: true,
  })
  phoneNumber;
}
