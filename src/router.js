// ==========================================
// Router - SPA page navigation with transitions
// ==========================================
export class Router {
  constructor(containerSelector, transitionSelector) {
    this.container = document.querySelector(containerSelector);
    this.transEl = document.querySelector(transitionSelector);
    this.routes = {};
    this.currentRoute = null;
  }

  register(name, renderFn) {
    this.routes[name] = renderFn;
  }

  async navigate(name, data = {}) {
    if (this.currentRoute === name && !data.force) return;

    // Trigger page transition
    await this.playTransition();

    // Clear and render new page
    this.container.innerHTML = '';
    this.currentRoute = name;

    if (this.routes[name]) {
      this.routes[name](this.container, data);
    }

    // End transition
    await this.endTransition();
  }

  playTransition() {
    return new Promise(resolve => {
      this.transEl.classList.add('active');
      setTimeout(resolve, 500);
    });
  }

  endTransition() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.transEl.classList.remove('active');
        resolve();
      }, 600);
    });
  }
}
