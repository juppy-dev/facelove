import { Component } from '@theme/component';

/** @extends {Component<{ track: HTMLElement, previous: HTMLButtonElement, next: HTMLButtonElement }>} */
class FaceloveLoop extends Component {
  #abort;
  #resize;
  #timer;
  #frame;
  #resetFrame;
  #cards = [];
  #count = 0;
  #index = 0;

  connectedCallback() { super.connectedCallback(); this.#connect(); }
  updatedCallback() { super.updatedCallback(); this.#connect(); }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#clean();
  }

  #clean() {
    this.#abort?.abort();
    this.#resize?.disconnect();
    clearTimeout(this.#timer);
    cancelAnimationFrame(this.#frame);
    cancelAnimationFrame(this.#resetFrame);
  }

  #connect() {
    this.#clean();
    const { track, previous, next } = this.refs;
    for (const clone of track.querySelectorAll('[data-loop-clone]')) clone.remove();
    const originals = [...track.children].filter(card => card.classList.contains('facelove-ugc__card'));
    this.#count = originals.length;
    if (!this.#count) return;
    // Inert copies provide the visual runway; only original cards expose playback and product links.
    const copies = () => originals.map(card => {
      const clone = card.cloneNode(true);
      clone.dataset.loopClone = 'true';
      clone.inert = false;
      clone.querySelector('facelove-video').inert = true;
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('data-shopify-editor-block');
      for (const element of clone.querySelectorAll('[id]')) element.removeAttribute('id');
      return clone;
    });
    if (this.#count > 1) { track.prepend(...copies()); track.append(...copies()); }
    this.#cards = [...track.children].filter(card => card.classList.contains('facelove-ugc__card'));
    this.#index = this.#count > 1 ? this.#count + Math.floor(this.#count / 2) : 0;
    this.#abort = new AbortController();
    const options = { signal: this.#abort.signal };
    track.addEventListener('scroll', this.#scroll, { ...options, passive: true });
    track.addEventListener('scrollend', this.#settle, options);
    track.addEventListener('keydown', this.#keyboard, options);
    previous.disabled = next.disabled = this.#count < 2;
    this.dataset.ready = 'true';
    this.#resize = new ResizeObserver(() => this.#go(this.#index, false));
    this.#resize.observe(track);
    this.#go(this.#index, false);
  }

  #go(index, smooth = true) {
    const { track } = this.refs;
    const card = this.#cards[index];
    if (!card) return;
    const box = card.getBoundingClientRect(), viewport = track.getBoundingClientRect();
    // Absolute targets let a loop reset cross snap-stop points without stopping at an intermediate card.
    track.scrollTo({ left: track.scrollLeft + box.left + box.width / 2 - viewport.left - viewport.width / 2, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' });
    if (!smooth) this.#update();
  }

  #update = () => {
    const viewport = this.refs.track.getBoundingClientRect();
    const center = viewport.left + viewport.width / 2;
    let nearest = Infinity;
    this.#cards.forEach((card, index) => {
      const box = card.getBoundingClientRect(), distance = Math.abs(box.left + box.width / 2 - center);
      if (distance < nearest) { nearest = distance; this.#index = index; }
    });
    this.#cards.forEach((card, index) => {
      const active = index === this.#index;
      card.dataset.active = String(active);
      card.inert = !active && !card.hasAttribute('data-loop-clone');
      if (!active) card.querySelector('video')?.pause();
    });
  };

  #scroll = () => {
    cancelAnimationFrame(this.#frame);
    this.#frame = requestAnimationFrame(this.#update);
    clearTimeout(this.#timer);
    this.#timer = setTimeout(this.#settle, 160);
  };

  #settle = () => {
    clearTimeout(this.#timer);
    this.#update();
    if (this.#count < 2 || (this.#index >= this.#count && this.#index < 2 * this.#count)) return;
    this.dataset.repositioning = 'true';
    this.#go(this.#count + this.#index % this.#count, false);
    cancelAnimationFrame(this.#resetFrame);
    this.#resetFrame = requestAnimationFrame(() => { delete this.dataset.repositioning; });
  };

  previous() { this.#go(this.#index - 1); }
  next() { this.#go(this.#index + 1); }

  #keyboard = (event) => {
    if (event.target !== this.refs.track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    this.#go(this.#index + direction * (getComputedStyle(this.refs.track).direction === 'rtl' ? -1 : 1));
  };
}

if (!customElements.get('facelove-loop')) customElements.define('facelove-loop', FaceloveLoop);
