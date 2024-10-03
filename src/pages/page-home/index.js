import { LitElement, html, css } from '/vendor/@lit/all@3.1.2/lit-all.min.js';

class HomeView extends LitElement {

  static styles = css`
    :host {
      display: block;
      padding: 20px;
    }
  `

  constructor() {
    super();
      }

  render() {
    return html`
      <h1>Stuff</h1>
    `;
  }
}

customElements.define('x-page-home', HomeView);