import { LitElement, html, css, nothing } from '/vendor/@lit/all@3.1.2/lit-all.min.js';
import { refreshIdentity, updateIdentity } from '/api/id/id.js';
import { store } from "/state/store.js"
import { StoreSubscriber } from "/state/subscribe.js";
import { asyncTimeout } from "/utils/timeout.js";
import { createAlert } from "/components/common/alert.js";
import { countries } from './fixture-countries.js';
import { styles } from './styles.js';
import "/components/views/map-marker.js";

class HomeView extends LitElement {

  static get properties() {
    return { 
      changes: { type: Object },
      inflight: { type: Boolean },
      iconCleared: { type: Boolean },
      hasNewIcon: { type: Boolean },
    }
  }

  constructor() {
    super();
    this.ctx = new StoreSubscriber(this, store);
    this.payload = this.ctx?.store?.identityContext?.payload || {};
    this.changes = {};
    this.iconCleared = false;
    this.hasNewIcon = false;

    this.enabledFields = [
      '_HEADING_DESCRIBE',
      'icon',
      'name',
      'bio',
      '_HEADING_LOCATION',
      'country',
      'city',
      '_HEADING_MAP_MARKER',
      'lat',
      'long',
    ]
  }

  requestUpdate() {
    this.payload = this.ctx?.store?.identityContext?.payload || {};
    super.requestUpdate();
  }

  static styles = [styles];

  render() {
    const formFields = {
      _HEADING_DESCRIBE: html`
        <h3>About you</h3>
      `,
      _HEADING_LOCATION: html`
        <sl-divider style="--spacing: 2rem;"></sl-divider>
        <h3>Location</h3>
      `,
      _HEADING_MAP_MARKER: html`
        <sl-divider style="--spacing: 2rem;"></sl-divider>
        <h3>Map Marker</h3>
      `,
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
      country: html`
        <sl-select name="country" label="Country" clearable
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
          .value=${this.payload.city || ''}
          @sl-input=${this._handleChange}></sl-input>
      `,
      lat: html`
        <sl-input name="lat" type="text" label="Latitude" 
          pattern="^-?([0-8]?[0-9](\.[0-9]*)?|90(\.0*)?)$"
          help-text="WGS84 +/- 90 degrees (eg: 55.3)"
          .value=${this.payload.lat || ''}
          @sl-input=${this._handleChange}></sl-input>
      `,
      long: html`
        <sl-input name="long" type="text" label="Longitude"
          pattern="^-?(([0-9]|[1-9][0-9]|1[0-7][0-9])(\.[0-9]*)?|180(\.0*)?)$"
          help-text="WGS84 +/- 180 degrees (eg: -174.3)"
          .value=${this.payload.long || ''}
          @sl-input=${this._handleChange}></sl-input>
      `,
      icon: html`
        <span>Icon</span>
        <div class="icon-view">
          ${this.iconCleared || (!this.changes.icon && !this.payload.icon) ? html`
            <sl-icon name="person-circle" class="default-icon"></sl-icon>
          ` : html`
            <canvas id="icon-canvas" width="48" height="48"></canvas>
          `}
        </div>
        <div class="icon-actions">
          <label for="icon-upload">Select image</label>
          <input id="icon-upload" type="file" name="icon" accept="image/*" @change=${this._handleFileChange}>
          <sl-button variant="text" size="small" @click=${this._handleRemoveImage}>Remove</sl-button>
        </div>
      `
    };

    return html`
      <div class="form-container">
        <div class="header" style="position: relative;">
          <img src="/static/avatar.png" class="hero" />
          <h2 id="title">Edit Identity<span class="gap"> </span></h2>

          <sl-divider style="--spacing: 2rem;"></sl-divider>
          
          <sl-alert variant="warning" open style="text-align:left" closable>
            <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
            <strong>This information is public.</strong><br />
            Consider carefully before disclosing personal data.
          </sl-alert>
        </div>
        <form @submit=${this._handleSubmit}>
          ${this.enabledFields.map(field => formFields[field])}
          <sl-divider style="--spacing: 2rem;"></sl-divider>
          <sl-button type="submit" variant="primary" ?loading=${this.inflight}>Save Changes</sl-button>
        </form>
      </div>
    `;
  }

  _handleChange(event) {
    const name = event.target.name;
    let value = event.target.value;
    
    // Convert lat and long to numbers
    if (name === 'lat' || name === 'long') {
      value = value === '' ? null : parseFloat(value);
    }
    
    this.changes = { ...this.changes, [name]: value };
  }

  _handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 48;
          canvas.height = 48;
          const ctx = canvas.getContext('2d', { colorSpace: "srgb" });
          ctx.drawImage(img, 0, 0, 48, 48);
          const imageData = ctx.getImageData(0, 0, 48, 48);
          const options = 1 + 4 + 24; // linear + weighted average
          const compressed = DogeIcon.compress(imageData.data, 4, options);
          
          // Store the compressed result (an array) on changes object
          this.changes = { ...this.changes, icon: compressed.comp };
          
          // Set flag to indicate we have a new icon
          this.hasNewIcon = true;
          this.iconCleared = false;

          this.requestUpdate();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async _drawCompressedIcon(compressedData) {
    await this.updateComplete;
    if (!compressedData) { 
      return 
    }
    const canvas = this.shadowRoot.querySelector('#icon-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d', { colorSpace: "srgb" });
      const uncompressed = DogeIconUn.uncompress(compressedData);
      
      if (uncompressed.length !== 48 * 48 * 3) {
        console.error('Unexpected uncompressed data length', uncompressed.length);
        return;
      }

      // Convert RGB to RGBA
      const rgbaData = new Uint8ClampedArray(48 * 48 * 4);
      for (let i = 0, j = 0; i < uncompressed.length; i += 3, j += 4) {
        rgbaData[j] = uncompressed[i];     // R
        rgbaData[j + 1] = uncompressed[i + 1]; // G
        rgbaData[j + 2] = uncompressed[i + 2]; // B
        rgbaData[j + 3] = 255; // A (fully opaque)
      }

      const imageData = new ImageData(rgbaData, 48, 48);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (this.hasNewIcon) {
      this._drawCompressedIcon(this.changes.icon);
      return;
    }
    if (this.payload.icon) {
      this._drawCompressedIcon(this.payload.icon);
    }

  }

  _handleRemoveImage(event) {
    event.preventDefault();
    this.iconCleared = true;
    this.hasNewIcon = false;
    this.changes = { ...this.changes, icon: null };
    this.requestUpdate();
  }

  async _handleSubmit(event) {
    event.preventDefault();
    const data = { ...this.payload, ...this.changes };

    // Check if any field is invalid
    const formFields = this.shadowRoot.querySelectorAll('sl-input, sl-textarea, sl-select');
    const hasInvalidField = Array.from(formFields).some(field => field.hasAttribute('data-invalid'));

    if (hasInvalidField) {
      createAlert('warning', 'Uh oh, invalid data detected.');
      return;
    }

    // Base64 encode compressed icon.
    if (data.icon) {
      data.icon = btoa(String.fromCharCode.apply(null, data.icon));
    }

    // Ensure lat and long are numbers or null
    data.lat = data.lat === '' ? null : parseFloat(data.lat);
    data.long = data.long === '' ? null : parseFloat(data.long);

    try {
      this.inflight = true;
      await asyncTimeout(1200);
      
      // post data to backend
      await updateIdentity(data);

      // Clear changes after successful update
      this.changes = {};

      // after saving the identity, fetch fresh payload from backend.
      await refreshIdentity();

      // celebrate.
      createAlert('success', 'Identity updated');

    } catch (err) {
      createAlert('warning', 'Failed to update identity');
      console.error('Error updating identity:', err);
    } finally {
      this.inflight = false; // stop loading spinner
      this.hasNewIcon = false; // reset flag (triggers icon redraw)
    }
  }
}

customElements.define('x-page-home', HomeView);