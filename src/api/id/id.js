import ApiClient from '/api/client.js';
import { store } from '/state/store.js'
import { mockGetResponse, mockUpdateResponse } from './identity.mocks.js'

const client = new ApiClient(store.networkContext.apiBaseUrl)

export async function getIdentity() {
  const payload = await client.get('/profile', { mock: mockGetResponse });
  if (payload.icon && typeof payload.icon === "string") {
    payload.icon = new Uint8Array(atob(payload.icon).split('').map(char => char.charCodeAt(0)));
  }
  return payload
}

export async function refreshIdentity() {
  const payload = await client.get('/profile', { mock: mockGetResponse });
  if (payload.icon && typeof payload.icon === "string") {
    payload.icon = new Uint8Array(atob(payload.icon).split('').map(char => char.charCodeAt(0)));
  }
  store.updateState({ identityContext: { payload }})
}

export async function updateIdentity(body) {
  return client.post('/profile', body, { mock: mockUpdateResponse });
}