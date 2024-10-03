import { store } from "/state/store.js";
import { ReactiveClass } from "/utils/class-reactive.js";
import { StoreSubscriber } from "/state/subscribe.js";

export default class ApiClient extends ReactiveClass {
  constructor(baseURL, options = {}) {
    super();
    this.baseURL = baseURL

    this.context = new StoreSubscriber(this, store);
    this.networkContext = this.context.store.networkContext;
    this.options = options;

    if (this.networkContext && this.networkContext.overrideBaseUrl && !this.options.externalAPI) {
      this.baseURL = this.networkContext.apiBaseUrl || 'http://nope.localhost:6969';
    }
  }

  requestUpdate() {
    super.requestUpdate();
    this.networkContext = this.context.store.networkContext;
  }

  async get(path, config = {}) {
    return this.request(path, { ...config, method: 'GET' });
  }

  async post(path, body, config = {}) {
    return this.request(path, { ...config, method: 'POST', body });
  }

  async put(path, body, config = {}) {
    return this.request(path, { ...config, method: 'PUT', body });
  }

  async delete(path, body, config = {}) {
    return this.request(path, { ...config, method: 'DELETE', body });
  }

  async request(path, config) {

    // if config.body is an empty object, remove the property.
    // this is to prevent the browser from sending an empty body to the server
    // which is not what we want.
    if (Object.keys(config.body || {}).length === 0) {
      delete config.body;
    } else {
      config.body = JSON.stringify(config.body);
    }

    // Debug, if the dev has forceDelay, wait the delay time in seconds before making request
    if (this.networkContext.forceDelayInSeconds) {
      await new Promise(resolve => setTimeout(resolve, this.networkContext.forceDelayInSeconds * 1000));
    }

    // If mocks enabled, avoid making legitimate request, return mocked response (success or error) instead.
    const hasMock = !!config.mock
    const useMocks = this.networkContext.useMocks
    if (useMocks && hasMock) {
      return await returnMockedResponse(path, config, this.networkContext)
    }

    // Otherwise, perform the fetch request
    const url = new URL(path, this.baseURL).href;
    const headers = { 'Content-Type': 'application/json', ...config.headers };

    if (this.networkContext.token && !this.options.externalAPI) {
      headers.Authorization = `Bearer ${this.networkContext.token}`
    }

    let response, data

    try {
      response = await fetch(url, { ...config, headers });
    } catch (fetchErr) {
      throw new Error('An error occurred while fetching data, refer to network logs');
    }

    if (response.status === 404) {
      throw new Error(`Resource not found: ${url}`);
    }

    if (response.status === 403) {
      return { success: false, error: true, status: 403 }
    }

    if (response.status === 401) {
      return window.location.href = window.location.origin + "/logout"
    }

    if (!response.ok) {
      console.warn('Unsuccessful respose', { status: response.status })
      throw new Error(response.error || `Request failed with error code: ${response.status}`);
    }

    try {
      data = await response.json();
    } catch (jsonParseErr) {
      console.warn('Could not JSON parse response from server', jsonParseErr);
      throw new Error('Could not JSON parse response from server');
    }

    return data;
  }
}

async function returnMockedResponse(path, config, networkContext) {

  const { forceFailures, reqLogs } = networkContext;

  reqLogs && console.group('Mock Request', path)
  reqLogs && console.log(`Req (${config.method}):`, config.body || '--no-body');

  const response = (typeof config.mock.res === 'function')
    ? config.mock.res(path, { forceFailures })
    : getMockedSuccessOrError(path, config.mock.res, forceFailures);
    reqLogs && console.log('Res:', response);
    reqLogs && console.groupEnd();

  return response
}

function getMockedSuccessOrError(path, mock, forceFailures) {
  // When forcing failure
  if (forceFailures) {
    throw new Error(`Simulated error returned from ${path}`)
  }
  return mock;
}

function isMockEnabled(group, name, method, networkContext) {
  if (!group || !name || !method) {
    console.warn('Mock check was provided invalid group, name or method', arguments)
    return false;
  }

  return networkContext[`mock::${group}::${name}::${method}`]
}
