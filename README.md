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
  api/        NestJS: ConfigModule com validação Zod, GET /health
  mobile/     Expo (SDK 57) + Expo Router, compatível com Expo Go
packages/
  shared/     @camille/shared: tipos e schemas Zod partilhados
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

### Arrancar a app no Expo Go

```sh
pnpm dev:mobile
```

Lê o QR code com a câmara (iOS) ou com a app Expo Go (Android). O telemóvel e o computador têm de estar na mesma rede Wi-Fi; se não estiverem, usa `pnpm dev:mobile --tunnel`.

### Outros

| Comando          | O que faz                          |
| ---------------- | ---------------------------------- |
| `pnpm build`     | Compila `@camille/shared` e a API  |
| `pnpm lint`      | ESLint em todos os pacotes         |
| `pnpm typecheck` | `tsc --noEmit` em todos os pacotes |
| `pnpm format`    | Formata o repositório com Prettier |

## Documentação

- [`docs/camille-system-prompt.md`](docs/camille-system-prompt.md) — prompt de sistema da examinadora
- [`docs/design-prompt.md`](docs/design-prompt.md) — prompt usado no Claude Design para os ecrãs

## Estado

🚧 Passo 1: esqueleto do monorepo. Ainda sem funcionalidades.
