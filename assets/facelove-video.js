import { Component } from '@theme/component';

/** @extends {Component<{ video: HTMLVideoElement, toggle: HTMLButtonElement, status: HTMLElement }>} */
class FaceloveVideo extends Component {
  #abort;
  #observer;

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
    this.refs.video?.pause();
  }

  #connect() {
    this.#abort?.abort();
    this.#observer?.disconnect();
    if (!this.refs.video) return;
    this.#abort = new AbortController();
    const options = { signal: this.#abort.signal };
    this.refs.video.controls = false;
    this.refs.toggle.hidden = false;
    this.refs.video.addEventListener('play', this.#update, options);
    this.refs.video.addEventListener('pause', this.#update, options);
    this.refs.video.addEventListener('error', this.#error, options);
    document.addEventListener('play', this.#otherVideo, { ...options, capture: true });
    document.addEventListener('visibilitychange', this.#visibility, options);
    this.#observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) this.refs.video.pause();
    }, { threshold: 0.1 });
    this.#observer.observe(this);
    this.#update();
  }

  async togglePlayback() {
    const { video, toggle, status } = this.refs;
    if (!video.paused) { video.pause(); return; }
    status.textContent = '';
    toggle.setAttribute('aria-busy', 'true');
    try {
      // A failed network load can be retried without replacing the player's controls.
      if (video.error) video.load();
      await video.play();
    } catch (error) {
      if (error.name !== 'AbortError') this.#error();
    } finally {
      toggle.removeAttribute('aria-busy');
    }
  }

  #update = () => {
    const playing = !this.refs.video.paused;
    this.dataset.playing = String(playing);
    this.refs.toggle.setAttribute('aria-label', playing ? this.dataset.pauseLabel : this.dataset.playLabel);
    this.refs.toggle.setAttribute('aria-pressed', String(playing));
  };

  #otherVideo = (event) => {
    if (event.target instanceof HTMLVideoElement && event.target !== this.refs.video) this.refs.video.pause();
  };

  #visibility = () => {
    if (document.hidden) this.refs.video.pause();
  };

  #error = () => {
    this.refs.status.textContent = this.dataset.errorLabel;
  };
}

if (!customElements.get('facelove-video')) customElements.define('facelove-video', FaceloveVideo);
