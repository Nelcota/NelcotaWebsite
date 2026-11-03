import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hasContactErrors, validateContact } from '../../src/utils/contact-validation.ts';

describe('validateContact', () => {
  it('accepts a complete message', () => {
    const errors = validateContact({
      name: 'Ana',
      email: 'ana@example.com',
      message: 'Preciso de uma loja.',
    });
    assert.equal(hasContactErrors(errors), false);
  });

  it('explains each missing piece in Portuguese', () => {
    const errors = validateContact({ name: ' ', email: 'ana@', message: 'curta' });
    assert.deepEqual(errors, {
      name: 'Escreva o seu nome.',
      email: 'Escreva um e-mail válido, como voce@empresa.com.',
      message: 'Conte um pouco mais, em pelo menos 10 caracteres.',
    });
    assert.equal(hasContactErrors(errors), true);
  });
});
