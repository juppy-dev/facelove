import { Component } from '@theme/component';

/** @extends {Component<{ chapters: HTMLElement[], cards: HTMLElement[] }>} */
class FaceloveStory extends Component {
  #abort;
  #frame;
  #observer;
  #visible = false;
  #media = matchMedia('(min-width: 960px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');

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
    this.#abort?.abort();
    this.#observer?.disconnect();
    cancelAnimationFrame(this.#frame);
    this.#frame = undefined;
  }

  #connect() {
    this.#abort?.abort();
    this.#observer?.disconnect();
    this.#abort = new AbortController();
    const options = { signal: this.#abort.signal, passive: true };
    const scroller = this.closest('.page-wrapper') ?? window;
    scroller.addEventListener('scroll', this.#schedule, options);
    window.addEventListener('resize', this.#schedule, options);
    this.#media.addEventListener('change', this.#setup, options);
    this.#observer = new IntersectionObserver(([entry]) => {
      this.#visible = entry.isIntersecting;
      this.#schedule();
    });
    this.#observer.observe(this);
    this.#setup();
  }

  #setup = () => {
    this.dataset.enhanced = String(this.#media.matches);
    for (const card of this.refs.cards ?? []) {
      card.style.removeProperty('--fl-progress');
      card.style.removeProperty('--fl-enter');
      card.inert = false;
    }
    this.#schedule();
  };

  #schedule = () => {
    if (this.#frame || !this.#visible || !this.#media.matches) return;
    this.#frame = requestAnimationFrame(this.#update);
  };

  #update = () => {
    this.#frame = undefined;
    if (!this.isConnected || !this.#media.matches) return;
    // Real card positions drive depth; no artificial scroll runway or wheel interception.
    const boxes = this.refs.chapters.map((chapter) => chapter.getBoundingClientRect());
    const clamp = (value) => Math.min(1, Math.max(0, value));
    for (const [index, card] of this.refs.cards.entries()) {
      const box = boxes[index];
      const next = boxes[index + 1];
      const overlap = next ? clamp((box.height * 0.85 - (next.top - box.top)) / (box.height * 0.85)) : 0;
      const entering = clamp((box.top - innerHeight * 0.7) / (innerHeight * 0.3));
      card.style.setProperty('--fl-progress', overlap.toFixed(3));
      card.style.setProperty('--fl-enter', entering.toFixed(3));
      card.inert = overlap > 0.95;
    }
  };
}

if (!customElements.get('facelove-story')) customElements.define('facelove-story', FaceloveStory);
