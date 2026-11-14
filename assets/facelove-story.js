import { Component } from '@theme/component';

/** @extends {Component<{ track: HTMLElement, chapters: HTMLElement[], counter: HTMLElement, previous: HTMLButtonElement, next: HTMLButtonElement }>} */
class FaceloveStory extends Component {
  #abort;
  #resize;
  #index = 0;

  connectedCallback() { super.connectedCallback(); this.#connect(); }
  updatedCallback() { super.updatedCallback(); this.#connect(); }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abort?.abort();
    this.#resize?.disconnect();
  }

  #connect() {
    this.#abort?.abort();
    this.#resize?.disconnect();
    this.#abort = new AbortController();
    const options = { signal: this.#abort.signal };
    this.refs.track.addEventListener('scroll', this.#update, { ...options, passive: true });
    this.refs.track.addEventListener('keydown', this.#keyboard, options);
    this.#resize = new ResizeObserver(this.#update);
    this.#resize.observe(this.refs.track);
    this.dataset.ready = 'true';
    this.#update();
  }

  #update = () => {
    const { track, chapters, counter, previous, next } = this.refs;
    if (!track.clientWidth || !chapters?.length) return;
    this.#index = Math.min(chapters.length - 1, Math.round(Math.abs(track.scrollLeft) / track.clientWidth));
    const label = String(this.#index + 1).padStart(2, '0');
    if (counter.textContent !== label) counter.textContent = label;
    previous.disabled = this.#index === 0;
    next.disabled = this.#index === chapters.length - 1;
  };

  previous() { this.#move(-1); }
  next() { this.#move(1); }

  #move(direction) {
    const { track, chapters } = this.refs;
    const index = Math.max(0, Math.min(chapters.length - 1, this.#index + direction));
    track.scrollTo({ left: index * track.clientWidth * (getComputedStyle(track).direction === 'rtl' ? -1 : 1), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  #keyboard = (event) => {
    if (event.target !== this.refs.track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    this.#move(direction * (getComputedStyle(this.refs.track).direction === 'rtl' ? -1 : 1));
  };
}

if (!customElements.get('facelove-story')) customElements.define('facelove-story', FaceloveStory);
