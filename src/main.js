// ==========================================
// ARCANE ACADEMY - Main Entry Point
// Medieval Fantasy RPG Study Assistant
// ==========================================
import './style.css';
import { ParticleSystem } from './particles.js';
import { Router } from './router.js';
import {
  renderLoginPage,
  renderIntroPage,
  renderSubjectsPage,
  renderAdventurePage,
  renderEssentialsPage
} from './pages.js';

// Initialize systems
const particles = new ParticleSystem('particles-canvas');
const router = new Router('#page-container', '#page-transition');

// Register all pages
router.register('login', (container, data) => renderLoginPage(container, { ...data, router, particles }));
router.register('intro', (container, data) => renderIntroPage(container, { ...data, router, particles }));
router.register('subjects', (container, data) => renderSubjectsPage(container, { ...data, router, particles }));
router.register('adventure', (container, data) => renderAdventurePage(container, { ...data, router, particles }));
router.register('essentials', (container, data) => renderEssentialsPage(container, { ...data, router, particles }));

// Start with the login page (no transition on first load)
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('page-container');
  renderLoginPage(container, { router, particles });
  router.currentRoute = 'login';
});
