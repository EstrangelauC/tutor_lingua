# Camille — inventário funcional a preservar

Baseline: 22/10/2026, árvore local descrita em [00-audit.md](00-audit.md). Este inventário descreve a implementação atual; não é uma proposta de redesign. Caminhos abaixo são relativos à raiz do monorepo.

Legenda de evidência: **U** = testes unitários existentes; **HTTP** = integração backend simulada; **V** = observado no browser nesta auditoria; **I** = inspeção de código. V não equivale a teste de dispositivo/fornecedor real.

## Jornadas e dependências

| ID  | Funcionalidade / comportamento atual                                                                                   | Implementação e dependências                                                           | Evidência / lacuna                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| F01 | Primeira utilização abre onboarding; utilizadores antigos com preferências não o repetem                               | `donnees/donnees-context.tsx`, `preferences.ts`, `app/_layout.tsx`                     | U + V; hidratação real sem teste automático              |
| F02 | Onboarding em três etapas: interface/apoio, nível, microfone; voltar entre etapas, continuar, adiar ou recusar micro   | `app/onboarding.tsx`, Puces, CaseACocher, Progression, expo-audio                      | V passos + adiar; permissão real pendente                |
| F03 | Sete idiomas independentes para interface/apoio; seleção automática por locale; mudança imediata                       | `i18n/langues.ts`, `textes/*`, `useI18n`, preferências                                 | U sete dicionários; V português/árabe                    |
| F04 | A2/B1/B2 como objetivo; B1 por omissão; alteração em onboarding/definições                                             | shared `base.ts`, `preferences.ts`; configura sessão/prompt                            | U validação; UI completa por nível pendente              |
| F05 | Entretien, Interaction e Point de vue; três cartões, descrições, número da tarefa e último nível                       | `taches.ts`, início, shared `TacheSchema`, API `prompts.ts`                            | I + V início; jornada nas três tarefas pendente          |
| F06 | Contexto de sessão: tarefa, nível, língua de apoio; primeira fala automática; oito respostas do aluno                  | `session.tsx` → `useSessionCamille` → shared cliente → SessionsService → MoteurCamille | HTTP; V uma sessão sintética de um turno                 |
| F07 | Conversa predominantemente francesa, adaptada ao nível/tarefa; sem correções durante exercício                         | API `prompts.ts`, `claude.moteur.ts` ou `simulee.moteur.ts`                            | U motor mockado; qualidade do modelo real não verificada |
| F08 | Voz francesa automática e «ouvir outra vez»; três velocidades; parar fala ao sair; ouvir exemplos/correções            | `voix/parole.ts`; sessão, definições, feedback                                         | I; sem audição validada                                  |
| F09 | Gravar e transcrever francês; resposta inclui texto reconhecido e fala seguinte                                        | `use-enregistreur.ts`, `formulaire-audio.ts`, endpoint `/audio`, OpenAiTranscripteur   | HTTP/mocks; microfone real pendente                      |
| F10 | Pressão: press-in inicia, press-out envia; menos de 600 ms rejeitado; arranque tardio após soltar descarta             | BoutonMicro → `useMicro` → gravador                                                    | I; gestos/permissões sem testes                          |
| F11 | Mãos-livres: micro abre após fim de TTS, envia após silêncio se houver metering, também alterna por toque; limite 90 s | `onFinParole`, refs em sessão, `useMicro`                                              | I; comportamento nativo/web pendente                     |
| F12 | Bip na abertura automática, vibração no início/fim nativo; preferência para desligar                                   | `retoursMicro`, expo-haptics, `assets/sons/bip.wav`                                    | U preferência parcial; hardware pendente                 |
| F13 | Tecla Espaço controla micro web, ignora repetição e campos de texto/editáveis                                          | `useMicro`, eventos keydown/keyup                                                      | I; foco/blur e teclado assistivo pendentes               |
| F14 | Alternativa por texto, limite 2000 caracteres, trim, bloqueio vazio/ocupado, rascunho reposto após falha               | `session.tsx`, `useSessionCamille.envoyer`, shared schema                              | U/HTTP contrato; V envio sintético                       |
| F15 | Permissão recusada mostra aviso e entrada de texto; nativo oferece abrir definições do sistema                         | `micro.permission`, `Linking.openSettings` em sessão                                   | I; recusa real pendente                                  |
| F16 | Transcrição ocultável em mobile, inicialmente oculta; desktop sempre visível; scroll automático e francês LTR          | estado `transcriptionVisible`, `Transcription`, `FRANCAIS`                             | I + capturas; ocultação desktop não implementada         |
| F17 | Estados de arranque/retry, resposta, avaliação, fala, escuta, espera, concluído; orbe, contador e progresso            | `EtatSession`, session.tsx, OrbeCamille, Progression, Bouton                           | V alguns estados; transições rápidas sem testes          |
| F18 | Terminar cedo com respostas gera feedback; sem respostas sai; oito respostas encerram conversa                         | `onTerminer`, SessionsService; `MAX_ECHANGES=8`                                        | HTTP + V término precoce sintético                       |
| F19 | Feedback A1/A2/B1/B2 estimado, resumo, até três correções, destaques, explicações e um conselho; aviso de estimativa   | shared FeedbackSchema, API avaliação, `app/feedback.tsx`, PhraseSurlignee              | U/HTTP; V um exemplo sintético                           |
| F20 | Ouvir correção, voltar, repetir tarefa, escolher nova; feedback desconhecido tem estado próprio                        | feedback por `id` no histórico, router                                                 | V nova tarefa; restantes I                               |
| F21 | Histórico local das últimas 100 sessões concluídas, sem duplicar ID, mais recente primeiro                             | `historique.ts`, contexto, AsyncStorage                                                | U dados; V gravação em memória via UI                    |
| F22 | Estatísticas: número de sessões, soma de minutos arredondados por sessão (mínimo 1), objetivo atual                    | `statistiques`, `enMinutes`, histórico                                                 | U + V um registo                                         |
| F23 | Gráfico das últimas 10 avaliações, A1–B2, objetivo tracejado e RTL cronológico invertido                               | `statistiques`, GraphiqueNiveaux, ECHELLE                                              | U seleção dos dados; render I/V um ponto                 |
| F24 | Filtro Todas ou tarefa, estado sem resultados, abrir feedback da linha                                                 | estado local `filtre` em histórico                                                     | I; filtro não altera totais/gráfico globais              |
| F25 | Início mostra última sessão e «Retomar», último nível de cada tarefa                                                   | `derniereParTache`, `joursDepuis`, início                                              | U; retomar cria nova sessão, não reabre conversa         |
| F26 | Tema sistema/claro/escuro, mudança imediata e persistência                                                             | PALETTES, `creerStyles`, `useTheme`, contexto                                          | V claro/escuro; sistema/hidratação pendentes             |
| F27 | Safe area, RTL, texto francês LTR, labels/roles/live regions, estados disabled/busy e gráfico acessível                | Ecran, Text, i18n, componentes                                                         | I; V árabe web; leitores de ecrã não testados            |
| F28 | Apagar histórico requer confirmação; pode cancelar; não apaga preferências; indicação de sucesso                       | `definitions.tsx`, `effacerHistorique`                                                 | I; teste manual destrutivo só em dados de teste          |
| F29 | Recuperação de arranque (3 tentativas), timeout/conflito via GET, retry do feedback, erros traduzidos                  | `useSessionCamille`, ErreurApi, cliente, servidor                                      | U/HTTP parciais; V 503 → retry bem-sucedido sintético    |
| F30 | Wakeup API ao abrir, aviso de tentativa, fallback simulado em desenvolvimento, proteção e validação HTTP               | root layout, API módulos, guard/limiter, config                                        | HTTP proteção; V wakeup sem servidor                     |

## Regras invariantes entre as camadas

- Enums e nomes de campos em `packages/shared/src/base.ts`, `session.ts` e `erreurs.ts` são contratos; manter sem migração nesta fase.
- `MAX_ECHANGES` é 8 para todas as tarefas. O objetivo só admite A2/B1/B2, mas o feedback também pode estimar A1.
- Mensagem enviada: `{texte}`; criação: `{niveau, tache, langueAppui}`; áudio: FormData com campo `audio`. Não definir manualmente o Content-Type multipart.
- Turno contém `sessionId`, `camille`, `echange`, `maxEchanges`, `terminee`; áudio acrescenta `texteEleve`; consulta acrescenta `transcription` e `occupee`.
- Feedback: `niveauEstime`, `resume`, `erreurs` (0–3) e `conseil`; correção contém título, frase original, excerto errado, forma correta, excerto corrigido e explicação.
- Pedir feedback novamente reutiliza o resultado backend; guardar novamente o mesmo ID substitui a entrada local.
- Sessão terminada não admite novas mensagens; sem resposta não há avaliação; áudio vazio não consome uma troca.
- A língua de apoio guardada no histórico determina a direção do conteúdo do feedback; francês continua LTR.
- `date`, tarefa, nível alvo, apoio, contagem, duração e feedback são guardados antes de navegar para `/feedback`.
- A duração é medida antes da avaliação; o tempo de geração do feedback não entra na prática.
- Filtro do histórico só filtra a lista. Estatísticas e gráfico usam o histórico completo retido. Objetivo gráfico/badges usa preferência atual; feedback compara com o objetivo da sessão.

## Dados persistentes versus efémeros

| Dado                                                                        | Local / duração                                             | Dependências de UI                                                         |
| --------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| Idiomas, objetivo, tema, velocidade, modo micro, onboarding, retornos micro | AsyncStorage, chave `camille:preferences:v1`                | Todas as rotas, prompts de criação, voz, direção                           |
| Até 100 resultados                                                          | AsyncStorage, chave `camille:historique:v1`                 | Início, histórico, gráfico e feedback                                      |
| Etapa de onboarding                                                         | State do ecrã                                               | Reabrir antes de concluir regressa ao passo 1, mantendo escolhas           |
| Filtro de histórico, confirmação de apagar                                  | State do ecrã                                               | Não há contrato de persistência destes estados                             |
| Rascunho, transcrição visível, entrada voz/texto, ID/conversa ativa         | State/refs de sessão                                        | Perdem-se com remount/reload; não representar como conversa recuperável    |
| Sessão backend e feedback temporário                                        | Map do processo; 2 h de inatividade até elegível para purga | Polling de recuperação, envio, avaliação                                   |
| Ficheiro de gravação                                                        | URI/blob transitório e upload                               | Não integra o histórico; limpeza de temporários nativos não foi verificada |

## Fronteiras de alteração para o redesign

É possível começar por tokens, composição visual e primitivas, preservando props e handlers. Navegação deve conservar os guards, parâmetros e momento de guardar feedback. O ciclo de áudio, o hook de sessão, API, schemas, prompts e regras de avaliação ficam fora do âmbito de alterações nesta fase.

Nenhum componente foi classificado como descartável: a auditoria encontrou consumidores para todos. Antes de remover ou fundir qualquer componente na Fase 1, voltar a pesquisar os imports e comparar estados/loading/RTL/acessibilidade. Os riscos R1–R12 e os gates de aceitação estão nos outros dois documentos.
