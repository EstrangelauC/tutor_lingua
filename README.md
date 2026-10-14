# tutor_lingua — Camille, Oral TCF IRN

App mobile de tutor de francês por voz com IA, que prepara candidatos para a prova oral do **TCF IRN** (níveis A2, B1 e B2).

O utilizador conversa em voz alta com **Camille**, uma examinadora virtual bienveillante. A conversa decorre só em francês; no fim, a Camille dá um feedback escrito na língua de apoio do utilizador.

## Funcionalidades previstas (MVP)

- Três tarefas da prova: **Entretien**, **Interaction**, **Point de vue**
- Níveis alvo A2, B1 e B2
- Interface multilíngue (PT-PT, EN, ES, AR com RTL, UK, TR, RO) e língua de apoio configurável
- Feedback no fim da sessão: nível estimado, 3 erros principais com a forma correta, 1 conselho
- Histórico de sessões e evolução

## Stack

Monorepo com **pnpm workspaces** e **Turborepo**, tudo em TypeScript estrito.

```
apps/
  api/        NestJS: sessões de conversa com a Camille (Claude) e feedback
  mobile/     Expo (SDK 57) + Expo Router, compatível com Expo Go
packages/
  shared/     @camille/shared: schemas Zod e cliente HTTP da API
```

## Requisitos

- Node.js 22 ou mais recente
- pnpm 11, ativado com `corepack enable` (a versão vem do campo `packageManager`)
- A app **Expo Go** no telemóvel (iOS ou Android)

## Comandos

### Instalar

```sh
corepack enable
pnpm install
```

### Arrancar a API

```sh
cp apps/api/.env.example apps/api/.env   # opcional em desenvolvimento
pnpm dev:api
```

Verificar: `curl http://localhost:3000/health` devolve `{"status":"ok"}`.

A API usa dois serviços externos, cada um com uma versão simulada (sem custos) quando falta a chave no `.env`:

| Variável            | Para quê                                | Sem chave                     |
| ------------------- | --------------------------------------- | ----------------------------- |
| `ANTHROPIC_API_KEY` | A Camille (Claude, `claude-opus-5-5`)   | Camille simulada, falas fixas |
| `OPENAI_API_KEY`    | Transcrever a voz (`gpt-4o-transcribe`) | Transcrição com frases fixas  |

Os modelos podem mudar-se com `ANTHROPIC_MODEL` e `OPENAI_TRANSCRIPTION_MODEL`. Com `NODE_ENV=production`, as duas chaves são obrigatórias.

#### Sessões de conversa

| Rota                          | Corpo                               | Resposta                                                 |
| ----------------------------- | ----------------------------------- | -------------------------------------------------------- |
| `POST /sessions`              | `{ niveau, tache, langueAppui }`    | `{ sessionId, camille, echange, maxEchanges, terminee }` |
| `POST /sessions/:id/messages` | `{ texte }` (a resposta do aluno)   | A fala seguinte da Camille, no mesmo formato             |
| `POST /sessions/:id/audio`    | multipart, campo `audio` (m4a/webm) | O mesmo, mais `texteEleve` (o que se percebeu)           |
| `POST /sessions/:id/terminer` | —                                   | O feedback: `{ niveauEstime, resume, erreurs, conseil }` |

Os schemas Zod de cada pedido e resposta estão em `packages/shared/src/session.ts`. A sessão termina sozinha depois de 8 respostas do aluno (`terminee: true`); o feedback pode ser pedido a qualquer momento depois da primeira resposta. As sessões ficam em memória e perdem-se quando a API reinicia.

```sh
curl -X POST localhost:3000/sessions -H 'content-type: application/json' \
  -d '{"niveau":"B1","tache":"entretien","langueAppui":"pt-PT"}'
curl -X POST localhost:3000/sessions/<sessionId>/messages -H 'content-type: application/json' \
  -d '{"texte":"Je m appelle Nour et j habite à Lyon."}'
curl -X POST localhost:3000/sessions/<sessionId>/terminer
```

### Arrancar a app no Expo Go

```sh
pnpm dev:mobile
```

Lê o QR code com a câmara (iOS) ou com a app Expo Go (Android). O telemóvel e o computador têm de estar na mesma rede Wi-Fi.

A app fala com a API: arranca primeiro `pnpm dev:api` noutro terminal. Por omissão, a app usa o IP do computador que corre o Metro, na porta 3000, por isso não é preciso configurar nada na mesma rede. Com `pnpm dev:mobile --tunnel`, ou com uma API noutro endereço, define `EXPO_PUBLIC_API_URL` em `apps/mobile/.env` (ver `apps/mobile/.env.example`).

Fluxo atual: escolher tarefa, nível e língua do feedback → conversar com a Camille por voz → feedback.

- A Camille lê as falas em voz alta (voz francesa do sistema, `expo-speech`). Se o telemóvel não tiver uma voz francesa instalada, instala-a nas definições de acessibilidade/voz do sistema.
- **Premir para falar**: mantém o microfone premido enquanto respondes e solta para enviar.
- **Mãos-livres**: o microfone abre sozinho quando a Camille acaba de falar; a resposta é enviada com um toque ou depois de uma pausa de ~2 s.
- **Texto**: mostra ou oculta a transcrição. **Escrever a resposta** troca o microfone por uma caixa de texto.
- Com auriculares, a Camille ouve-te melhor e não se ouve a si própria.

Para experimentar no browser: `pnpm --filter @camille/mobile web` (o browser pede acesso ao microfone).

### Outros

| Comando          | O que faz                          |
| ---------------- | ---------------------------------- |
| `pnpm build`     | Compila `@camille/shared` e a API  |
| `pnpm lint`      | ESLint em todos os pacotes         |
| `pnpm typecheck` | `tsc --noEmit` em todos os pacotes |
| `pnpm test`      | Testes da API e do cliente HTTP    |
| `pnpm format`    | Formata o repositório com Prettier |

> Depois de `pnpm --filter <pacote> add ...`, corre `pnpm install`: com `nodeLinker: hoisted`, o `add` filtrado pode retirar de `node_modules` pacotes de outros workspaces.

## Documentação

- [`docs/camille-system-prompt.md`](docs/camille-system-prompt.md) — prompts da Camille (conversa e feedback)
- [`docs/design-prompt.md`](docs/design-prompt.md) — prompt usado no Claude Design para os ecrãs

## Estado

🚧 Passo 4: sessão por voz (gravação, transcrição, leitura das falas da Camille). A seguir: i18n da interface, RTL, tema escuro e histórico.
