import ApiClient from '/api/client.js';
import { store } from '/state/store.js'
import { mockGetResponse, mockPutResponse } from './identity.mocks.js'

const client = new ApiClient(store.networkContext.apiBaseUrl)

export async function getIdentity() {
  return client.get('/identity', { mock: mockGetResponse });
}

export async function updateIdentity(body) {
  return client.put('/identity', body, { mock: mockPutResponse });
}