import { Component } from '@theme/component';
import { StandardEvents } from '@shopify/events';

class FaceloveBundle extends Component {
  #abort;
  #selection = 0;

  connectedCallback() {
    super.connectedCallback();
    this.#abort = new AbortController();
    this.closest('.shopify-section')?.addEventListener(StandardEvents.productSelect, this.#updateOffer, {
      signal: this.#abort.signal,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abort.abort();
    this.#selection++;
  }

  #updateOffer = async (event) => {
    const selection = ++this.#selection;
    try {
      const { detail } = await event.promise;
      if (!this.isConnected || selection !== this.#selection) return;
      this.dataset.unlocked = String(String(detail?.resource?.id) === this.dataset.bundleId);
    } catch {
      // Retain the last confirmed offer when Shopify cannot resolve the new selection.
    }
  };
}

if (!customElements.get('facelove-bundle')) customElements.define('facelove-bundle', FaceloveBundle);
