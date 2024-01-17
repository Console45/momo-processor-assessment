import { PrismaClient } from '@prisma/client';
import { TestClient } from './utils/test-client';

describe('AuthController (e2e)', () => {
  let testClient: TestClient;
  const prismaClient = new PrismaClient();

  beforeAll(async () => {
    testClient = new TestClient();
    await testClient.init();
  });

  afterAll(async () => {
    await testClient.close();
  });

  it('register client', async () => {
    const res = await testClient.httpRequest('post', '/auth/register', {
      statusCode: 201,
      payload: {
        name: 'app2',
      },
    });
    expect(res?.name).toBe('app2');
  });

  it('throw error on existing client with name', async () => {
    prismaClient.client.create({
      data: {
        name: 'app2',
      },
    });
    await testClient.httpRequest('post', '/auth/register', {
      expectErrorCode: 409,
      payload: {
        name: 'app2',
      },
    });
  });
});
