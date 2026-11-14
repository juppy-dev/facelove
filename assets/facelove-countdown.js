import { Component } from '@theme/component';

/** @extends {Component<{ timer?: HTMLElement }>} */
class FaceloveCountdown extends Component {
  #interval;
  #abort;
  #dailyClock;

  connectedCallback() {
    super.connectedCallback();
    this.#start();
  }

  updatedCallback() {
    super.updatedCallback();
    this.#start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.#interval);
    this.#abort?.abort();
  }

  #start() {
    clearInterval(this.#interval);
    this.#abort?.abort();
    if (!this.refs.timer) return;
    this.hidden = false;
    this.#dailyClock = undefined;
    if (this.dataset.timeZone) {
      try {
        this.#dailyClock = new Intl.DateTimeFormat('en-GB', {
          timeZone: this.dataset.timeZone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
      } catch {
        this.hidden = true;
        return;
      }
    }
    this.#abort = new AbortController();
    document.addEventListener('visibilitychange', this.#schedule, { signal: this.#abort.signal });
    this.#schedule();
  }

  #schedule = () => {
    clearInterval(this.#interval);
    if (!document.hidden && this.#tick()) this.#interval = setInterval(this.#tick, 1000);
  };

  #tick = () => {
    let remaining = Math.max(0, Math.floor((Date.parse(this.dataset.end) - Date.now()) / 1000));
    if (this.#dailyClock) {
      const parts = Object.fromEntries(this.#dailyClock.formatToParts(Date.now()).map(({ type, value }) => [type, value]));
      // Use the store's wall clock so refreshes and visitor timezones share the same daily deadline.
      remaining = Math.min(86399, 86400 - Number(parts.hour) * 3600 - Number(parts.minute) * 60 - Number(parts.second));
      this.refs.timer.setAttribute('datetime', `PT${remaining}S`);
    }
    if (!Number.isFinite(remaining)) { this.hidden = true; clearInterval(this.#interval); return false; }
    if (remaining === 0) { this.refs.timer.textContent = this.dataset.ended; clearInterval(this.#interval); return false; }
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor(remaining % 86400 / 3600);
    const minutes = Math.floor(remaining % 3600 / 60);
    const seconds = remaining % 60;
    this.refs.timer.textContent = `${days ? `${days}d ` : ''}${[hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':')}`;
    return true;
  };
}

if (!customElements.get('facelove-countdown')) customElements.define('facelove-countdown', FaceloveCountdown);
