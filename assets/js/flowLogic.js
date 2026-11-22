export const TOTAL_STEPS = 5;

/** 'done' for stages already passed, 'active' for the current one, 'todo' for the rest. */
export function nodeStates(active, total = TOTAL_STEPS) {
  return Array.from({ length: total }, (_, i) => {
    const step = i + 1;
    if (step < active) return 'done';
    return step === active ? 'active' : 'todo';
  });
}

/**
 * The step to show after an IntersectionObserver callback. `entries` are {step, isIntersecting};
 * a step entering the reading line wins (the later one if two enter together), otherwise the
 * current step stays.
 */
export function nextActive(current, entries) {
  const entering = entries.filter((e) => e.isIntersecting).map((e) => e.step);
  return entering.length ? Math.max(...entering) : current;
}

export function stepLabel(active, total = TOTAL_STEPS) {
  return `Step ${active} of ${total}`;
}
