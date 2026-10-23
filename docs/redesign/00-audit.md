# Camille — auditoria e baseline para o redesign

Data: 22 de outubro de 2026 (Europe/Paris). Âmbito: estado local do projeto, sem redesign ou alterações funcionais.

## Conclusão e limites da aprovação

**Preparado para iniciar a Fase 1 de design e implementação incremental, com reservas explícitas.** O baseline está documentado, o build web funciona e os 60 testes existentes passaram em execução real. Isto não certifica ausência de regressões: não existe uma suite de UI/navegação/áudio, e a validação nativa e com serviços de voz reais continua pendente. Antes de substituir a navegação ou a apresentação da sessão, executar os gates da [checklist](00-regression-checklist.md).

Nenhum contrato, schema, prompt de avaliação, hook de áudio, componente ou ecrã foi modificado por esta auditoria. Não foram adicionados serviços, autenticação, sincronização ou dependências.

## Proveniência e reprodutibilidade

- HEAD observado: `9f2cbd894329d3fbbac065e570655a432469f878`.
- A árvore já estava modificada em 15 ficheiros versionados, incluindo sessão, cliente partilhado, backend e configuração. A lista está em [pre-existing-changes.txt](evidence/pre-existing-changes.txt). Já existiam também `apps/mobile/src/components/transcription.tsx`, `apps/mobile/src/voix/use-micro.ts` e `scripts/` não versionados. O baseline é **HEAD + essas alterações locais**, não apenas o commit.
- Dependências já instaladas; não foi feito upgrade nem reinstalação. Node local `24.14.0`, pnpm `11.28.2`; CI usa Node 22, e o projeto exige Node >=22.
- Foram lidos os `AGENTS.md` da raiz e da app, e os documentos locais da versão instalada do Turbo (`docs/README.md`, `crafting-your-repository/running-tasks.mdx`, referência de `--force`). Skill aplicada: `code-review-and-quality`.
- Os artefactos novos desta fase estão em `docs/redesign/`. Compilações também regeneram saídas ignoradas (`dist`, `.test-dist`, cache). Capturas usam um browser de teste e dados sintéticos locais.

## Estrutura, dependências e fronteiras

| Unidade                               | Responsabilidade                                                                       | Dependências principais observadas                                                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile` / `@camille/mobile`     | App iOS/Android e Expo Web; rotas, UI, preferências, histórico e coordenação da sessão | Expo 57.0.28, Expo Router 57.0.26, React 19.2.3, RN 0.86.3, RN Web 0.21.4; expo-audio, expo-speech, AsyncStorage, expo-localization, safe-area-context, SVG |
| `apps/api` / `@camille/api`           | HTTP NestJS, sessões em memória, conversa, transcrição, feedback e limites             | NestJS 12.1.3; SDK Anthropic, SDK OpenAI, Zod                                                                                                               |
| `packages/shared` / `@camille/shared` | Schemas Zod, tipos, erros e cliente HTTP                                               | Zod 4.6.7; exporta `dist/index.js` e declarações                                                                                                            |
| Raiz                                  | Orquestração, qualidade e publicação                                                   | pnpm workspaces com `nodeLinker: hoisted`; Turbo 2.11.7; TypeScript 6.0.3; ESLint 10; Prettier                                                              |

Ambos os consumidores dependem de `@camille/shared` via `workspace:*`. A app não importa código NestJS. O backend não depende da UI. A resolução hoisted permite à app importar Zod, embora não o declare diretamente no seu manifesto: existe acoplamento à disposição atual de `node_modules`; não migrar o linker durante o redesign.

`turbo.json`: `build` depende de `^build` e declara `dist/**`; `test` e `typecheck` dependem de `^build`; `lint` é independente; `dev` é persistente, sem cache, com passthrough de ambiente. A app não tem script `build`: `pnpm build` compila shared/API, **não** exporta a app. O script separado `pnpm build:web` compila shared e executa `expo export --platform web --clear`.

TypeScript usa `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns` e `noImplicitOverride`. ESLint inclui regras recomendadas de React Hooks. A CI executa build, typecheck, lint, testes, format e export web, mais uma imagem Docker com health check. Não foi executada a CI remota nem o job Docker nesta auditoria.

## Navegação e estados

Fonte: `apps/mobile/src/app/`.

| Rota                    | Papel e transições                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_layout.tsx`           | `DonneesProvider` hidrata antes de renderizar; `Stack.Protected` escolhe onboarding ou app conforme `onboardingFait`; splash, status bar, fundo e `html.lang/dir`; wakeup `/health` |
| `/onboarding`           | Três etapas locais: línguas, nível, microfone; grava preferências a cada escolha; permite adiar permissão e continuar após recusa                                                   |
| `(onglets)/_layout.tsx` | Tabs de Início, Histórico, Definições; em largura >=900 px navegação superior, abaixo disso inferior                                                                                |
| `/`                     | Escolha das três tarefas, objetivo, última sessão e último nível por tarefa; `push('/session', {tache})`                                                                            |
| `/historique`           | Lista, estatísticas, gráfico, filtro por tarefa e abertura do feedback por ID                                                                                                       |
| `/definitions`          | Preferências, exemplo de voz, confirmação de apagar histórico, informações da app                                                                                                   |
| `/session?tache=…`      | Valida tarefa com fallback `entretien`; cria uma sessão ao montar; terminar guarda histórico e faz `replace('/feedback', {id})`; sem respostas regressa ao início                   |
| `/feedback?id=…`        | Procura ID no histórico local; ausência tem estado próprio; voltar, repetir tarefa e nova tarefa                                                                                    |
| `+html.tsx`             | Documento de export web; título, viewport, tema inicial e reset de scroll; não é um ecrã                                                                                            |

O export gera ainda sitemap, not-found e aliases do grupo de tabs. O esquema nativo é `camille`; typed routes e React Compiler estão ativos. Refresh em `/session` monta outra sessão: o ID ativo não é persistido. «Retomar» no início inicia outra conversa da mesma tarefa; não recupera uma sessão incompleta. Repetir tarefa usa as preferências atuais, não repõe o nível/língua antigos.

## Sessão, voz, API e persistência

Fluxo principal:

```text
Ecrãs → useDonnees / useI18n / useTheme
session.tsx → useSessionCamille → api.ts → cliente @camille/shared → NestJS SessionsController
session.tsx → useMicro → useEnregistreur → formulário multipart → endpoint audio
Sessões NestJS → MoteurCamille (Claude ou simulado) / Transcripteur (OpenAI ou simulado)
Feedback → ajouterSession → histórico em contexto → AsyncStorage → histórico/gráfico/feedback
```

- `useSessionCamille` concentra arranque, respostas por texto/áudio, repetição de fala, conclusão, estado e erros. Atividades: `demarrage`, `reponse`, `evaluation`, ou `null`; outros estados: ID, réplicas, contagem, terminado, fala em curso, início e tentativa.
- Arranque: até 3 tentativas para erros temporários, pausa de 1,5 s. Em timeout/conflito de envio, consulta até 12 vezes o estado, com pausas de 5 s enquanto ocupado. Essa janela não é um teto de 60 s: cada GET pode demorar até 15 s.
- Texto é otimista; falha não recuperável retira a réplica local e repõe o rascunho. Áudio só acrescenta a transcrição recebida após sucesso. Feedback falhado mantém a sessão para nova tentativa.
- `useMicro` coordena pressão/mãos-livres, tecla Espaço na web, bip/vibração, mínimo 600 ms, máximo 90 s, limiar -40 dB e silêncio de 1,8 s após fala. Sem `metering`, não há envio automático por silêncio; permanece envio manual/limite de duração. Validar em cada plataforma.
- `useEnregistreur` usa expo-audio, mono, 64 kbit/s, permissões e modo de áudio; `formulaireAudio` usa blob web e descrição de ficheiro m4a nativo. Não é reconhecimento contínuo: grava, envia e transcreve no servidor.
- `parole.ts`: expo-speech em `fr-FR`, débitos 0,75/0,95/1,1; timeout de segurança até 40 s. `onError` é tratado como fim de fala, podendo acionar mãos-livres sem voz audível. Não foi validada a voz instalada.
- `api.ts`: `EXPO_PUBLIC_API_URL`, senão host do Expo/localhost:3000; chave pública opcional. Cliente valida respostas Zod, envia Bearer, respeita multipart e converte status em códigos traduzíveis. Timeouts: turno 45 s, áudio 60 s, feedback 120 s, consulta 15 s, wakeup 90 s.
- Endpoints: `GET /health`, `POST /sessions`, `GET /sessions/:id`, `POST /sessions/:id/messages`, `POST /sessions/:id/audio`, `POST /sessions/:id/terminer`. UUID e pedidos validados; áudio limitado a 10 MiB e MIME permitido; bloqueio por sessão e feedback idempotente.
- Sessões ficam num `Map` no servidor; expiram por inatividade de 2 h, purga a cada 10 min; reinício perde-as. Não há base de dados nem sincronização. Sem chaves em desenvolvimento há motores simulados; produção exige as chaves configuradas. Nenhuma chamada aos fornecedores reais foi feita nesta auditoria.
- AsyncStorage: `camille:preferences:v1` e `camille:historique:v1`. Preferências são reparadas campo a campo; instalações antigas com preferências saltam onboarding. Histórico valida/descarta entradas inválidas, ordena e mantém 100; substitui por ID. Gráfico usa as últimas 10. Estatísticas contam apenas histórico retido, arredondam cada sessão ao minuto com mínimo 1.
- Só sessões com feedback concluído entram no histórico; gravações e conversa completa não são gravadas nesse histórico. Falhas de leitura/escrita são silenciadas: a UI pode continuar sem persistir. Escritas assíncronas não têm fila explícita.

## Componentes reutilizáveis e duplicação visual

Todos os 12 ficheiros em `src/components/` têm consumidores; nenhum foi removido.

| Ficheiro / exportações                     | Consumidores principais                                   | Contrato a preservar                           |
| ------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------- |
| `ecran.tsx` / Ecran                        | Todos os seis ecrãs                                       | Safe area, fundo e direção                     |
| `texte.tsx` / Text                         | Ecrãs e componentes                                       | Direção de escrita; overrides francês/apoio    |
| `bouton.tsx` / Bouton                      | Todos os ecrãs                                            | Variantes, bloqueio, loading, handlers         |
| `choix.tsx` / Puces, Segments, CaseACocher | Onboarding, definições, histórico, sessão                 | Seleção tipada, roles e estado checked         |
| `section.tsx` / Section                    | Início, definições                                        | Título e agrupamento                           |
| `icones.tsx`                               | Tabs, início, onboarding, feedback, histórico, definições | SVG, tamanho, cor, espelhamento                |
| `progression.tsx`                          | Onboarding, sessão                                        | Atual/total, acessibilidade                    |
| `orbe-camille.tsx`                         | Onboarding, sessão, histórico vazio                       | Fala/escuta/pensamento/espera e nível de som   |
| `bouton-micro.tsx`                         | Sessão                                                    | Press-in/out versus toggle; disabled           |
| `transcription.tsx`                        | Sessão                                                    | Réplicas francesas, scroll até ao fim          |
| `graphique-niveaux.tsx`                    | Histórico                                                 | Níveis/objetivo, vazio, tempo invertido em RTL |
| `phrase-surlignee.tsx`                     | Feedback                                                  | Destaques errado/correto, francês LTR          |

Duplicações concretas a considerar na Fase 1: marca C/Camille em onboarding e início; cartões com borda/surface/padding e raios 18–20 em início, onboarding, histórico, definições e feedback; cabeçalhos com título 26/600 e subtítulo 15 em vários ecrãs; botões de retorno e pequenos links estilizados localmente; cabeçalho compacto versus cena da sessão. Cores já são tokens; espaçamento, raios e tipografia ainda são maioritariamente valores locais. Extrair primitivas visuais após comparar consumidores; não deslocar estado de sessão para componentes visuais.

## Idiomas, tema e acessibilidade

Sete idiomas: `pt-PT`, `en`, `es`, `ar`, `uk`, `tr`, `ro`, definidos em shared e em dicionários tipados. Idioma do aparelho é normalizado (inclui `mo` → `ro`), fallback inglês. Interface e apoio são separados; mudar interface acompanha apoio apenas quando ambos coincidiam. A conversa usa francês; os prompts permitem uma breve explicação na língua de apoio após dificuldade repetida. O feedback conserva a língua registada na sessão, mesmo se as definições mudarem.

Só árabe é RTL. Web atualiza `html.dir`/`lang`; nativo usa direção por ecrã e desativa o RTL global. `Text`, `styleTexte`, `FRANCAIS`, ícones espelhados e gráfico tratam diferenças. Testes verificam estrutura dos sete dicionários e alguns plurais árabes; não validam qualidade linguística, overflow ou toda a matriz visual. A mensagem nativa de permissão do microfone em `app.json` está apenas em português.

Tema: `systeme`, `clair`, `sombre`, paletas centralizadas, `useColorScheme` e `creerStyles` precomputado. HTML inicial/meta seguem o sistema antes da hidratação, podendo divergir da preferência explícita guardada. Breakpoint 900 px, coluna de leitura 760 px, feedback desktop até 1200 px. iOS configurado sem suporte tablet e app nativa em portrait.

Há roles, live regions, labels de gráfico, alvos de toque de referência 48 px, alternativa por texto e controlo de retornos do microfone. Não há controlos próprios de tamanho de letra ou movimento reduzido. `OrbeCamille` anima sem consultar essa preferência; `Transcription` faz scroll animado. O botão de ouvir correção tem `minHeight: 36`, abaixo da convenção local de 48. Não foram medidos contrastes nem testados VoiceOver/TalkBack/teclado completo.

## Riscos priorizados

Severidade: alta = fluxo essencial/dados; média = comportamento ou experiência incompletos; baixa = manutenção. «Inspeção» não significa reprodução em dispositivo.

| ID  | Prioridade / evidência                                    | Risco e tratamento para a Fase 1                                                                                                                                                                                                                                                      |
| --- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Alta — inspeção dos testes e tsconfig.test                | Nenhum teste monta ecrãs/hooks; mudanças de navegação podem passar toda a suite e quebrar voz. Aplicar checklist manual e testes de fluxo antes de substituir estes pontos.                                                                                                           |
| R2  | Alta — `use-session-camille.ts`, cleanup de `session.tsx` | Pedidos, pausas e polling não são cancelados/invalidados ao desmontar. Cleanup só para fala; resposta tardia pode voltar a falar ou chamar abertura do micro. Reproduzir saída durante arranque/resposta; tratar separadamente sem alterar áudio nesta fase.                          |
| R3  | Alta — `use-micro.ts`/`use-enregistreur.ts`               | Erros de prepare/record/stop/form-data não têm tradução/catch sistemático; vários callbacks usam `void`. Cancelar depende do estado observado de gravação; início concorrente/permissão tardia merece teste. Não há garantia explícita de cleanup de modo de áudio/background na app. |
| R4  | Alta — armazenamento e sessão em memória                  | Refresh/reinício abandona sessão ativa; falha de persistência pode perder feedback silenciosamente; API reiniciada perde sessões. Não prometer retoma/cloud no redesign.                                                                                                              |
| R5  | Média — `session.tsx` ramo `large`                        | Transcrição só pode ser ocultada em largura <900; desktop sempre visível. Há uma lacuna face ao requisito geral «visível ou oculta». Tornar a decisão explícita na Fase 1, sem fingir que já funciona em desktop.                                                                     |
| R6  | Média — `parole.ts`, `use-micro.ts`                       | Fim por erro/timeout de TTS pode abrir micro; silêncio automático depende de metering; permissões e autoplay variam. Gate nativo e browser real obrigatório.                                                                                                                          |
| R7  | Média — animações, controles e i18n                       | Movimento reduzido não tratado; botão de correção menor que convenção; bidi, zoom e textos longos sem testes de UI. Preservar semântica e validar visualmente.                                                                                                                        |
| R8  | Média — `client.ts`                                       | Timeout é limpo após `fetch` receber resposta, antes de `response.json`; corpo lento pode exceder o prazo anunciado. Polling não tem prazo global. Não encurtar loading artificialmente no redesign.                                                                                  |
| R9  | Média — estado/repetições                                 | Guard de arranque evita simultaneidade, mas não cancela tentativas abandonadas; retries de criação podem deixar sessões órfãs no servidor. Alterar dependências do hook ou remounts exige cuidado.                                                                                    |
| R10 | Média — proteção existente                                | Chave `EXPO_PUBLIC_*` é embutida, não uma identidade de utilizador; acesso ao estado usa UUID e chave comum. Preservar limites/CORS, sem introduzir autenticação. Não afirmar isolamento de contas.                                                                                   |
| R11 | Média — export/ambiente                                   | Sem URL configurada, export usa localhost:3000; bundle web 2,5 MB (tamanho reportado pelo Expo, não gzip). Build não comprova configuração de produção nem performance.                                                                                                               |
| R12 | Baixa — dependências/estilos                              | Zod transitivo/hoisted, componentes acoplados ao contexto, valores visuais repetidos e diferença Node local/CI. Evitar combinar migração de dependências com redesign.                                                                                                                |

## Verificações executadas

| Comando                                               | Resultado                                                                                                                                    | Evidência                          |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `pnpm typecheck`                                      | Sucesso, 4 tarefas em cache                                                                                                                  | [log](evidence/typecheck.log)      |
| `pnpm lint`                                           | Sucesso, 3 tarefas em cache                                                                                                                  | [log](evidence/lint.log)           |
| `pnpm test`                                           | Sucesso em cache, não contado como execução nova                                                                                             | [log](evidence/test.log)           |
| `pnpm exec turbo run typecheck lint test --force`     | Typecheck e lint passam; shared 11/11 e mobile 25/25; API 10 passam e 14 cancelados por `listen EPERM 127.0.0.1`. Exit 1; 0 tarefas em cache | [log](evidence/checks-fresh.log)   |
| `pnpm --filter @camille/api test` com permissão local | 24/24 passam, zero cancelamentos, exit 0; resolve a limitação anterior                                                                       | [log](evidence/api-test-local.log) |
| `pnpm build:web`                                      | Sucesso: Metro recompila sem cache, 11 rotas estáticas e bundle web 2,5 MB; avisos de cache vazio e NO_COLOR/FORCE_COLOR                     | [log](evidence/build-web.log)      |
| `pnpm build` (adicional)                              | Sucesso, shared/API em cache; não inclui app                                                                                                 | [log](evidence/build.log)          |

Resultado consolidado de execução nova: **60/60 testes passam** (25 mobile + 11 shared + 24 API). Nenhum script obrigatório estava ausente. Não existe script de cobertura nem suite E2E de UI configurada; percentagem de cobertura não foi medida. Não foram executados builds nativos, teste de fornecedores reais, auditoria de dependências remota, format global ou Docker.

Os 24 testes da API incluem 14 testes de integração HTTP com servidores locais e motores simulados e 10 testes unitários/ensaio. Mobile testa apenas lógica sem React Native (preferências, histórico e dicionários). Shared cobre serialização, validação, erros, autorização, multipart e timeout do cliente. O teste de GET de recuperação não cobre o polling React; testes de transcrição usam mocks, não áudio real. Não existe evidência automatizada de navegação, gestos, hidratação AsyncStorage, lifecycle, screenshots, RTL renderizado ou permissões reais.

## Capturas e observação visual

22 capturas em `evidence/`, Expo Web em Chromium, viewports **390×844** e **1440×900**, escala do browser; prefixos `mobile-` e `desktop-`. Mobile significa largura estreita, não execução nativa. Cada imagem é do viewport, não de toda a área interna de scroll.

- `*-onboarding-1.png`, `*-onboarding-2.png`, `*-onboarding-3.png`: passos percorridos pela UI, português, B1, sem conceder microfone.
- `*-accueil.png`, `*-historique-vide.png`, `*-definitions.png`: dados inicialmente vazios, tema claro.
- `*-definitions-ar-sombre.png`: árabe/escuro selecionados pela UI; confirmados `html.lang=ar` e `dir=rtl`.
- `*-session-erreur-simulee.png`: resposta HTTP 503 simulada no browser, três tentativas e botão de retry.
- `*-session-simulee.png`, `*-feedback-simule.png`, `*-historique-simule.png`: respostas HTTP sintéticas interceptadas apenas no browser. Retry → sessão Entretien → resposta escrita → terminar → feedback → histórico. Um ID fictício e uma correção; sem chamada externa nem avaliação real.

Exemplos: [início mobile](evidence/mobile-accueil.png), [início desktop](evidence/desktop-accueil.png), [árabe escuro](evidence/mobile-definitions-ar-sombre.png), [feedback desktop sintético](evidence/desktop-feedback-simule.png).

O wakeup inicial falhou em localhost:3000 porque não foi arrancada a API de desenvolvimento. Os 503 posteriores são intencionais. A consola também registou fallback de `Animated.useNativeDriver` para animação em JavaScript na web; não implica instalação de módulos nativos nesta fase. Logs e snapshots do browser estão em `evidence/browser-traces/`. Estas observações não demonstram TTS audível, microfone, reconhecimento ou fluxo completo de oito turnos. Sem captura em aparelho/simulador nativo; a validação nativa permanece pendente. As capturas são referência visual, não testes de comparação automática.

## Condições para a Fase 1

1. Preservar os contratos enumerados no inventário, chaves locais, enums e regras de avaliação.
2. Manter os hooks atuais e respetivos eventos durante as primeiras alterações visuais; não introduzir remounts da sessão como efeito da navegação/responsividade.
3. Decidir explicitamente como cumprir ocultação da transcrição no desktop e manter os estados de erro/loading acessíveis.
4. Executar os gates da checklist por cada mudança de navegação/sessão e completar validação em iOS/Android antes de aprovar o redesign para publicação.
5. Guardar este baseline juntamente com as alterações locais das quais depende no processo de versionamento do projeto; não foi criado commit nesta fase.
