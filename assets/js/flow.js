import { ASKS } from './asks.js';
import { renderSourceList } from './sourcesList.js';
import { nodeStates, nextActive, stepLabel, TOTAL_STEPS } from './flowLogic.js';

/**
 * Scroll-driven walkthrough: whichever step crosses the reading line becomes the active one,
 * and the sticky diagram highlights the matching stage. The text is always fully present, so
 * with reduced motion or without JavaScript nothing is hidden; this script only adds emphasis.
 */
export function initFlow() {
  renderAsks();
  renderSourceList();

  const flow = document.getElementById('flow');
  const steps = [...document.querySelectorAll('.step')];
  const nodes = [...document.querySelectorAll('.diagram .node')];
  const links = [...document.querySelectorAll('.diagram .link')];
  const label = document.getElementById('diagram-step');
  if (!flow || steps.length !== TOTAL_STEPS || typeof IntersectionObserver === 'undefined') return;

  let active = 0;
  function show(step) {
    if (step === active) return;
    active = step;
    const states = nodeStates(step, TOTAL_STEPS);
    nodes.forEach((node, i) => node.setAttribute('data-state', states[i]));
    links.forEach((link, i) => link.classList.toggle('is-flowing', i + 2 === step));
    steps.forEach((section) => section.classList.toggle('is-active', Number(section.dataset.step) === step));
    label.textContent = stepLabel(step, TOTAL_STEPS);
  }

  flow.classList.add('is-enhanced');
  show(1);

  // A thin band a little above the middle of the viewport acts as the reading line.
  const observer = new IntersectionObserver((entries) => {
    show(nextActive(active, entries.map((e) => ({
      step: Number(e.target.dataset.step), isIntersecting: e.isIntersecting,
    }))));
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  steps.forEach((section) => observer.observe(section));
}

function renderAsks() {
  for (const chip of document.querySelectorAll('.ask-chip')) {
    chip.querySelector('.ask-text').textContent = ASKS[Number(chip.dataset.ask) - 1];
  }
}
