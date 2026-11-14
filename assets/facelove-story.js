import { Component } from '@theme/component';

/** @extends {Component<{ steps: HTMLElement[], cards: HTMLElement[], links: HTMLAnchorElement[] }>} */
class FaceloveStory extends Component {
  #abort;
  #observer;
  #media = matchMedia('(min-width: 960px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');

  connectedCallback() {
    super.connectedCallback();
    this.#abort = new AbortController();
    this.#media.addEventListener('change', this.#setup, { signal: this.#abort.signal });
    this.#setup();
  }

  updatedCallback() {
    super.updatedCallback();
    this.#setup();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abort.abort();
    this.#observer?.disconnect();
  }

  #setup = () => {
    this.#observer?.disconnect();
    const enhanced = this.#media.matches;
    this.dataset.enhanced = String(enhanced);
    this.#select(0);
    if (!enhanced) return;

    // Observe the reading band instead of running layout work on every scroll frame.
    this.#observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (!visible.length) return;
      this.#select(this.refs.steps.indexOf(visible[visible.length - 1].target));
    }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });
    for (const step of this.refs.steps ?? []) this.#observer.observe(step);
  };

  /** @param {MouseEvent} event */
  selectChapter(event) {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a');
    const index = this.refs.links.indexOf(link);
    if (index < 0) return;
    event.preventDefault();
    this.refs.steps[index].scrollIntoView({ block: 'start', behavior: 'instant' });
    this.#select(index);
    this.refs.cards[index].querySelector('h3')?.focus({ preventScroll: true });
  }

  /** @param {number} index */
  #select(index) {
    for (const [position, card] of (this.refs.cards ?? []).entries()) {
      card.dataset.state = position === index ? 'active' : position < index ? 'before' : 'after';
      card.toggleAttribute('inert', this.#media.matches && position !== index);
    }
    for (const [position, link] of (this.refs.links ?? []).entries()) {
      if (position === index && this.#media.matches) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    }
  }
}

if (!customElements.get('facelove-story')) customElements.define('facelove-story', FaceloveStory);
