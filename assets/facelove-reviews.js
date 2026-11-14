import { Component } from '@theme/component';

/** @extends {Component<{ track: HTMLElement, previous: HTMLButtonElement, next: HTMLButtonElement }>} */
class FaceloveReviews extends Component {
  #abort;
  #resize;

  connectedCallback() {
    super.connectedCallback();
    this.#connect();
  }

  updatedCallback() {
    super.updatedCallback();
    this.#connect();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abort.abort();
    this.#resize.disconnect();
  }

  #connect() {
    this.#abort?.abort();
    this.#resize?.disconnect();
    this.#abort = new AbortController();
    this.refs.track.addEventListener('scroll', this.#update, { passive: true, signal: this.#abort.signal });
    this.#resize = new ResizeObserver(this.#update);
    this.#resize.observe(this.refs.track);
    this.dataset.ready = 'true';
    this.#update();
  }

  #update = () => {
    const { track, previous, next } = this.refs;
    const position = Math.abs(track.scrollLeft);
    previous.disabled = position < 2;
    next.disabled = position >= track.scrollWidth - track.clientWidth - 2;
    this.dataset.scrollable = String(track.scrollWidth > track.clientWidth + 2);
  };

  previous() { this.#move(-1); }
  next() { this.#move(1); }

  /** @param {number} direction */
  #move(direction) {
    const track = this.refs.track;
    const card = track.firstElementChild;
    if (!(card instanceof HTMLElement)) return;
    const styles = getComputedStyle(track);
    const distance = card.offsetWidth + parseFloat(styles.columnGap);
    track.scrollBy({ left: direction * distance * (styles.direction === 'rtl' ? -1 : 1), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
}

if (!customElements.get('facelove-reviews')) customElements.define('facelove-reviews', FaceloveReviews);
