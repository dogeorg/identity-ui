import { LitElement, html, css, nothing } from '/vendor/@lit/all@3.1.2/lit-all.min.js';
import { updateIdentity } from '/api/id/id.js';
import { store } from "/state/store.js"
import { StoreSubscriber } from "/state/subscribe.js";
import { asyncTimeout } from "/utils/timeout.js";
import { createAlert } from "/components/common/alert.js";
import { countries } from './fixture-countries.js';


class HomeView extends LitElement {

  static get properties() {
    return { 
      changes: { type: Object },
      inflight: { type: Boolean },
      iconCleared: { type: Boolean },
    }
  }

  constructor() {
    super();
    this.ctx = new StoreSubscriber(this, store);
    this.payload = this.ctx?.store?.identityContext?.payload || {};
    this.changes = {};
    this.iconCleared = false;

    this.enabledFields = [
      'name',
      'bio',
      'icon',
      // 'lat',
      // 'long',
      'country',
      'city',
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
    }
    .form-container {
      width: 100%;
      
      margin-top: 0px;
      margin-bottom: 0px;
      padding: 40px 20px 20px 20px;
      background: #181b20;
      @media (min-width: 576px) {
        padding: 40px 80px 80px 80px;
        max-width: 400px;
      }
    }
    sl-input, sl-textarea, sl-select, sl-button {
      margin-bottom: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 3em;
    }

    .hero {
      width: 150px;
      position: relative;
      margin-bottom: -20px;
      background: #c8b069;
      border-radius: 150px;
    }

    .icon-view {
      width: 100px;
      height: 100px;
      background: #222;
      border: 1px solid #444;
      margin: 0.2em 0 0.7em 0;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .icon-view img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .icon-view .default-icon {
      font-size: 3rem;
      color: #666;
    }

    input[type="file"] {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }

    label[for="icon-upload"] {
      font-size: 0.8rem;
      font-weight: normal;
      color: black;
      background-color: #c8b069;
      display: inline-block;
      padding: 0.1em 1em;
      cursor: pointer;
      border-radius: 4px;
    }

    label[for="icon-upload"]:hover {
      background-color: #f2dea0;
    }

    .help-text {
      font-size: 0.8em;
      color: #666;
      margin-top: 0.5em;
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
        help-text="(Optional)"
        .value=${this.payload.bio || ''}
        @sl-input=${this._handleChange}></sl-textarea>

        <sl-divider></sl-divider>
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
        help-text="(Optional)"
        .value=${this.payload.country || ''}
        @sl-change=${this._handleChange}>
        <sl-option value="">Select a country</sl-option>
        ${countries.map(country => html`
          <sl-option value=${country.code}>${country.label}</sl-option>
        `)}
      </sl-select>
    `,
    city: html`
      <sl-input name="city" label="City" maxlength="30"
        help-text="(Optional)"
        .value=${this.payload.city || ''}
        @sl-input=${this._handleChange}></sl-input>
    `,
    icon: html`
      <span>Display image</span>
      <div class="icon-view">
        ${this.iconCleared || (!this.changes.icon && !this.payload.icon) ? html`
          <sl-icon name="person-circle" class="default-icon"></sl-icon>
        ` : html`
          <img src="${this.changes.icon || this.payload.icon}" alt="User icon">
        `}
      </div>
      <div class="icon-actions">
        <label for="icon-upload">Select image</label>
        <input id="icon-upload" type="file" name="icon" accept="image/*" @change=${this._handleFileChange}>
        <sl-button variant="text" size="small" @click=${this._handleRemoveImage}>Remove</sl-button>
      </div>
      <div class="help-text">(Optional)</div>
      <sl-divider></sl-divider>
    `
  };

  return html`
    <div class="form-container">
      <div class="header">
        <img src="/static/avatar.png" class="hero" />
        <h2>Edit Identity</h2>
        <sl-divider></sl-divider>
      </div>
      <form @submit=${this._handleSubmit}>
        ${this.enabledFields.map(field => formFields[field])}
        <sl-divider></sl-divider>
        <sl-button type="submit" variant="primary" ?loading=${this.inflight}>Save Changes</sl-button>
      </form>
    </div>
  `;
}

  _handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.changes = { ...this.changes, [name]: value };
  }

  _handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.iconCleared = false;
        this.changes = { ...this.changes, icon: e.target.result };
        this.requestUpdate();
      };
      reader.readAsDataURL(file);
    }
  }

  _handleRemoveImage(event) {
    event.preventDefault();
    this.iconCleared = true;
    this.changes = { ...this.changes, icon: "" };
    this.requestUpdate();
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