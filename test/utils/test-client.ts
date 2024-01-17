import { TestClientBase } from './test-client-base';

export class TestClient extends TestClientBase {
  async init(): Promise<void> {
    await super.init();
  }
}
