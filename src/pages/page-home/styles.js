import { css } from '/vendor/@lit/all@3.1.2/lit-all.min.js';

export const styles = css`
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
    margin-bottom: -10px;
    border-radius: 150px;
  }

  .icon-view {
    width: 48px;
    height: 48px;
    background: #222;
    border: 1px solid #444;
    margin: 0.2em 0 0.7em 0;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon-view canvas {
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
    background-color: yellow;
    display: inline-block;
    padding: 0.1em 1em;
    cursor: pointer;
    border-radius: 4px;
  }

  label[for="icon-upload"]:hover {
    background-color: #f2f276;
  }

  .help-text {
    font-size: 0.8em;
    color: #666;
    margin-top: 0.5em;
  }

  #title .gap {
    position: relative;
  }

  #title .gap::after {
    content: "public";
    position: absolute;
    display: inline-block;
    bottom: 10px;
    font-size: 0.9rem;
    padding: 0em 0.2em;
    line-height: 1.1;
    background: yellow;
    color: black;
    font-family: 'Comic Neue';
    transform-origin: center center;
    transform: rotate(18deg) translateX(-50%);
  }

  h3 {
    font-family: 'Comic Neue';
    font-size: 1.5rem;
    color: yellow;
  }

  .desc {
    display: inline-block; 
    position: relative;
    bottom: 2rem;
    font-family: 'Comic Neue';
  }
`;
