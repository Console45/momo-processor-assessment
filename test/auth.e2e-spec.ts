import { TestClient } from './utils/test-client';

describe('AuthController (e2e)', () => {
  let testClient: TestClient;

  beforeAll(async () => {
    testClient = new TestClient();
    await testClient.init();
  });

  afterAll(async () => {
    await testClient.close();
  });

  it('/register client', async () => {
    await testClient.httpRequest('post', '/auth/register', {
      statusCode: 201,
      payload: {
        name: 'app2',
      },
    });
  });
});
