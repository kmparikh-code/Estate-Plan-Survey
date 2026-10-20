'use strict';

const steps = [
  { number: 1, title: 'Estate Planning Kickoff', description: 'Learn what to expect before you begin.' },
  { number: 2, title: 'Estate Planning Questionnaire', description: 'Tell us what you want your plan to do.' },
  { number: 3, title: 'Estate Documents', description: 'Review your drafted estate documents.' },
  { number: 4, title: 'Estate Plan Funding', description: 'Retitle accounts and update beneficiaries.' },
  { number: 5, title: 'Estate Plan Summary', description: 'See everything your plan covers.' }
];

const dialog = document.querySelector('#step-dialog');
const introVideo = document.querySelector('#intro-video');
const introOverlay = document.querySelector('#play-intro');
let currentStep = 1;
let dialogTrigger = null;

function replaceHash(hash) {
  // Opening a dialog must never depend on permission to modify iframe history.
  try {
    history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
  } catch (_) {
    // The dialog remains functional even in a restricted embedded preview.
  }
}

function closeDialog() {
  if (dialog.open) dialog.close();
  document.body.style.overflow = '';
}

function showStep(number, trigger = null) {
  if (!Number.isInteger(number) || number < 1 || number > steps.length) return;
  introVideo.pause();
  currentStep = number;
  const step = steps[number - 1];
  if (trigger) dialogTrigger = trigger;
  document.querySelector('#dialog-step').textContent = `STEP ${number} OF 5`;
  document.querySelector('#dialog-title').textContent = step.title.replace(/^#+\s*/, '');
  document.querySelector('#dialog-description').textContent = step.description;
  document.querySelector('#next-step').textContent = number === 5 ? 'Back to the journey' : 'Next step →';
  document.querySelector('#previous-step').textContent = number === 1 ? 'Back to the journey' : 'Previous step';
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  replaceHash(`#step-${number}`);
  document.querySelector('#close-dialog').focus({ preventScroll: true });
}

function returnToJourney() {
  closeDialog();
  replaceHash('#journey');
  if (dialogTrigger) dialogTrigger.focus({ preventScroll: true });
}

document.querySelectorAll('[data-step]').forEach(button => {
  button.addEventListener('click', () => showStep(Number(button.dataset.step), button));
});
document.querySelector('#close-dialog').addEventListener('click', returnToJourney);
document.querySelector('#previous-step').addEventListener('click', () => currentStep === 1 ? returnToJourney() : showStep(currentStep - 1));
document.querySelector('#next-step').addEventListener('click', () => currentStep === 5 ? returnToJourney() : showStep(currentStep + 1));
dialog.addEventListener('cancel', event => {
  event.preventDefault();
  returnToJourney();
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) returnToJourney();
});
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });

introOverlay.addEventListener('click', async () => {
  introOverlay.hidden = true;
  if (!introVideo.getAttribute('src')) {
    introVideo.src = introVideo.dataset.videoUrl;
    introVideo.load();
  }
  try {
    await introVideo.play();
  } catch (_) {
    introOverlay.hidden = false;
    document.querySelector('#intro-video-error').hidden = false;
  }
});
introVideo.addEventListener('play', () => { introOverlay.hidden = true; });
introVideo.addEventListener('ended', () => { introOverlay.hidden = false; });
introVideo.addEventListener('error', () => { document.querySelector('#intro-video-error').hidden = false; });

function handleLocation() {
  const match = location.hash.match(/^#step-([1-5])$/);
  if (match) showStep(Number(match[1]));
  else if (location.hash === '#kickoff') showStep(1);
  else closeDialog();
}
window.addEventListener('hashchange', handleLocation);
handleLocation();
