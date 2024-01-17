import { Module } from '@nestjs/common';
import { PhoneNumberService } from './services/phone-number.service';
import { HttpModule } from '@nestjs/axios';
import { XYZService } from './services/xyz.service';

@Module({
  imports: [HttpModule],
  providers: [PhoneNumberService, XYZService],
  exports: [PhoneNumberService, XYZService],
})
export class SharedModule {}
