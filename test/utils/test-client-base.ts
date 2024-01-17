import { INestApplication } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';

import { TestLogger } from './logger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { PrismaClient } from '@prisma/client';

export class TestClientBase {
  defaultHeaders: Record<string, string> = {};

  protected _app: INestApplication;

  get app() {
    return this._app;
  }

  protected _testingModule: TestingModule;

  get testingModule(): TestingModule {
    return this._testingModule;
  }
  protected prisma = new PrismaClient();

  async init(configurator?: (builder: TestingModuleBuilder) => void) {
    const builder = Test.createTestingModule({
      imports: [AppModule],
    });
    if (configurator) {
      configurator(builder);
    }

    builder.setLogger(new TestLogger());
    this._testingModule = await builder.compile();

    this._app =
      this._testingModule.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
      );

    await this._app.init();
    await this._app.getHttpAdapter().getInstance().ready();

    await this.prisma.$connect();
    const res = await this.prisma.client.deleteMany({});
    console.log(res);
  }

  async close() {
    await this._app.close();
    await this.prisma.$disconnect();
  }

  async httpOperation(
    method: 'post' | 'get' | 'patch' | 'delete' | 'put',
    path: string,
    opts: {
      payload?: any;
      query?: any;
      files?: Record<string, { path: string }>;
      fields?: Record<string, any>;
      expectErrorCode?: string | number;
      statusCode?: string | number;
    } = {},
  ) {
    const headers = { ...this.defaultHeaders };
    const rb = request(this.app.getHttpServer())
      [method](path)
      .set(headers)
      .query(opts?.query);
    if (opts.files) {
      for (const [k, v] of Object.entries(opts.files)) {
        rb.attach(k, v.path);
      }
    }
    if (opts.fields) {
      rb.field(opts.fields);
    }
    let resp = null;
    if (opts.payload) {
      resp = await rb.send(opts.payload ? opts.payload : undefined);
    } else {
      resp = await rb;
    }
    const statusCode = resp.body.statusCode ?? null;
    const statusMessage = resp.body.message ?? null;
    const statusError = resp.body.error ?? null;

    if (statusCode) console.log('statusCode', statusCode);
    if (statusMessage) console.log('statusMessage', statusMessage);
    if (statusError) console.log('statusError', statusError);

    if (opts.expectErrorCode) {
      expect(resp.body.statusCode).toEqual(opts.expectErrorCode);
    }

    if (opts.statusCode) {
      expect(resp.status).toEqual(opts.statusCode);
    }

    return resp;
  }

  async httpRequest<T = any>(
    method: 'post' | 'get' | 'patch' | 'delete' | 'put',
    path: string,
    opts: {
      payload?: any;
      query?: any;
      files?: Record<string, { path: string }>;
      fields?: Record<string, any>;
      expectErrorCode?: string | number;
      statusCode?: string | number;
    } = {},
  ): Promise<T> {
    const response = await this.httpOperation(method, path, opts);
    return response.body;
  }
}
