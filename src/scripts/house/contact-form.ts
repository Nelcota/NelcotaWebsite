/**
 * Client-side validation of the /servicos contact form ([data-contact]).
 * Sending is not wired up: a valid submit only swaps the form for a notice
 * saying so. Nothing here touches the network.
 */
import {
  CONTACT_FIELDS,
  type ContactErrors,
  type ContactField,
  type ContactFields,
  hasContactErrors,
  validateContact,
} from '../../utils/contact-validation.ts';

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

interface ContactForm {
  readonly form: HTMLFormElement;
  readonly submit: HTMLButtonElement;
  readonly fields: Readonly<Record<ContactField, FieldElement>>;
  readonly errors: Readonly<Record<ContactField, HTMLElement>>;
  readonly sent: HTMLElement;
  readonly sentTitle: HTMLElement;
  readonly sentEmail: HTMLElement;
  readonly reset: HTMLButtonElement;
}

function findField(root: HTMLElement, field: ContactField): FieldElement | null {
  const element = root.querySelector(`[data-contact-field="${field}"]`);
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) return element;
  return null;
}

function findError(root: HTMLElement, field: ContactField): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[data-contact-error="${field}"]`);
}

/** Every field and error line must exist, or the form is left alone. */
function findPerField<T>(
  lookup: (field: ContactField) => T | null,
): Record<ContactField, T> | null {
  const found: Partial<Record<ContactField, T>> = {};
  for (const field of CONTACT_FIELDS) {
    const element = lookup(field);
    if (element == null) return null;
    found[field] = element;
  }
  return found as Record<ContactField, T>;
}

function findContactForm(root: HTMLElement): ContactForm | null {
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  const submit = root.querySelector<HTMLButtonElement>('[data-contact-submit]');
  const sent = root.querySelector<HTMLElement>('[data-contact-sent]');
  const sentTitle = root.querySelector<HTMLElement>('[data-contact-sent-title]');
  const sentEmail = root.querySelector<HTMLElement>('[data-contact-sent-email]');
  const reset = root.querySelector<HTMLButtonElement>('[data-contact-reset]');
  if (form == null || submit == null || reset == null) return null;
  if (sent == null || sentTitle == null || sentEmail == null) return null;

  const fields = findPerField((field) => findField(root, field));
  const errors = findPerField((field) => findError(root, field));
  if (fields == null || errors == null) return null;

  return { form, submit, fields, errors, sent, sentTitle, sentEmail, reset };
}

function readFields(contact: ContactForm): ContactFields {
  return {
    name: contact.fields.name.value,
    email: contact.fields.email.value,
    message: contact.fields.message.value,
  };
}

function showErrors(contact: ContactForm, errors: ContactErrors): void {
  for (const field of CONTACT_FIELDS) {
    const message = errors[field];
    contact.errors[field].textContent = message;
    contact.fields[field].setAttribute('aria-invalid', message === '' ? 'false' : 'true');
  }
}

function clearErrors(contact: ContactForm): void {
  for (const field of CONTACT_FIELDS) {
    contact.errors[field].textContent = '';
    contact.fields[field].removeAttribute('aria-invalid');
  }
}

function focusFirstInvalid(contact: ContactForm, errors: ContactErrors): void {
  const first = CONTACT_FIELDS.find((field) => errors[field] !== '');
  if (first == null) return;
  contact.fields[first].focus();
}

function showSent(contact: ContactForm, email: string): void {
  contact.sentEmail.textContent = email;
  contact.form.hidden = true;
  contact.sent.hidden = false;
  contact.sentTitle.focus();
}

function showForm(contact: ContactForm): void {
  contact.form.reset();
  clearErrors(contact);
  contact.sent.hidden = true;
  contact.form.hidden = false;
  contact.fields.name.focus();
}

function setupContactForm(root: HTMLElement): void {
  const contact = findContactForm(root);
  if (contact == null) return;

  // Errors appear on the first submit, then follow every keystroke, as in the mockup.
  let isValidating = false;

  contact.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = readFields(contact);
    const errors = validateContact(fields);
    isValidating = true;
    showErrors(contact, errors);

    if (hasContactErrors(errors)) {
      focusFirstInvalid(contact, errors);
      return;
    }

    isValidating = false;
    showSent(contact, fields.email.trim());
  });

  contact.form.addEventListener('input', () => {
    if (!isValidating) return;
    showErrors(contact, validateContact(readFields(contact)));
  });

  contact.reset.addEventListener('click', () => showForm(contact));

  contact.submit.disabled = false;
}

for (const root of document.querySelectorAll<HTMLElement>('[data-contact]')) {
  setupContactForm(root);
}
