import type { Dictionary } from './types.ts';

export const ptBr = {
  meta: {
    title: 'Nelcota · Ferramentas open source e self-hosted para times pequenos',
    description:
      'A Nelcota cria ferramentas open source e self-hosted para times pequenos: um backend PostgreSQL em um único binário Rust, compartilhamento de tela e deploy nos seus próprios servidores.',
    ogAlt: 'Nelcota: ferramentas open source e self-hosted para times pequenos',
  },
  a11y: {
    skipToContent: 'Pular para o conteúdo',
    mascotAlt: 'Mascote da Nelcota: uma criaturinha verde-menta com dois tufos de folha, sorrindo',
    toggleTheme: 'Alternar modo escuro',
    languageMenu: 'Idioma',
    mainNav: 'Principal',
    externalLink: 'abre no GitHub',
  },
  nav: {
    projects: 'Projetos',
    build: 'Construa',
    contribute: 'Contribua',
    github: 'GitHub',
    menu: 'Menu',
    switchLocale: 'Read in English',
    switchLocaleShort: 'EN',
  },
  hero: {
    tagline: 'Ferramentas open source e self-hosted para times pequenos.',
    taglineSecond: 'Rode no seu próprio servidor e fique com os seus dados.',
    subtitle:
      'Um backend PostgreSQL, compartilhamento de tela e deploy, cada um rodando em servidores que você controla.',
    quickstart: 'Guia rápido',
    github: 'GitHub',
    badges: ['Open source', 'Apache-2.0 / MIT', 'Seu servidor, seus dados'],
  },
  projects: {
    title: 'Projetos',
    intro:
      'Três ferramentas que você mesmo pode rodar. Stars e releases vêm direto do GitHub no momento do build.',
    featured: 'Projeto principal',
    inProgress: 'Em andamento',
    stars: 'stars',
    license: 'Licença',
    latestRelease: 'Última release',
    noRelease: 'Sem release ainda',
    updated: 'Atualizado',
    notPublic: 'Repositório ainda não é público',
    viewOnGithub: 'Ver no GitHub',
    moreTitle: 'Também da Nelcota',
  },
  build: {
    title: 'Construa com a Nelcota',
    intro:
      'Converse com o seu backend Nelcota a partir de TypeScript ou Rust. Os dois clientes são finos: as operações mapeiam para HTTP e o PostgreSQL decide o que cada chamada pode fazer.',
    tablistLabel: 'Linguagem do cliente',
    tabs: { ts: 'TypeScript', rust: 'Rust' },
    install: 'Instalar',
    usage: 'Usar',
    copy: 'Copiar',
    copied: 'Copiado',
    copyFailed: 'Falha ao copiar',
    links: [
      {
        label: 'Guia rápido',
        href: 'https://github.com/Nelcota/Nelcota/blob/main/docs/quickstart.md',
      },
      { label: 'REST API', href: 'https://github.com/Nelcota/Nelcota/blob/main/docs/api.md' },
      {
        label: '@nelcota/client',
        href: 'https://github.com/Nelcota/Nelcota/tree/main/sdk/typescript',
      },
      { label: 'nelcota-client', href: 'https://github.com/Nelcota/Nelcota/tree/main/sdk/rust' },
    ],
  },
  why: {
    title: 'Por que self-hosted',
    intro: 'Rode as ferramentas no seu próprio servidor e fique com os seus dados.',
    points: [
      {
        title: 'Seus dados',
        body: 'Seu schema, grants, políticas de row-level security e funções continuam sendo SQL que você pode exportar. O PostgreSQL decide quem lê o quê.',
      },
      {
        title: 'Seu servidor',
        body: 'Um binário em um VPS, com Caddy para HTTPS. Sem serviço separado para o backend ou para o painel admin.',
      },
      {
        title: 'Open source',
        body: 'Licenças Apache-2.0 e MIT, desenvolvido às claras no GitHub. Leia o código, abra uma issue, mande um pull request.',
      },
    ],
  },
  contribute: {
    title: 'Contribua e segurança',
    intro:
      'Leia os guias e depois abra uma issue ou pull request no projeto que você quer melhorar.',
    guide: {
      label: 'Guia de contribuição',
      href: 'https://github.com/Nelcota/.github/blob/main/CONTRIBUTING.md',
      body: 'Procure issues existentes primeiro, mantenha as mudanças focadas e inclua as verificações que as validam.',
    },
    security: {
      label: 'Política de segurança',
      href: 'https://github.com/Nelcota/.github/blob/main/SECURITY.md',
      body: 'Relate vulnerabilidades de forma privada pelos GitHub Security Advisories do repositório afetado.',
    },
  },
  footer: {
    licenses: 'Código sob as licenças Apache-2.0 e MIT, conforme o projeto.',
    dataAsOf: 'Stars e releases do GitHub em',
    dataFromSnapshot: 'do snapshot commitado',
    builtWith: 'Site estático feito com Astro. Sem rastreadores, sem requisições a terceiros.',
    site: 'nelcota.com',
    github: 'GitHub',
    fonts: 'Inter e JetBrains Mono, SIL Open Font License.',
  },
  notFound: {
    title: 'Página não encontrada',
    body: 'O mascote procurou em todo canto. Não há nada neste endereço.',
    home: 'Voltar para a página inicial',
  },
} satisfies Dictionary;
