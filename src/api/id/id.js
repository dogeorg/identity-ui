import ApiClient from '/api/client.js';
import { store } from '/state/store.js'
import { mock } from './identity.mocks.js'

const client = new ApiClient(store.networkContext.apiBaseUrl)

export async function getIdentity() {
  return client.get('/identity', { mock });
}