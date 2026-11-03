/** Pure validation of the contact forms (home and /servicos), kept apart from the DOM so it can be unit tested. */

export interface ContactFields {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

export type ContactField = keyof ContactFields;

/** An empty string means the field is valid. */
export type ContactErrors = Readonly<Record<ContactField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN = 2;
const MESSAGE_MIN = 10;

export const CONTACT_FIELDS: readonly ContactField[] = ['name', 'email', 'message'];

export function validateName(name: string): string {
  if (name.trim().length < NAME_MIN) return 'Escreva o seu nome.';
  return '';
}

export function validateEmail(email: string): string {
  if (!EMAIL_PATTERN.test(email.trim())) return 'Escreva um e-mail válido, como voce@empresa.com.';
  return '';
}

export function validateMessage(message: string): string {
  if (message.trim().length < MESSAGE_MIN) {
    return `Conte um pouco mais, em pelo menos ${MESSAGE_MIN} caracteres.`;
  }
  return '';
}

export function validateContact(fields: ContactFields): ContactErrors {
  return {
    name: validateName(fields.name),
    email: validateEmail(fields.email),
    message: validateMessage(fields.message),
  };
}

export function hasContactErrors(errors: ContactErrors): boolean {
  return CONTACT_FIELDS.some((field) => errors[field] !== '');
}
