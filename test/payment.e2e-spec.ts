import { $Enums } from '@prisma/client';
import { TestClient } from './utils/test-client';

describe('Payment Processor Controller (e2e)', () => {
  let testClient: TestClient;

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
});
