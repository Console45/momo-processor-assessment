import { TestClient } from './utils/test-client';

describe('Client Controller (e2e)', () => {
  let testClient: TestClient;

  beforeAll(async () => {
    testClient = new TestClient();
    await testClient.init();
  });

  afterAll(async () => {
    await testClient.close();
  });

  it('get client me', async () => {
    const res = await testClient.httpRequest('post', '/auth/register', {
      statusCode: 201,
      payload: {
        name: 'app2',
      },
    });
    expect(res?.apiKeys[0].key).toBeDefined();
    await testClient.httpRequest('get', '/client/me', {
      statusCode: 200,
      headers: {
        'x-api-key': res?.apiKeys[0].key,
      },
    });
  });
  it('throw error on auth failure', async () => {
    await testClient.httpRequest('get', '/client/me', {
      expectErrorCode: 401,
    });
  });
});
