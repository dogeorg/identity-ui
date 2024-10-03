import { LitElement, html, css } from '/vendor/@lit/all@3.1.2/lit-all.min.js';
import { updateIdentity } from '/api/id/id.js';
import { store } from "/state/store.js"
import { StoreSubscriber } from "/state/subscribe.js";
import { asyncTimeout } from "/utils/timeout.js";
import { createAlert } from "/components/common/alert.js";

class HomeView extends LitElement {

  static get properties() {
    return { 
      changes: { type: Object },
      inflight: { type: Boolean }
    }
  }

  constructor() {
    super();
    this.ctx = new StoreSubscriber(this, store);
    this.payload = this.ctx?.store?.identityContext?.payload || {};
    this.changes = {};

    this.enabledFields = [
      'name',
      'bio',
      // 'lat',
      // 'long',
      // 'country',
      // 'city',
      // 'icon'
    ]
  }

  requestUpdate() {
    this.payload = this.ctx?.store?.identityContext?.payload || {};
    super.requestUpdate();
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 20px;
    }
    .form-container {
      width: 100%;
      max-width: 400px;
      margin-top: 50px;
    }
    sl-input, sl-textarea, sl-select, sl-button {
      margin-bottom: 20px;
    }

    .hero {
      width: 200px;
      position: relative;
      left: -30px;
      margin-bottom: -30px;
    }
  `;

  render() {
  const formFields = {
    name: html`
      <sl-input name="name" label="Display Name" maxlength="30" required
        .value=${this.payload.name || ''}
        @sl-input=${this._handleChange}></sl-input>
    `,
    bio: html`
      <sl-textarea name="bio" label="Short Biography" maxlength="120" rows="3"
        .value=${this.payload.bio || ''}
        @sl-input=${this._handleChange}></sl-textarea>
    `,
    lat: html`
      <sl-input name="lat" type="number" label="Latitude" 
        min="-90" max="90"
        help-text="WGS84 +/- 90 degrees, 60 seconds (accurate to 1850m)"
        .value=${this.payload.lat || ''}
        @sl-input=${this._handleChange}></sl-input>
    `,
    long: html`
      <sl-input name="long" type="number" label="Longitude"
        min="-180" max="180"
        help-text="WGS84 +/- 180 degrees, 60 seconds (accurate to 1850m)"
        .value=${this.payload.long || ''}
        @sl-input=${this._handleChange}></sl-input>
    `,
    country: html`
      <sl-select name="country" label="Country" clearable
        .value=${this.payload.country || ''}
        @sl-change=${this._handleChange}>
        <sl-option value="">Select a country</sl-option>
        <sl-option value="US">United States</sl-option>
        <sl-option value="CA">Canada</sl-option>
        <sl-option value="PT">Portugal</sl-option>
        <sl-option value="AU">Australia</sl-option>
      </sl-select>
    `,
    city: html`
      <sl-input name="city" label="City" maxlength="30"
        .value=${this.payload.city || ''}
        @sl-input=${this._handleChange}></sl-input>
    `,
    icon: html`
      <sl-input type="file" name="icon" label="Icon" accept="image/*"
        @sl-change=${this._handleFileChange}></sl-input>
    `
  };

  return html`
    <div class="form-container">
      <img src="/static/avatar.png" class="hero" />
      <h2>Edit Identity</h2>
      <form @submit=${this._handleSubmit}>
        ${this.enabledFields.map(field => formFields[field])}
        <sl-button type="submit" variant="warning" ?loading=${this.inflight}>Save Changes</sl-button>
      </form>
    </div>
  `;
}

  _handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.changes = { ...this.changes, [name]: value };
  }

  async _handleSubmit(event) {
    event.preventDefault();
    const data = {};
    this.enabledFields.forEach(field => {
      if (this.changes.hasOwnProperty(field)) {
        data[field] = this.changes[field];
      }
    });

    // Submit
    try {
      this.inflight = true;
      await asyncTimeout(1200);
      await updateIdentity(data);
      createAlert('success', 'Identity updated');
      
      // Clear changes after successful update
      this.changes = {};

    } catch (err) {
      createAlert('warning', 'Failed to update identity');
      console.error('Error updating identity:', err);
    } finally {
      this.inflight = false;
    }
  }
}

customElements.define('x-page-home', HomeView);