/**
 * Contact form of the home (components/house/home/ContactForm.astro): validates on the client
 * and then says that sending is not wired up yet. It never sends anything anywhere; when a real
 * channel exists, it belongs in a service called from here, behind the review of docs/ROADMAP.md.
 */
import {
  CONTACT_FIELDS,
  type ContactField,
  validateEmail,
  validateMessage,
  validateName,
} from '../../utils/contact-validation.ts';

// Same rules and messages as the /servicos form, from one place.
const RULES: Readonly<Record<ContactField, (value: string) => string>> = {
  name: validateName,
  email: validateEmail,
  message: validateMessage,
};

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

interface Field {
  readonly element: FieldElement;
  readonly error: HTMLElement;
  readonly validate: (value: string) => string;
}

function isFieldKey(value: string | undefined): value is ContactField {
  return CONTACT_FIELDS.some((field) => field === value);
}

function toField(element: FieldElement): Field | null {
  const key = element.dataset.contactField;
  const errorId = element.getAttribute('aria-describedby');
  if (!isFieldKey(key) || errorId == null) return null;

  const error = document.getElementById(errorId);
  if (error == null) return null;

  return { element, error, validate: RULES[key] };
}

/** Shows or clears the field's message; returns whether the value is acceptable. */
function checkField(field: Field): boolean {
  const message = field.validate(field.element.value);
  field.element.setAttribute('aria-invalid', message === '' ? 'false' : 'true');
  field.error.textContent = message;
  return message === '';
}

function clearField(field: Field): void {
  field.element.removeAttribute('aria-invalid');
  field.error.textContent = '';
}

function setupContact(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const done = document.querySelector<HTMLElement>('[data-contact-done]');
  const doneTitle = document.querySelector<HTMLElement>('[data-contact-done-title]');
  const reset = document.querySelector<HTMLButtonElement>('[data-contact-reset]');
  if (form == null || done == null || doneTitle == null || reset == null) return;

  const elements = form.querySelectorAll<FieldElement>('[data-contact-field]');
  const fields = [...elements].map(toField).filter((field): field is Field => field != null);
  // Messages appear while typing only after the first attempt, as in the mockup.
  let attempted = false;

  for (const field of fields) {
    field.element.addEventListener('input', () => {
      if (attempted) checkField(field);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    attempted = true;
    const invalid = fields.filter((field) => !checkField(field));
    const first = invalid[0];
    if (first != null) {
      first.element.focus();
      return;
    }

    form.hidden = true;
    done.hidden = false;
    doneTitle.focus();
  });

  reset.addEventListener('click', () => {
    form.reset();
    attempted = false;
    fields.forEach(clearField);
    done.hidden = true;
    form.hidden = false;
    fields[0]?.element.focus();
  });
}

setupContact();
