import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'client name. should be unique',
    type: String,
    required: true,
  })
  name: string;
}
