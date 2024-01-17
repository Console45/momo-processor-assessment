import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { globalConfig } from 'src/config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class PhoneNumberService {
  // onModuleInit() {
  //   this.sendSMS("Hello World", "+233557452509");
  // }
  @Inject(globalConfig.KEY)
  config: ConfigType<typeof globalConfig>;

  private countryCode = '233';

  readonly providers: Record<string, string[]> = {
    MTN: ['24', '54', '55', '59', '53'],
    VODAFONE: ['20', '30', '50'],
    AIRTEL_TIGO: ['57', '26', '56', '27'],
    GLO: ['23'],
    EXPRESSO: ['28'],
    UBI: ['72'],
  };
  setCountryCode(code: string) {
    this.countryCode = code;
  }

  /**
   * Format a number to `23320000...`
   *
   * @param {string} number The number to format
   * @returns The formatted number
   */
  toCode(number: string) {
    number = this.toBase(number);
    number = this.countryCode + number;

    return number;
  }

  toInternational(number: string) {
    return `+${this.toCode(number)}`;
  }

  /**
   * Format a number to `20000...`
   *
   * @param {string} number The number to format
   * @returns The formatted number
   */
  toBase(number: string) {
    if (this.firstDigit(number) === '0') {
      number = number.substring(1);
    }

    if (this.strip(number, 3) === `+${this.countryCode.substring(0, 2)}`) {
      number = number.substring(4);
    }

    if (this.strip(number, 3) === this.countryCode) {
      number = number.substring(3);
    }

    return number;
  }

  /**
   * Format a number to `020000...`
   *
   * @param {string} number The number to format
   * @returns The formatted number
   */
  toRaws(number: string) {
    number = this.toBase(number);
    number = `0${number}`;

    return number;
  }

  /**
   * Format a number to hashed value
   *
   * @param {string} number The number to format
   * @returns The hashed string
   */
  toHashed(number: string) {
    number = this.toCode(number);
    return createHash('sha1').update(number).digest('hex');
  }

  /**
   * Hide numbers between beginning and the end of phone number `020****99`
   *
   * @param {string} number The number to mask
   */
  withPrivacy(number) {
    return this.toRaws(number).replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
  }

  /**
   * Get network provider from phone number
   *
   * @param {string} number The phone number to check
   * @returns The network provider
   */
  provider(number: string) {
    let serviceProvider: string;

    number = this.toBase(number);
    const providerString = number.substring(0, 2);

    Object.keys(this.providers).forEach((provider) => {
      if (this.providers[provider].includes(providerString)) {
        serviceProvider = provider;
        return;
      }
    });

    return serviceProvider;
  }

  /**
   * Get the first digit of a phone number
   *
   * @param {string} number The phone number
   * @returns The first digit
   */
  firstDigit(number: string) {
    return number.substring(0, 1);
  }

  /**
   * Get the first X digits of a phone number
   *
   * @param {string} number The phone number
   * @param {number} length The expected length of the phone number
   * @returns The first X digits of the phone number
   */
  strip(number: string, length: number) {
    return number.substring(0, length);
  }
}
