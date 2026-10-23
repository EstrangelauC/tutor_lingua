# Camille 2.0 — resultados dos testes

Execução a partir da raiz do monorepo após as correções da Fase 5.

| Comando | Resultado | Observações |
| --- | --- | --- |
| `pnpm typecheck` | aprovado | API, mobile e shared; parte dos resultados reaproveitada pelo cache local do Turbo |
| `pnpm lint` | aprovado | API, mobile e shared |
| `pnpm test` | aprovado | 70 testes: 24 API, 35 mobile, 11 shared; incluem contratos, histórico, i18n, recomendação e contraste |
| `pnpm build:web` | aprovado | export Expo Web, 13 rotas estáticas; bundle web gerado |
| `git diff --check` | aprovado | sem whitespace incorreto nas alterações rastreadas |

## Testes de interface executados

- Chromium local: geometria/ausência de scroll horizontal a **390, 768, 1024 e 1440 px** em Percurso, Praticar, Progressão, Definições, Sessão, Feedback e Onboarding. Barra inferior só no mobile/tablet; sidebar só no desktop.
- Novo utilizador: passos de idiomas, nível e microfone com «Agora não», sem conceder permissão.
- Teclado: rádio focado via Tab mostrou outline de 3 px. RTL árabe e tema escuro persistiram após navegação/reload. Preferência de movimento reduzido foi emulada no browser.
- Dados fictícios locais de teste: 3 sessões, filtros, gráfico, feedback anterior, repetição de Interaction e limpeza com confirmação. As fixtures foram removidas.
- Sessão sem API: erro de ligação visível, ação «Tentar outra vez», microfone/reescuta desativados e regresso seguro ao Percurso. Início das três rotas TCF confirmado pelo cabeçalho, não pela criação remota da sessão.
- `navigator.mediaDevices.getUserMedia` existe em `localhost` seguro; o estado da permissão era `prompt`. Isto **não** prova que a gravação funciona.

## Não executados / falhados por ambiente

- **Integração real:** `GET http://localhost:3000/health` falhou com ligação recusada. Não há validação fim a fim de IA, voz, texto enviado, áudio gravado, transcrição, término com feedback gerado ou recuperação de timeout real.
- **Dispositivos/browsers:** sem testes em iOS, Android, Safari ou Firefox; sem permissão real de microfone, gravação nos dois modos, reprodução audível, leitor de ecrã ou zoom 200%.
- **Baseline visual final:** não comparada com a imagem de referência ainda não entregue.

Estas lacunas são testes **pendentes**, não aprovados por inferência dos testes Node nem das fixtures visuais.
