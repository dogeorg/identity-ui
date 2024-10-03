import ApiClient from '/api/client.js';
import { store } from '/state/store.js'
import { mockGetResponse, mockUpdateResponse } from './identity.mocks.js'

const client = new ApiClient(store.networkContext.apiBaseUrl)

export async function getIdentity() {
  return client.get('/ident', { mock: mockGetResponse });
}

export async function updateIdentity(body) {
  return client.post('/ident', body, { mock: mockUpdateResponse });
}