import type { Dictionary } from './types.ts';

/** Portuguese translation of en.ts. Same facts, same commit (2efede8c). */
export const ptBr = {
  meta: {
    title: 'Nelcota · Backend open source em Rust para PostgreSQL',
    description:
      'Nelcota é um backend open source feito em Rust. Ele transforma o schema do seu PostgreSQL em uma REST API, adiciona autenticação, arquivos e webhooks e traz um painel admin embutido. Faça o deploy na sua própria VPS.',
    ogAlt: 'Nelcota: seu Postgres, seu backend, sua infraestrutura',
    ogEyebrow: 'Backend open source em Rust · PostgreSQL · Apache-2.0',
  },
  a11y: {
    skipToContent: 'Pular para o conteúdo',
    mascotAlt: 'Mascote do Nelcota: uma criaturinha verde-menta com dois tufos de folha, sorrindo',
    toggleTheme: 'Alternar modo escuro',
    mainNav: 'Principal',
  },
  landing: {
    hero: {
      title: ['Backend completo.', 'Um binário. Sua VPS.'],
      body: 'API REST gerada do seu schema, login, arquivos, webhooks e painel admin, rodando no seu PostgreSQL. Sem conta, sem cobrança por requisição, sem uma dúzia de serviços para manter.',
      primary: 'Instalar agora',
      secondary: 'Ver as docs',
    },
    showcase: {
      eyebrow: ['API', 'REST'],
      title: ['Você cria a tabela.', 'A API sai pronta.', 'Zero endpoints.'],
      body: 'Filtros, relações, RPC e documento OpenAPI saem direto do schema. Quem pode ler cada linha é regra do PostgreSQL, não um if esquecido num controller.',
      primary: 'Referência da API',
      bubbles: ['@Magalhaesz', '200 OK'],
    },
    panel: {
      eyebrow: ['PAINEL', 'ADMIN'],
      title: ['Painel admin incluso.', 'Nada a mais para instalar.'],
      screens: ['Visão geral', 'Tabelas'],
      prev: 'Tela anterior',
      next: 'Próxima tela',
    },
    builtOn: {
      title: ['Nada reinventado', 'onde não precisava.'],
      body: 'Rust, tokio, axum e rustls na frente, PostgreSQL atrás. Peças que já aguentam produção pelo mundo todo.',
    },
    manifesto: [
      { text: 'Um projeto de fim de semana' },
      { mark: 'zap' },
      { text: 'ou vários apps na mesma VPS:' },
      { mark: 'server' },
      { text: 'cada um ganha API, login, arquivos e webhooks' },
      { mark: 'lock' },
      { text: 'e quem vê cada linha é o PostgreSQL que decide.' },
      { mark: 'postgresql' },
    ],
    security: {
      eyebrow: ['SEGURO POR', 'PADRÃO'],
      title: ['Seguro antes', 'da primeira linha.'],
    },
    speed: {
      eyebrow: ['VELOCIDADE', 'MEDIDA'],
      title: ['1.965 req/s', 'com 128\u00a0MiB de RAM.'],
      tabs: ['Números', 'Condições'],
      conditions: [
        'App limitado a 1 CPU e 128 MiB',
        'PostgreSQL limitado a 1 CPU e 384 MiB',
        'Um teste de 30 minutos a 600 requisições por segundo',
        'Versão candidata no main, depois da 0.4.0',
      ],
    },
    community: {
      title: ['Seu código, seus dados,', 'seu servidor.'],
      body: 'Apache-2.0. Sem conta, sem plano, sem fatura surpresa. E se um dia quiser sair, seus dados já estão em PostgreSQL padrão.',
    },
    bento: {
      eyebrow: ['TUDO', 'INCLUÍDO'],
      title: ['Tudo que um app pede.', 'Já vem dentro.'],
      cards: [
        {
          title: 'Login',
          body: 'E-mail e senha, magic link, Google e GitHub, com refresh token rotativo.',
        },
        {
          title: 'Arquivos',
          body: 'Disco ou S3, público ou privado. Quem baixa o quê é uma policy SQL, e os links temporários expiram sozinhos.',
        },
        {
          title: 'Webhooks',
          body: 'Seu servidor recebe as mudanças que você escolher, assinadas, com 6 tentativas se ele estiver fora do ar.',
        },
        {
          title: 'Painel admin',
          body: 'Tabelas, usuários, arquivos, policies e SQL em /admin/, sem outro serviço para subir.',
        },
      ],
    },
    steps: {
      eyebrow: ['COMECE', 'AGORA'],
      title: ['Do zero à API', 'em três passos.'],
      body: 'Precisa de Linux com Docker. No macOS e no Windows, compile a partir do código.',
      all: 'Quickstart completo',
      prev: 'Passo anterior',
      next: 'Próximo passo',
      items: [
        {
          title: 'Instale e suba',
          body: 'Um comando instala a CLI. nelcota dev sobe o PostgreSQL no Docker e a API na porta 8000.',
        },
        {
          title: 'Escreva o schema',
          body: 'Uma migration com a tabela e as regras de acesso. Aplique e gere os tipos.',
        },
        {
          title: 'Use a API',
          body: 'Crie um usuário e leia as notas com o token dele. A RLS devolve só as dele.',
        },
      ],
    },
    dock: {
      title: ['Funciona do jeito', 'que você já trabalha.'],
      body: 'SDK para TypeScript e Rust, HTTP puro para qualquer outra linguagem. Roda com Docker ou systemd.',
    },
    free: {
      eyebrow: ['CÓDIGO', 'ABERTO'],
      title: ['R$ 0 de licença.', 'Para sempre.'],
      body: 'Apache-2.0. Você paga o servidor que escolheu, não cada requisição que o seu app faz.',
      plans: [
        {
          label: 'Licença',
          price: 'R$ 0',
          unit: 'para sempre',
          body: 'Apache-2.0: use, modifique e distribua.',
        },
        {
          label: 'Hospedagem',
          price: 'Seu servidor',
          unit: '',
          body: 'O guia de deploy coloca 2–3 projetos pequenos numa VPS de 1 GB.',
          badge: 'Você escolhe',
        },
        {
          label: 'Uso',
          price: 'R$ 0',
          unit: 'por requisição',
          body: 'Sem medidor. O limite é o seu servidor, não um plano.',
        },
      ],
    },
    band: ['Um binário', '128 MiB', 'Apache-2.0', 'Sem lock-in'],
    duo: [
      {
        eyebrow: ['LEIA', 'AS DOCS'],
        title: ['Do primeiro comando', 'ao deploy.'],
        body: 'Quickstart, API, login, arquivos, deploy, backups e CLI. Em inglês, com tradução para português.',
        cta: 'Abrir as docs',
      },
      {
        eyebrow: ['CÓDIGO', 'ABERTO'],
        title: ['Gostou?', 'Abra uma issue ou mande um PR.'],
        body: 'Cada versão, cada decisão e cada bug ficam no GitHub, à vista de todo mundo.',
        cta: 'Ver no GitHub',
      },
    ],
  },
  story: {
    cards: [
      { title: 'API REST', code: 'GET /rest/v1/notes', body: 'Gerada do seu schema' },
      { title: 'Login', code: 'POST /auth/v1/token', body: 'Senha, magic link, OAuth' },
      { title: 'Arquivos', code: '/storage/v1/object', body: 'Disco ou S3, com policies' },
      { title: 'Webhooks', code: 'x-nelcota-signature', body: 'Assinados, com retry e histórico' },
      { title: 'Painel admin', code: '/admin/', body: 'Dados, usuários e SQL' },
      { title: 'PostgreSQL', code: 'owner = auth.uid()', body: 'Decide quem vê o quê' },
    ],
    bubbles: ['@HanielCota · 2 notas', '@GuiSatierf · 1 nota'],
    speedIntro:
      'Leituras indexadas com o app preso a 1 CPU e 128 MiB, na versão candidata do main. Sobra memória para o PostgreSQL, que é quem faz o trabalho pesado.',
    securityIntro:
      'Nenhum checklist de hardening para lembrar depois. Tudo isto já vem ligado no primeiro nelcota dev.',
  },
  nav: {
    speed: 'Velocidade',
    security: 'Segurança',
    product: 'Produto',
    productItems: [
      { title: 'Login', body: 'E-mail, magic link, Google e GitHub' },
      { title: 'Arquivos', body: 'Disco ou S3, com policies SQL' },
      { title: 'Webhooks', body: 'Seu servidor fica sabendo das mudanças que você escolher' },
      { title: 'Painel admin', body: 'Dados, usuários e SQL em /admin/' },
      { title: 'Deploy e backups', body: 'Sua VPS, HTTPS e recuperação point-in-time' },
    ],
    searchDocs: 'Buscar nas docs',
    features: 'Recursos',
    howItWorks: 'Como funciona',
    compare: 'Comparativo',
    deploy: 'Deploy',
    docs: 'Docs',
    github: 'GitHub',
    getStarted: 'Começar',
    menu: 'Menu',
    switchLocale: 'Read in English',
    switchLocaleShort: 'EN',
  },
  hero: {
    title: ['Seu Postgres.', 'Seu backend.', 'Sua infraestrutura.'],
    subtitle:
      'Um backend completo num único binário Rust: API REST gerada do seu schema, login, arquivos, webhooks e painel admin. No seu servidor, em PostgreSQL padrão.',
    complement: 'Sem lock-in, sem cobrança por requisição. Open source, Apache-2.0.',
    getStarted: 'Começar',
    viewOnGithub: 'Ver no GitHub',
    facts: ['Open source', 'Apache-2.0', 'Feito em Rust', 'PostgreSQL'],
    latestRelease: 'Última versão',
    installNote: 'Linux com o Docker rodando.',
    mascotHint: 'Copia aqui!',
    otherSystems: 'macOS e Windows',
  },
  showcase: {
    overviewAlt:
      'Visão geral do painel do Nelcota com gráficos de tráfego da API, contagem de tabelas e usuários e próximos passos',
    tableAlt:
      'Editor de tabelas do Nelcota mostrando as linhas de uma tabela notes protegida por RLS',
  },
  why: {
    reason:
      'Um backend que chegou a no máximo 45 MiB sob carga deixa a memória do servidor para o PostgreSQL, que é quem faz o trabalho pesado. E todas as proteções abaixo já vêm ligadas, sem você mexer em nada.',
    speed: {
      stats: [
        {
          value: '1.965',
          unit: 'req/s',
          label: 'leituras indexadas, app com 1 CPU e 128 MiB',
        },
        {
          value: '45',
          unit: 'MiB',
          label: 'pico de memória do app sob carga',
        },
        {
          value: '0',
          unit: 'erros',
          label: 'em 1.079.703 requisições',
        },
        { value: '4,4', unit: 'ms', label: 'latência mediana a 600 req/s' },
      ],
      engine: 'Rust · tokio · axum · rustls',
      note: 'Medido na próxima versão (main), que ainda não está na 0.4.0 publicada, com o PostgreSQL em 1 CPU / 384 MiB e um teste de 30 minutos. O seu hardware e a sua carga vão dar outros números.',
      method: 'Como foi medido',
    },
    safety: {
      items: [
        {
          title: 'Argon2id + rate limit',
          body: 'Senhas com hash, limite de tentativas de login e a mesma resposta para e-mail desconhecido e senha errada.',
        },
        {
          title: 'Tokens de 15 minutos',
          body: 'Access tokens Ed25519. O refresh token é trocado a cada uso, e reusar um antigo revoga a sessão.',
        },
        {
          title: 'RLS em toda requisição',
          body: 'Role e claims ficam na transação. Token inválido nunca vira anon.',
        },
        {
          title: 'Webhooks ficam do lado de fora',
          body: 'Só HTTPS. Endereços privados e de metadados de nuvem são bloqueados.',
        },
        {
          title: 'Arquivos isolados',
          body: 'Arquivos servidos pelo Nelcota saem com nosniff e CSP sandbox. No S3, o provedor os serve do domínio dele.',
        },
        {
          title: 'Sem Rust unsafe',
          body: 'unsafe é proibido, o cargo-deny confere as dependências e há mais de 500 testes automatizados.',
        },
      ],
      note: 'Ainda é 0.x: as notas de segurança listam o que falta.',
      notes: 'Notas de segurança',
    },
  },
  panel: {
    reason:
      'Com o painel dentro do binário, não há um segundo app para subir, expor ou atualizar, e o “Ver como” mostra a tabela exatamente como um visitante ou um usuário escolhido a acessa.',
    title: 'Um painel admin dentro do binário',
    intro:
      'Gerencie dados, usuários, arquivos, policies e SQL em /admin/, em português ou inglês, com temas claro e escuro.',
    tablistLabel: 'Tela do painel',
    pickLabel: 'Escolha uma área',
    screens: { overview: 'Visão geral', tables: 'Tabelas' },
    screenNotes: {
      overview:
        'Tráfego da API, requisições recusadas e com falha, tabelas que precisam de atenção e próximos passos. As contagens ficam em memória por 24 horas e zeram quando o servidor reinicia.',
      tables:
        'Navegue, filtre e edite linhas, siga relações, exporte CSV ou JSON, edite colunas, grants e RLS, e use o View as para ler uma tabela como visitante ou como um usuário escolhido.',
    },
    areas: {
      sql: {
        title: 'Editor SQL',
        items: [
          'Autocomplete, rodar tudo ou só a seleção',
          'Histórico, templates e consultas salvas',
          'Rodar com acesso total, como visitante ou como um usuário escolhido',
        ],
      },
      policies: {
        title: 'Policies',
        items: [
          'Criar, editar e excluir policies por tabela',
          'Começar a partir de templates',
          'Achar tabelas expostas e chamadas bloqueadas há pouco',
        ],
      },
      users: {
        title: 'Usuários',
        items: [
          'Buscar, criar e excluir contas',
          'Ver métodos de login e sessões',
          'Confirmar emails e redefinir senhas',
        ],
      },
      storage: {
        title: 'Arquivos',
        items: [
          'Gerenciar buckets e navegar por pastas',
          'Upload com progresso, preview dos formatos suportados',
          'Copiar URLs e revisar as regras de acesso',
        ],
      },
      api: {
        title: 'API e docs',
        items: [
          'Exemplos em TypeScript, curl e fetch por tabela',
          'Download do database.ts e referência OpenAPI',
          'Guias embutidos com busca',
        ],
      },
      migrations: {
        title: 'Migrations',
        items: [
          'Mudanças estruturais feitas no painel viram uma migration SQL',
          'SQL rodado no editor não é registrado: adicione você mesmo a uma migration',
        ],
      },
    },
    docs: 'Guia do painel',
  },
  auth: {
    reason:
      'As contas ficam no PostgreSQL junto das suas tabelas: suas policies usam auth.uid() e o backup do banco já inclui os usuários. Access tokens curtos limitam o estrago de um token vazado.',
    title: 'Login pronto para o seu app',
    intro:
      'E-mail e senha, magic link, Google e GitHub. Escolha um método e veja o que acontece, passo a passo.',
    pick: 'Escolha um método de login',
    methodLabels: ['Senha', 'Magic link', 'Google', 'GitHub'],
    actors: { app: 'Seu app', inbox: 'E-mail' },
    flows: {
      password: [
        'O usuário entra com e-mail e senha.',
        'O Nelcota busca a conta no PostgreSQL e confere a senha (hash Argon2id).',
        'O app recebe um access token que vale 15 minutos, mais um refresh token.',
        'Quando ele expira, o app troca o refresh token por um par novo, sem pedir a senha. O antigo deixa de funcionar.',
      ],
      magic: [
        'O usuário digita só o e-mail.',
        'O Nelcota envia um link de login que vale 15 minutos.',
        'O usuário abre o link e cai na sua página de login.',
        'A página devolve o token do link e recebe a sessão.',
      ],
      oauth: [
        'O usuário clica em “Entrar com {provider}” e o Nelcota o leva até o {provider}.',
        'O {provider} confirma quem ele é, e o Nelcota o manda de volta ao seu app com um código de uso único.',
        'O app troca o código por uma sessão. Com PKCE, um código roubado não serve para mais ninguém.',
      ],
    },
    included: {
      title: 'Já vem pronto',
      items: [
        'Cadastro, login, logout e recuperação de senha',
        'Confirmação de e-mail e magic links',
        'Login com Google e GitHub',
        'Senhas com hash Argon2id e limite de tentativas',
        'Tokens assinados que qualquer serviço confere (Ed25519, JWKS)',
      ],
    },
    needs: {
      title: 'Você configura',
      items: [
        'Um servidor SMTP, para os e-mails',
        'As chaves OAuth do Google ou GitHub, se for oferecer',
        'As URLs para onde o app pode mandar o usuário de volta',
      ],
    },
    notes: {
      title: 'Bom saber',
      items: [
        'Autenticação multifator ainda não está disponível.',
        'Sair encerra o refresh; um token já emitido vale até expirar (15 minutos).',
      ],
    },
  },
  storage: {
    reason:
      'Os arquivos seguem o mesmo tipo de policy SQL das suas linhas: um só conjunto de regras decide quem lê uma nota e quem lê o anexo dela.',
    title: 'Arquivos com as mesmas regras dos seus dados',
    intro:
      'Guarde arquivos em disco ou no S3 e decida quem lê cada um. Escolha um jeito de compartilhar e veja como funciona.',
    pick: 'Escolha como o arquivo é compartilhado',
    modes: { public: 'Público', private: 'Privado', signed: 'Link temporário' },
    actors: { visitor: 'Visitante', user: 'Ana', app: 'Seu app', holder: 'Quem tem o link' },
    flows: {
      public: [
        'Qualquer pessoa com o endereço pede o arquivo, sem login.',
        'O arquivo volta na hora: bom para avatares e imagens.',
        'Enviar ou trocar o arquivo continua exigindo uma policy. Sem ela, o PostgreSQL recusa.',
      ],
      private: [
        'A Ana, logada, pede o arquivo com o token dela.',
        'O PostgreSQL confere a sua policy: essa pasta é da Ana?',
        'É: ela recebe o arquivo. Na pasta de outra pessoa, a resposta seria 404, como se o arquivo não existisse.',
      ],
      signed: [
        'O app pede um link temporário para um arquivo privado, válido pelo tempo que você escolher (até 7 dias).',
        'O Nelcota devolve o link assinado, e o app pode passá-lo adiante.',
        'Quem tiver o link baixa o arquivo até ele expirar, sem login.',
      ],
    },
    included: {
      title: 'Já vem pronto',
      items: [
        'Upload, download, listagem e exclusão',
        'Arquivos públicos, privados e links temporários',
        'Limite de tamanho e de tipo por bucket',
        'Regras de acesso em policies SQL, como as das tabelas',
        'Arquivos servidos pelo Nelcota nunca rodam como página (nosniff, CSP sandbox)',
      ],
    },
    needs: {
      title: 'Você configura',
      items: [
        'Disco: o nelcota init e o nelcota dev já ligam para você',
        'S3: qualquer provedor compatível e as chaves dele',
      ],
    },
    notes: {
      title: 'Bom saber',
      items: [
        'Transformação de imagens (redimensionar, recortar) ainda não está disponível.',
        'No S3, quem entrega os bytes do arquivo é o provedor.',
      ],
    },
  },
  webhooks: {
    reason:
      'O evento é gravado na mesma transação da sua mudança: um rollback não envia nada e uma queda não perde nada. Por isso também não há Redis nem fila separada para rodar.',
    title: 'Seu servidor fica sabendo das mudanças que você escolher',
    intro:
      'Quando uma linha muda, o Nelcota chama o seu servidor com os dados. Se a chamada falhar, ele tenta de novo, e tudo fica no histórico do painel.',
    steps: [
      {
        title: 'Você salva',
        body: 'Um INSERT, UPDATE ou DELETE é confirmado. Se der rollback, nada é enviado.',
      },
      {
        title: 'Fica guardado',
        body: 'O evento vai para o PostgreSQL na mesma transação e sobrevive a reinícios.',
      },
      {
        title: 'Vai assinado',
        body: 'Seu servidor confere que a chamada veio mesmo do Nelcota (HMAC-SHA256).',
      },
      {
        title: 'Chega',
        body: 'Falhou? Ele tenta de novo, 6 vezes por padrão, esperando de 5 s a 1 h. Dá para reenviar pelo painel.',
      },
    ],
    guarantees: {
      title: 'O que o seu servidor precisa fazer',
      items: [
        'Ignorar repetições: o mesmo evento pode chegar duas vezes (use o x-nelcota-event-id)',
        'Não contar com a ordem: eventos podem chegar fora de ordem',
        'Conferir a assinatura e recusar chamadas antigas',
      ],
    },
    log: {
      title: 'Um evento, do commit à entrega',
      committed: 'confirmado',
      queued: 'na fila do PostgreSQL',
      retry: 'falha transitória, nova tentativa com backoff',
      sameEvent: 'mesmo id de evento',
      delivered: 'entregue e registrado',
    },
    note: 'São chamadas entre servidores e podem levar a linha inteira, então o destino precisa ser HTTPS, e endereços internos ou de metadados de nuvem são recusados. Não servem para atualizar navegadores em tempo real.',
  },
  quickstart: {
    reason:
      'As tabelas vêm de arquivos de migration, não de cliques: o schema fica no git e os mesmos arquivos montam todos os ambientes.',
    tabs: { label: 'Por onde começar', local: 'Na sua máquina', app: 'No seu app' },
    tabBlurbs: {
      local: 'Instale, aplique o schema e faça a primeira consulta',
      app: 'SDK TypeScript ou Rust, com tipos gerados do schema',
    },
    title: 'Rode localmente em três passos',
    intro: 'Iniciar o servidor não cria suas tabelas: quem cria é a migration do passo 2.',
    pickStep: 'Clique num passo para ver os comandos',
    stepOf: 'Passo {n} de {total}',
    next: 'Próximo passo',
    resultLabel: 'O que você vai ver',
    requirementsTitle: 'O que você precisa',
    secondTerminal: 'segunda janela',
    requirements:
      'O Docker precisa já estar rodando: o comando de instalação usa NELCOTA_SKIP_DOCKER=1. No macOS ou Windows, use a outra opção do passo 1.',
    os: {
      label: 'Escolha seu sistema',
      linux: 'Linux',
      macos: 'macOS',
      windows: 'Windows',
      sourceNote:
        'Compila a release 0.4.0 a partir do código, com Rust 1.99+. O nelcota dev continua precisando do Docker, e os passos 2 e 3 precisam de um shell POSIX com jq (o Terminal do macOS, ou WSL no Windows).',
    },
    done: 'Feito',
    progress: 'passos feitos',
    steps: [
      {
        title: 'Instale e inicie',
        outcome: 'PostgreSQL e API rodando',
        body: '`nelcota dev` sobe o PostgreSQL no Docker e a API em 127.0.0.1:8000. O painel fica em /admin/, e as credenciais geradas ficam em `.nelcota/dev.env`.',
      },
      {
        title: 'Aplique o schema',
        outcome: 'Tabela notes e bucket files',
        body: 'Deixe o `nelcota dev` rodando. Em um segundo terminal, escreva a migration (a tabela notes de cima mais um bucket privado `files`), aplique e gere os tipos.',
      },
      {
        title: 'Cadastre e consulte',
        outcome: 'A primeira consulta, com RLS',
        body: 'Crie um usuário, espere a API carregar a nova tabela, insira uma nota e leia com o token desse usuário. A RLS devolve só as notas dele.',
      },
    ],
    full: 'Quickstart completo',
    terminal: [
      'PostgreSQL no Docker · API em :8000 · painel em /admin/',
      'aplica migrations/V1__notes.sql, sem reiniciar o servidor',
      'com o token da Ana, a RLS devolve só as notas dela',
    ],
  },
  sdks: {
    reason:
      'Os tipos são gerados do seu schema: uma coluna renomeada aparece como erro de tipo no editor, e não como bug em produção.',
    title: 'Do SQL ao código tipado da aplicação',
    intro:
      'Os dois SDKs chamam a mesma REST API: consultas, relações, RPC, auth, sessões e arquivos. Gere os tipos de novo depois de cada migration.',
    tablistLabel: 'Linguagem do cliente',
    install: 'Instalar',
    usage: 'Usar',
    notes: [
      {
        title: '@nelcota/client',
        body: 'ESM, sem dependências de runtime. Roda em navegadores, Node 22+, Deno e Bun sobre APIs web padrão.',
      },
      {
        title: 'nelcota-client',
        body: 'Cliente Rust assíncrono sobre Tokio. `nelcota types --lang rust` gera os modelos.',
      },
    ],
  },
  code: {
    copy: 'Copiar',
    copied: 'Copiado',
    copyFailed: 'Falha ao copiar',
    replay: 'Ver de novo',
    installLabel: 'Comando de instalação para Linux com Docker',
    comments: {
      install: 'Instala a CLI do nelcota',
      newFolder: 'Cria uma pasta vazia para o app',
      startDev: 'Sobe o PostgreSQL e a API; deixe rodando',
      buildSource: 'Compila a versão 0.4.0 a partir do código (precisa de Rust)',
      writeMigration: 'Escreve a migration: a tabela notes e as regras de acesso',
      table: 'A tabela: cada nota pertence ao usuário que a escreveu',
      rls: 'Liga a row-level security na tabela',
      grant: 'Usuários logados podem ler e escrever na tabela...',
      policy: '...mas só nas linhas que são deles',
      bucket: 'Um bucket privado: cada usuário grava na própria pasta',
      apply: 'Aplica a migration e gera os tipos TypeScript',
      signup: 'Cria um usuário e guarda o access token dele',
      wait: 'Espera a API enxergar a nova tabela',
      insert: 'Insere uma nota como esse usuário',
      read: 'Lê as notas de volta: a RLS devolve só as dele',
      installServer: 'Instala o nelcota (e o Docker, se faltar)',
      projectFolder: 'Cria uma pasta para os projetos',
      createProject: 'Cria o projeto para o seu domínio',
      start: 'Sobe tudo, com HTTPS pelo Caddy',
      check: 'Confere se está tudo funcionando',
      twoProjects: 'Dois projetos no mesmo servidor',
      listProjects: 'Veja e gerencie cada projeto',
      backupOne: 'Faz backup de um projeto',
      backupAll: 'Faz backup de todos, guardando os 7 últimos',
      restore: 'Restaura um backup',
      upgradeCheck: 'Mostra o que a atualização mudaria',
      upgrade: 'Atualiza: faz backup antes e volta atrás se falhar',
      pitrOn: 'Liga a recuperação point-in-time',
      pitrStatus: 'Confere o arquivo de WAL',
      pitrRestore: 'Volta para o segundo antes do erro',
      health: 'Confere a instalação inteira',
      status: 'Status de um projeto',
      logs: 'Acompanha os logs dele',
      sdkInstall: 'Instala o client',
      sdkTypes: 'Gera os tipos a partir do schema (de novo a cada migration)',
      sdkClient: 'Um client para o app todo, tipado pelo seu schema',
      sdkInsert: 'Insere uma nota como o usuário logado',
      sdkFolder: 'Cada usuário grava na própria pasta (notes_files_owner)',
      sdkUpload: 'Envia o arquivo e gera um link que vale 10 minutos',
      rustSignIn: 'Entra como a Ana',
      rustQuery: 'As 20 notas mais novas dela, com a contagem total',
    },
    legend: {
      title: 'Como ler o código',
      command: 'comandos e funções',
      keyword: 'palavras do SQL e da linguagem',
      text: 'textos que você pode trocar',
      option: 'números e opções',
      variable: 'variáveis',
      comment: 'comentários',
    },
  },
  docs: {
    links: {
      examples: 'Exemplos',
      api: 'REST API',
      auth: 'Autenticação',
      roles: 'JWT e roles',
      storage: 'Arquivos',
      webhooks: 'Webhooks',
      backup: 'Backup e PITR',
    },
    all: 'Toda a documentação',
  },
  docsSite: {
    pages: {
      quickstart: {
        label: 'Quickstart local',
        summary: 'Instale, escreva uma migration e faça uma requisição autenticada.',
      },
      'sdk-start': {
        label: 'Começar com o SDK JS',
        summary: 'Primeiros passos com o @nelcota/client.',
      },
      notes: {
        label: 'Exemplo Notes',
        summary: 'Notas e arquivos privados de ponta a ponta, com teste de reinício.',
      },
      troubleshooting: {
        label: 'Resolver problemas',
        summary: 'Resultados vazios, 401/403, tipos e limites.',
      },
      glossary: { label: 'Glossário', summary: 'Termos usados nos guias.' },
      api: { label: 'API REST', summary: 'Consultas, relações, escritas, RPC, OpenAPI e erros.' },
      auth: {
        label: 'Autenticação',
        summary: 'Usuários, sessões, links por e-mail e OAuth no schema auth.',
      },
      roles: {
        label: 'JWT e papéis',
        summary: 'Formato do token e os papéis do PostgreSQL em cada requisição.',
      },
      storage: {
        label: 'Armazenamento',
        summary: 'Disco ou S3, políticas de bucket, URLs assinadas e limites.',
      },
      webhooks: {
        label: 'Webhooks',
        summary: 'Eventos duráveis, assinaturas, novas tentativas e histórico.',
      },
      sdk: { label: 'SDK TypeScript', summary: 'O pacote @nelcota/client: REST, auth e arquivos.' },
      'sdk-rust': { label: 'SDK Rust', summary: 'O crate nelcota-client para aplicações Tokio.' },
      'rust-start': {
        label: 'Começar com Rust',
        summary: 'Primeiros passos com o nelcota-client.',
      },
      examples: { label: 'Exemplos', summary: 'Schemas e consumidores prontos para rodar.' },
      'auth-integration': {
        label: 'Auth em apps Rust',
        summary: 'Use a autenticação do Nelcota em outra aplicação Rust.',
      },
      deploy: {
        label: 'Deploy',
        summary: 'Uma VPS com Docker ou systemd, HTTPS e projetos isolados.',
      },
      backup: {
        label: 'Backup e restauração',
        summary: 'Snapshots pareados, cópias externas e recuperação no tempo.',
      },
      panel: { label: 'Painel admin', summary: 'O que o painel mostra e o que ele pode fazer.' },
      'panel-updates': {
        label: 'Atualizar pelo painel',
        summary: 'Atualizações controladas e o aceite que exigem na VPS.',
      },
      'host-management': {
        label: 'Gestão de projetos',
        summary: 'Criar, copiar, restaurar e remover projetos em um host.',
      },
      security: {
        label: 'Modelo de segurança',
        summary: 'Limites de confiança e o que fica com quem implanta.',
      },
      release: { label: 'Entrega de versão', summary: 'Atualização depois do aceite do Notes.' },
      leaving: {
        label: 'Sair do Nelcota',
        summary: 'Exporte schema, usuários e arquivos para outro backend.',
      },
      configuration: {
        label: 'Configuração',
        summary: 'Todas as variáveis do servidor, mais CLI, instalação e backup.',
      },
      cli: { label: 'CLI', summary: 'Comandos, opções, padrões e operações destrutivas.' },
      'sdk-contract': {
        label: 'Contrato do SDK TypeScript',
        summary: 'O contrato HTTP que o @nelcota/client segue.',
      },
      'rust-contract': {
        label: 'Contrato do SDK Rust',
        summary: 'O contrato HTTP que o nelcota-client segue.',
      },
      architecture: {
        label: 'Arquitetura',
        summary: 'Crates, ciclo de uma requisição e orçamentos.',
      },
      decisions: {
        label: 'Registro de decisões',
        summary: 'Por que cada coisa é como é, decisão por decisão.',
      },
    },
    overview: 'Visão geral',
    startHere: 'Comece por aqui',
    readingTime: '{minutes} min de leitura',
    allGuides: 'Todos os guias',
    backToTop: 'Voltar ao topo',
    title: 'Documentação',
    description:
      'Guias e referência do Nelcota: quickstart local, API REST, autenticação, arquivos, webhooks, SDKs, deploy, backup e a CLI.',
    groups: {
      start: 'Começar',
      build: 'Construir um aplicativo',
      operate: 'Operar',
      reference: 'Referência',
      design: 'Design',
    },
    nav: 'Documentação',
    menu: 'Páginas',
    onThisPage: 'Nesta página',
    breadcrumb: 'Trilha de navegação',
    previous: 'Anterior',
    next: 'Próxima',
    search: {
      label: 'Buscar na documentação',
      placeholder: 'Buscar',
      loading: 'Carregando o índice…',
      empty: 'Nada encontrado. Tente um comando, o nome de uma tabela ou uma palavra só.',
      failed: 'O índice de busca não carregou. Recarregue a página para tentar de novo.',
      results: '{count} resultados',
      resultOne: '1 resultado',
      resultsShown: '{shown} de {count} resultados',
    },
    sectionLink: 'Link para esta seção',
    table: 'Tabela',
    source: 'Fonte',
    edit: 'Editar no GitHub',
    syncedFrom: 'Do commit {commit} do repositório, {date}.',
    versionNote:
      'Estes guias acompanham a branch main. A última versão publicada é a {version}; recursos que os guias marcam como não publicados exigem uma versão mais nova.',
    status: {
      english:
        'Esta página ainda não tem tradução no repositório. O texto abaixo é o original em inglês.',
      partial:
        'Alguns trechos desta página ainda não têm tradução no repositório e aparecem em inglês.',
      portugueseOnly: 'Este guia é escrito só em português.',
    },
  },
  cta: {
    body: 'Instale o binário, rode nelcota dev numa pasta vazia e siga o quickstart.',
    quickstart: 'Ler o quickstart',
    pauseMotion: 'Pausar animação',
  },
  footer: {
    title: 'Seu Postgres, seu backend.',
    newBadge: 'Novo',
    tagline: 'Backend open source para PostgreSQL, feito em Rust.',
    product: 'Produto',
    resources: 'Recursos',
    community: 'Comunidade',
    documentation: 'Documentação',
    changelog: 'Changelog',
    releases: 'Versões',
    security: 'Segurança',
    license: 'Licença Apache-2.0',
    conduct: 'Código de conduta',
    contributing: 'Guia de contribuição',
    licenseNote: 'O Nelcota é licenciado sob Apache-2.0.',
    fonts: 'Manrope e JetBrains Mono, SIL Open Font License.',
    dataAsOf: 'Dados do GitHub de',
    compare: 'Comparativo',
  },
  compare: {
    metaTitle: 'Nelcota comparado com Supabase, PocketBase e Appwrite',
    metaDescription:
      'Recurso por recurso: o que Nelcota, Supabase self-hosted, PocketBase e Appwrite self-hosted incluem, com link para cada fonte.',
    title: 'Nelcota comparado',
    intro:
      'Supabase self-hosted, PocketBase e Appwrite self-hosted, recurso por recurso. Inclusive o que o Nelcota ainda não tem.',
    checked: 'Conferido na documentação oficial de cada projeto em',
    mistake: 'Algo errado ou desatualizado?',
    report: 'Abra uma issue',
    tableLabel: 'Comparativo de recursos',
    pickLabel: 'Comparar o Nelcota com',
    feature: 'Recurso',
    legend: {
      title: 'Legenda',
      yes: 'Incluído',
      partial: 'Em parte, ou com limites',
      no: 'Não incluído',
    },
    fit: {
      title: 'Qual combina com você',
      intro: 'Todos são bons projetos. Eles resolvem problemas diferentes.',
    },
    sources: {
      title: 'Fontes',
      intro: 'Cada célula vem destas páginas. Versões mudam; a data no topo diz quando conferimos.',
    },
    cta: { primary: 'Testar o Nelcota localmente', secondary: 'Voltar para o' },
    winsTitle: 'Onde o Nelcota sai na frente',
    home: {
      reason:
        'Comparativo que esconde as lacunas não vale a leitura: o que falta no Nelcota também está na tabela, e cada célula tem fonte.',
      title: 'Como se compara',
      intro:
        'Contra Supabase self-hosted, PocketBase e Appwrite self-hosted, pela documentação oficial de cada um.',
      more: 'Comparativo completo e fontes',
      showTable: 'Ver a tabela ({count} recursos)',
    },
  },
  notFound: {
    title: 'Página não encontrada',
    body: 'O mascote procurou em todo canto. Não há nada neste endereço.',
    home: 'Voltar para o início',
  },
} satisfies Dictionary;
