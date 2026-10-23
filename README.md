# tutor_lingua — Camille, Oral TCF IRN

App mobile de tutor de francês por voz com IA, que prepara candidatos para a prova oral do **TCF IRN** (níveis A2, B1 e B2).

O utilizador conversa em voz alta com **Camille**, uma examinadora virtual bienveillante. A conversa decorre só em francês; no fim, a Camille dá um feedback escrito na língua de apoio do utilizador.

## Funcionalidades previstas (MVP)

- Três tarefas da prova: **Entretien**, **Interaction**, **Point de vue**
- Níveis alvo A2, B1 e B2
- Interface em sete línguas (PT-PT, EN, ES, AR com RTL, UK, TR, RO) e língua de apoio configurável
- Feedback no fim da sessão: nível estimado, 3 erros principais com a forma correta, 1 conselho
- Histórico de sessões e evolução, guardados no telemóvel
- Tema claro, escuro ou do sistema

## Stack

Monorepo com **pnpm workspaces** e **Turborepo**, tudo em TypeScript estrito.

```
apps/
  api/        NestJS: sessões de conversa com a Camille (Claude) e feedback
  mobile/     Expo (SDK 57) + Expo Router, compatível com Expo Go
packages/
  shared/     @camille/shared: schemas Zod, códigos de erro e cliente HTTP da API
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

| Rota                          | Corpo                               | Resposta                                                          |
| ----------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `POST /sessions`              | `{ niveau, tache, langueAppui }`    | `{ sessionId, camille, echange, maxEchanges, terminee }`          |
| `POST /sessions/:id/messages` | `{ texte }` (a resposta do aluno)   | A fala seguinte da Camille, no mesmo formato                      |
| `POST /sessions/:id/audio`    | multipart, campo `audio` (m4a/webm) | O mesmo, mais `texteEleve` (o que se percebeu)                    |
| `GET /sessions/:id`           | —                                   | O estado atual: o mesmo formato, mais `transcription` e `occupee` |
| `POST /sessions/:id/terminer` | —                                   | O feedback: `{ niveauEstime, resume, erreurs, conseil }`          |

Os schemas Zod de cada pedido e resposta estão em `packages/shared/src/session.ts`. A sessão termina sozinha depois de 8 respostas do aluno (`terminee: true`); o feedback pode ser pedido a qualquer momento depois da primeira resposta. As sessões ficam em memória e perdem-se quando a API reinicia. Se um envio esgotar o tempo do lado da app enquanto a Camille ainda responde, a app consulta `GET /sessions/:id` até a sessão deixar de estar `occupee` e recupera a fala em falta, em vez de perder a troca.

Os erros vêm como `{ code, message }`: o `code` é estável (`session_introuvable`, `session_occupee`, `audio_vide`, `service_indisponible`, `non_autorise`, `trop_de_requetes`…, lista em `packages/shared/src/erreurs.ts`) e é o que a app traduz para a língua da interface; a `message` é em português, para quem desenvolve.

#### Proteção

Quem tiver o endereço da API pode gastar os créditos dos modelos. Duas barreiras, ambas configuradas no `.env`:

| Variável                     | Omissão | O que faz                                                                                                 |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `CAMILLE_API_KEY`            | —       | Chave que a app envia em `Authorization: Bearer …`; sem ela, `401 non_autorise`. Obrigatória em produção. |
| `LIMITE_REQUETES_PAR_MINUTE` | 60      | Pedidos por minuto e por IP; acima disto, `429 trop_de_requetes`.                                         |
| `LIMITE_SESSIONS_PAR_HEURE`  | 20      | Sessões criadas por hora e por IP (é a criação que gasta créditos).                                       |
| `CONFIANCE_PROXY`            | false   | `true` atrás de um proxy (Render, Fly, nginx…), para o IP vir do `X-Forwarded-For`.                       |

Sem `CAMILLE_API_KEY`, a API aceita qualquer pedido: só em desenvolvimento. A chave vai embutida na app (`EXPO_PUBLIC_CAMILLE_API_KEY`), por isso trava quem só tem o URL, não quem desmonta a app; os limites por IP são a segunda barreira. `/health` fica aberto. Os contadores vivem em memória: com mais do que uma instância da API, cada uma conta por si.

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

A app fala com a API: arranca primeiro `pnpm dev:api` noutro terminal. Por omissão, a app usa o IP do computador que corre o Metro, na porta 3000, por isso não é preciso configurar nada na mesma rede. Com `pnpm dev:mobile --tunnel`, ou com uma API noutro endereço, define `EXPO_PUBLIC_API_URL` em `apps/mobile/.env` (ver `apps/mobile/.env.example`). Se a API tiver `CAMILLE_API_KEY`, põe a mesma chave em `EXPO_PUBLIC_CAMILLE_API_KEY`.

Na primeira utilização, a app faz uma introdução em três passos (línguas, nível alvo, microfone) e guarda que já foi feita. Depois tem três separadores: **Início** (escolher a tarefa e começar), **Histórico** (sessões feitas, tempo de prática e evolução do nível estimado) e **Definições**.

- A Camille lê as falas em voz alta (voz francesa do sistema, `expo-speech`). Se o telemóvel não tiver uma voz francesa instalada, instala-a nas definições de acessibilidade/voz do sistema.
- **Premir para falar**: mantém o microfone premido enquanto respondes e solta para enviar.
- **Mãos-livres**: o microfone abre sozinho quando a Camille acaba de falar; a resposta é enviada com um toque ou depois de uma pausa de ~2 s. O modo escolhido fica como omissão para as sessões seguintes.
- **Texto**: mostra ou oculta a transcrição. **Escrever a resposta** troca o microfone por uma caixa de texto.
- Com auriculares, a Camille ouve-te melhor e não se ouve a si própria.
- O telemóvel vibra quando a gravação começa e acaba e, em mãos-livres, ouve-se um sinal quando o microfone abre (desliga-se nas definições).
- Ao abrir, a app acorda a API (os planos gratuitos adormecem) e, se o arranque da sessão falhar por a API ainda estar a acordar, insiste até três vezes antes de mostrar o erro.

Nas **Definições**: língua da interface e língua de apoio (a do feedback; por omissão acompanham a língua do telemóvel), nível alvo, velocidade da voz da Camille (com «Ouvir exemplo»), modo do microfone, tema (claro, escuro ou sistema) e apagar o histórico. A conversa é sempre em francês, seja qual for a língua da interface.

As preferências e o histórico ficam só no telemóvel (`@react-native-async-storage/async-storage`, 100 sessões no máximo); as gravações são enviadas para transcrição e não ficam guardadas.

Para experimentar no browser: `pnpm --filter @camille/mobile web` (o browser pede acesso ao microfone). A partir de 900 px de largura a app usa o layout de computador: navegação no topo, sessão em duas colunas com a transcrição sempre à vista, e a **tecla Espaço** faz de microfone.

#### Línguas da interface

Os textos estão em `apps/mobile/src/i18n/textes/`, um ficheiro por língua (`pt-PT`, `en`, `es`, `ar`, `uk`, `tr`, `ro`), todos com a forma do português (`Textes`); cada um trata do seu plural (o árabe tem dual, o ucraniano três formas, o romeno «de» a partir de 20). Em árabe, o layout é espelhado (RTL) e o francês fica sempre da esquerda para a direita. Para juntar outra língua:

1. Acrescenta o código a `LangueAppuiSchema` em `packages/shared/src/base.ts` (a API passa a aceitá-la como língua do feedback; a Camille simulada precisa de um texto de feedback nessa língua em `apps/api/src/camille/simulee.moteur.ts`).
2. Cria `apps/mobile/src/i18n/textes/<código>.ts` a partir de `en.ts` e junta-o a `textes/index.ts`; põe o nome da língua em `i18n/langues.ts` (e marca-a em `estRtl` se se escrever da direita para a esquerda).
3. O `pnpm typecheck` e o teste `textes.test.ts` dizem o que falta.

### Afinar a Camille

Os prompts estão em `apps/api/src/camille/prompts.ts` (conversa e bilan). Para os afinar sem passar pela app, há um ensaio que joga uma sessão inteira e escreve o relatório (conversa, bilan, duração de cada chamada) em `apps/api/essais/`:

```sh
pnpm --filter @camille/api essai --niveau B1 --tache entretien --langue pt-PT --eleve modele
```

- `--eleve modele` (precisa de `ANTHROPIC_API_KEY` no `apps/api/.env`): o modelo faz de candidato do nível pedido, com os erros típicos desse nível, e responde ao que a Camille pergunta.
- `--eleve script` (omissão): respostas fixas por tarefa e nível, com erros típicos; serve para a Camille simulada e para fumar o circuito.
- `--niveau A2|B1|B2`, `--tache entretien|interaction|point_de_vue`, `--langue` (uma das sete), `--echanges 1–8`, `--sortie ficheiro.md`.

O que vale a pena verificar num relatório: a Camille fala só francês, uma pergunta de cada vez, duas frases no máximo, sem corrigir; as perguntas sobem de nível com o `--niveau`; no bilan, as frases «ditParLEleve» são copiadas tal e qual, os extratos são os trechos mínimos, o nível estimado é prudente e o conselho é uma ação concreta. A API regista a duração e os tokens de cada chamada aos modelos nos logs (`[ClaudeCamille]`, `[OpenAiTranscripteur]`), para se acompanhar o custo.

### Outros

| Comando          | O que faz                          |
| ---------------- | ---------------------------------- |
| `pnpm build`     | Compila `@camille/shared` e a API  |
| `pnpm lint`      | ESLint em todos os pacotes         |
| `pnpm typecheck` | `tsc --noEmit` em todos os pacotes |
| `pnpm test`      | Testes da API, do cliente e da app |
| `pnpm format`    | Formata o repositório com Prettier |

> Depois de `pnpm --filter <pacote> add ...`, corre `pnpm install`: com `nodeLinker: hoisted`, o `add` filtrado pode retirar de `node_modules` pacotes de outros workspaces.

## Publicar

### A API

A imagem Docker (`apps/api/Dockerfile`) compila `@camille/shared` e a API e corre `node dist/main.js` com o utilizador `node`. Para a construir e experimentar localmente:

```sh
docker build -f apps/api/Dockerfile -t camille-api .
docker run --rm -p 3000:3000 -e NODE_ENV=production \
  -e ANTHROPIC_API_KEY=… -e OPENAI_API_KEY=… -e CAMILLE_API_KEY=… camille-api
curl http://localhost:3000/health
```

Com `NODE_ENV=production`, as três chaves são obrigatórias e o arranque falha sem elas. Em qualquer alojamento atrás de um proxy, define `CONFIANCE_PROXY=true` (os dois ficheiros abaixo já o fazem). As sessões ficam em memória: uma instância só, e um reinício apaga as sessões a decorrer (o histórico está no telemóvel, não se perde).

- **Render**: o `render.yaml` na raiz é um Blueprint. No Render, _New → Blueprint_, escolhe o repositório e, quando pedir, cola as três chaves. O plano `free` adormece sem tráfego e o primeiro pedido demora cerca de um minuto; para praticar sem esperas, muda para `starter`. O endereço fica `https://camille-api.onrender.com` (ou o nome que deres ao serviço).
- **Fly.io**: o `fly.toml` na raiz aponta para o Dockerfile. `fly launch --no-deploy --copy-config`, depois `fly secrets set ANTHROPIC_API_KEY=… OPENAI_API_KEY=… CAMILLE_API_KEY=…` e `fly deploy`. A máquina pára sem tráfego e acorda em segundos no primeiro pedido.
- Só se publicares a versão web da app: `CORS_ORIGINES=https://o-teu-dominio` (várias origens separadas por vírgulas).

### A versão web

`pnpm build:web` exporta a app para `apps/mobile/dist` (um HTML por rota, gerado a partir de `src/app/+html.tsx`, mais o bundle): serve-se em qualquer alojamento estático; uma regra de _rewrite_ de `/*` para `/index.html` garante que os links profundos abrem mesmo onde `/session` não é mapeado para `session.html`. O endereço da API e a chave ficam no bundle no momento da exportação (`EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_CAMILLE_API_KEY`), e a API precisa de `CORS_ORIGINES` com a origem do site.

A versão web está publicada na **Vercel**, em <https://camille-blond.vercel.app>. O `vercel.json` na raiz descreve o build (instalação com pnpm, `pnpm build:web`, pasta `apps/mobile/dist`, `cleanUrls` e o rewrite); o projeto `camille` está ligado ao repositório, por isso cada push ao ramo de produção (definido na Vercel em _Settings → Environments → Production_) publica em produção e os outros ramos criam pré-visualizações (protegidas por login da Vercel). As variáveis ficam nas definições do projeto: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_CAMILLE_API_KEY` e `ENABLE_EXPERIMENTAL_COREPACK=1`, para a Vercel usar o pnpm do campo `packageManager`. Como o endereço da API e a chave entram no bundle, mudar uma destas variáveis pede um novo deploy.

O `render.yaml` também inclui um serviço estático `camille-web` equivalente (e a API com `CORS_ORIGINES` a aceitar as duas origens); só a chave é pedida no painel. O CI também exporta a versão web em cada push, para apanhar o que só parte no bundle.

### A app num telemóvel

O **Expo Go** chega para tudo o que a app usa hoje (áudio, voz, armazenamento): com a API publicada, basta `EXPO_PUBLIC_API_URL=https://…` e `EXPO_PUBLIC_CAMILLE_API_KEY=…` em `apps/mobile/.env` e `pnpm dev:mobile --tunnel` para testar fora da tua rede.

Para uma app instalável sem Metro nem Expo Go (para ti e para quem testar), usa o EAS Build com o perfil `preview` de `apps/mobile/eas.json`:

```sh
npm install -g eas-cli && eas login
cd apps/mobile
eas init                                   # liga o projeto à tua conta Expo (escreve extra.eas.projectId)
eas env:create --environment preview --name EXPO_PUBLIC_API_URL --value https://camille-api.onrender.com --visibility plain
eas env:create --environment preview --name EXPO_PUBLIC_CAMILLE_API_KEY --value … --visibility sensitive
eas build --profile preview --platform android   # APK instalável diretamente
eas build --profile preview --platform ios       # precisa de conta Apple Developer; instala via TestFlight ou registo do aparelho
```

Os identificadores (`com.estrangelauc.camille`) estão no `app.json`; muda-os antes do primeiro build se quiseres outros. O perfil `production` serve para as lojas (`eas submit`). Se um dia a app precisar de um módulo nativo que não venha no Expo Go, junta `expo-dev-client` e um perfil `development` com `"developmentClient": true`.

O que só se confirma num telemóvel real: a qualidade das vozes francesas do sistema, o microfone com auriculares e o layout RTL em árabe no iOS e no Android.

### CI

`.github/workflows/ci.yml` corre em cada push para `main` e em cada pull request: build, typecheck, lint, testes e Prettier, e constrói a imagem Docker da API e confirma que responde em `/health`.

## Documentação

- [`docs/camille-system-prompt.md`](docs/camille-system-prompt.md) — prompts da Camille (conversa e feedback)
- [`docs/design-prompt.md`](docs/design-prompt.md) — prompt usado no Claude Design para os ecrãs

## Estado

🚧 Passo 11: pronta para a primeira utilização real — a app acorda a API ao abrir e insiste no arranque da sessão enquanto ela acorda; vibração e sinal sonoro do microfone (opcionais); ícone, ícone adaptativo, splash e favicon da marca. Os prompts do passo 10 continuam por testar com o modelo real. Falta o deploy (precisa das tuas contas) e o teste num telemóvel real.
