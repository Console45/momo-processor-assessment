import { Module } from '@nestjs/common';
import { PhoneNumberService } from './services/phone-number.service';

@Module({
  providers: [PhoneNumberService],
  exports: [PhoneNumberService],
})
export class SharedModule {}
