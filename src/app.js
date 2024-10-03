import {
  LitElement,
  html,
  nothing,
  classMap,
} from "/vendor/@lit/all@3.1.2/lit-all.min.js";

// Add shoelace once. Use components anywhere.
import { setBasePath } from "/vendor/@shoelace/cdn@2.14.0/utilities/base-path.js";
import "/vendor/@shoelace/cdn@2.14.0/shoelace.js";

// Import stylesheets
import { mainStyles } from "/components/layouts/standard/styles/index.styles.js";

// App state (singleton)
import { store } from "/state/store.js";
import { StoreSubscriber } from "/state/subscribe.js";

// Views
import "/pages/index.js";

// Router (singleton)
import { Router } from "/router/router.js";
import { routes } from "/router/config.js";

// Utils
import debounce from "/utils/debounce.js";
import { bindToClass } from "/utils/class-bind.js";
import { isUnauthedRoute, hasFlushParam } from "/utils/url-utils.js";

// Apis
import { getIdentity } from "/api/id/id.js";

// Do this once to set the location of shoelace assets (icons etc..)
setBasePath("/vendor/@shoelace/cdn@2.14.0/");

class IdentityUI extends LitElement {
  static properties = {
    ready: { type: Boolean },
  };

  static styles = [mainStyles];

  constructor() {
    super();
    this.ready = false;
    this.router = null;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async firstUpdated() {
    // Fetch bootstrap if not on an unauthenticated route (ie, login/logout);
    if (!isUnauthedRoute() && !hasFlushParam()) {
      this.fetchIdentity();
    }

    // Initialise our router singleton and provide it a target elemenet.
    const outlet = this.shadowRoot.querySelector("#Outlet");
    this.router = new Router(outlet);
    this.router.setRoutes(routes)
    this.router.processCurrentRoute();
  }

  async fetchIdentity() {
    try {
      const res = await getIdentity()
      if (res) { console.log('GOT IT') }
    } catch (err) {
      console.warn('Failed to fetch identity')
    } finally {
      this.ready = true;
    }
  }

  render() {
  
    return html`
      <div class="loader-overlay" style="display:${!this.ready ? 'flex' : 'none'}"">
        <sl-spinner style="font-size: 2rem; --indicator-color: #bbb;"></sl-spinner>
      </div>

      <main id="Main">
        <div id="Outlet" style="display:${this.ready ? 'block' : 'none'}"></div>
      </main>
    `;
  }
}

customElements.define("identity-ui", IdentityUI);
