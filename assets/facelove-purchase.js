import { Component } from '@theme/component';
import { StandardEvents } from '@shopify/events';

class FacelovePurchase extends Component {
  #abort;
  #selection = 0;
  #available;

  connectedCallback() {
    super.connectedCallback();
    this.#abort = new AbortController();
    this.#available = !this.querySelector('button[name="add"]')?.disabled;
    document.addEventListener(StandardEvents.productSelect, this.#select, { signal: this.#abort.signal });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abort.abort();
    this.#selection++;
  }

  #select = async (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('.product-information')) return;
    const input = this.querySelector('input[name="id"]');
    const button = this.querySelector('button[name="add"]');
    const label = this.querySelector('[data-purchase-label]');
    if (!input || !button || !label) return;
    const selection = ++this.#selection;
    // Prevent a stale-variant purchase while Shopify resolves the main picker.
    button.disabled = true;
    try {
      const { detail } = await event.promise;
      if (!this.isConnected || selection !== this.#selection) return;
      if (String(detail?.productId) !== this.dataset.productId) {
        button.disabled = !this.#available;
        return;
      }
      input.value = detail.resource?.id ?? '';
      this.#available = Boolean(detail.resource?.available);
      button.disabled = !this.#available;
      label.textContent = button.disabled ? this.dataset.unavailableLabel : `${this.dataset.addLabel} — ${detail.resource.title}`;
    } catch {
      if (this.isConnected && selection === this.#selection) button.disabled = !this.#available;
    }
  };
}

if (!customElements.get('facelove-purchase')) customElements.define('facelove-purchase', FacelovePurchase);
