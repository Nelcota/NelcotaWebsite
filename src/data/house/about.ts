/** Copy of /sobre, from the mockup "Nelcota · Hero da home" (Sobre.dc.html). */

export interface AboutPrinciple {
  readonly title: string;
  readonly text: string;
}

export interface AboutPerson {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
}

export interface AboutTool {
  readonly name: string;
  readonly description: string;
  /** Text still to be confirmed by the team; shown dimmer. */
  readonly pending: boolean;
}

export const ABOUT_PRINCIPLES: readonly AboutPrinciple[] = [
  {
    title: 'Status honesto',
    text: 'Cada produto diz se está em desenvolvimento, em teste ou em uso, com a versão e a data.',
  },
  {
    title: 'Código aberto quando faz sentido',
    text: 'O Nelcota BaaS é open source, com licença Apache-2.0.',
  },
  {
    title: 'Uma base só',
    text: 'Os nossos produtos e os sistemas dos clientes rodam sobre o Nelcota BaaS.',
  },
  { title: 'Nada além do README', text: 'Se não está escrito e testado, não aparece no site.' },
];

export const ABOUT_TEAM: readonly AboutPerson[] = [
  {
    name: '[Nome do sócio]',
    role: '[Cargo]',
    bio: '[Duas linhas sobre a trajetória e o que cuida na Nelcota.]',
  },
  {
    name: '[Nome do sócio]',
    role: '[Cargo]',
    bio: '[Duas linhas sobre a trajetória e o que cuida na Nelcota.]',
  },
];

export const ABOUT_TOOLS: readonly AboutTool[] = [
  {
    name: 'Nelcota PRs',
    description: 'Fila de revisão de pull requests ligada ao GitHub.',
    pending: false,
  },
  {
    name: 'Nelcota Template',
    description: 'Base dos sistemas de clientes, sobre o Nelcota BaaS.',
    pending: false,
  },
  { name: 'nelcota-qa', description: '[descrição a confirmar]', pending: true },
  { name: 'NelcotaRules', description: '[descrição a confirmar]', pending: true },
];
