import { $Enums, PrismaClient } from '@prisma/client';
import { TestClient } from './utils/test-client';

describe('Payment Processor Controller (e2e)', () => {
  let testClient: TestClient;
  const prismaClient = new PrismaClient();

  beforeAll(async () => {
    testClient = new TestClient();
    await testClient.init();
  });

  afterAll(async () => {
    await testClient.close();
  });

  it('process payment', async () => {
    const res = await testClient.httpRequest('post', '/auth/register', {
      statusCode: 201,
      payload: {
        name: 'app2',
      },
    });
    expect(res?.apiKeys[0].key).toBeDefined();
    const payload = {
      amount: 100,
      paymentReference: 'ss1155sas2xssx',
      phoneNumber: '+233557452509',
    };
    const response = await testClient.httpRequest('post', '/payment/initiate', {
      statusCode: 201,
      headers: {
        'x-api-key': res?.apiKeys[0].key,
      },
      payload,
    });
    expect(response?.paymentReference).toEqual(payload.paymentReference);
    expect(response?.amount).toEqual(payload.amount);
    expect(`+${response?.phoneNumber}`).toEqual(payload.phoneNumber);
    expect(response?.status).toEqual($Enums.PaymentStatus.initiated);
  });
  it('test success callback', async () => {
    const res = await testClient.httpRequest('post', '/auth/register', {
      statusCode: 201,
      payload: {
        name: 'app3',
      },
    });
    expect(res?.apiKeys[0].key).toBeDefined();
    const payload = {
      amount: 100,
      paymentReference: 'ss11551sas2xssx',
      phoneNumber: '+233557452509',
    };
    await testClient.httpRequest('post', '/payment/initiate', {
      statusCode: 201,
      headers: {
        'x-api-key': res?.apiKeys[0].key,
      },
      payload,
    });
    const callbackPayload = {
      statusCode: 200,
      data: {
        status: 'success',
        amount: '100',
        reference: '935452593501',
        externalReference: payload.paymentReference,
      },
    };
    await testClient.httpRequest('post', '/payment/callback', {
      statusCode: 200,
      headers: {
        'x-api-key': res?.apiKeys[0].key,
      },
      payload: callbackPayload,
    });
    const data = await prismaClient.payment.findUnique({
      where: {
        paymentReference: payload.paymentReference,
      },
      include: {
        paymentData: true,
      },
    });
    expect(data).toBeDefined();
    expect(data?.status).toEqual($Enums.PaymentStatus.success);
    expect(data?.paymentData?.callbackResponseText).toEqual(
      JSON.stringify(callbackPayload),
    );
  });
  it('test failed callback', async () => {
    const res = await testClient.httpRequest('post', '/auth/register', {
      statusCode: 201,
      payload: {
        name: 'app1',
      },
    });
    expect(res?.apiKeys[0].key).toBeDefined();
    const payload = {
      amount: 100,
      paymentReference: 'sxssx',
      phoneNumber: '+233557452509',
    };
    await testClient.httpRequest('post', '/payment/initiate', {
      statusCode: 201,
      headers: {
        'x-api-key': res?.apiKeys[0].key,
      },
      payload,
    });
    const callbackPayload = {
      statusCode: 200,
      data: {
        status: 'failed',
        amount: '100',
        reference: '93522193501',
        externalReference: payload.paymentReference,
      },
    };
    await testClient.httpRequest('post', '/payment/callback', {
      statusCode: 200,
      headers: {
        'x-api-key': res?.apiKeys[0].key,
      },
      payload: callbackPayload,
    });
    const data = await prismaClient.payment.findUnique({
      where: {
        paymentReference: payload.paymentReference,
      },
      include: {
        paymentData: true,
      },
    });
    expect(data).toBeDefined();
    expect(data?.status).toEqual($Enums.PaymentStatus.failed);
    expect(data?.paymentData?.callbackResponseText).toEqual(
      JSON.stringify(callbackPayload),
    );
  });
});
