import { TestClient } from './utils/test-client';

describe('AppController (e2e)', () => {
  let testClient: TestClient;

  beforeAll(async () => {
    testClient = new TestClient();
    await testClient.init();
  });

  afterAll(async () => {
    await testClient.close();
  });

  it('/ (GET)', async () => {
    await testClient.httpRequest('get', '/hello', {
      statusCode: 200,
    });
  });
});
