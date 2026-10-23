# Fase 5 — Expo Web responsiva e acessibilidade

## Correções implementadas

- Percurso e Praticar passaram a usar `Ecran` e a largura/margens partilhadas de `useMiseEnPage`; deixam de depender de padding local. Em Praticar, as três tarefas ocupam colunas iguais a partir de 1200 px e mantêm uma coluna nos tamanhos menores.
- A sidebar continua exclusiva de larguras ≥900 px; a barra inferior aparece abaixo desse limite. A sidebar mostra o nível alvo real, marca a página ativa e oferece controlos de pelo menos 48 px. No mobile, o conteúdo tem scroll próprio acima da barra, sem sobreposição do último cartão.
- Sessão e feedback só passam a duas colunas a partir de 1200 px. Aos 1024 px, a sidebar deixava pouco espaço útil para duas colunas de sessão; agora a transcrição mantém-se num painel acessível no mesmo fluxo.
- O HTML inicial tem `lang="pt-PT"`, título, descrição e cor de tema. Após ler as preferências, a app define o idioma e `dir` reais no documento. O foco de teclado tem contorno visível de 3 px; a preferência de movimento reduzido desliga a pulsação do orbe e a rolagem animada da transcrição.
- A ação «Ouvir outra vez» fica visualmente inativa e com estado acessível enquanto não há fala disponível. O respetivo texto de atalho de teclado só aparece quando o microfone está efetivamente pronto.
- Removida de `theme/tokens.ts` uma segunda paleta obsoleta. As cores usadas continuam centralizadas em `theme/palettes.ts`, com testes de contraste claro/escuro.

## Validação de browser (Chromium, Expo Web local)

| Largura | Navegação visível | Scroll horizontal | Notas |
| --- | --- | --- | --- |
| 390 px | barra inferior | não | último cartão acessível acima da barra; onboarding e definições inspecionados |
| 768 px | barra inferior | não | sem sidebar duplicada |
| 1024 px | sidebar | não | sessão/feedback em uma coluna, sem compressão da transcrição |
| 1440 px | sidebar | não | Praticar em 3 colunas; sessão/feedback em duas |

Foram verificados os quatro tamanhos em Percurso, Praticar, Progressão, Definições, Sessão e Feedback (incluindo feedback e histórico com **dados fictícios apenas no browser de teste**). O onboarding foi percorrido nos três passos em 390 px e inspecionado nos quatro tamanhos. As capturas representativas estão em [`05-evidence/`](./05-evidence/): `percurso-390.png`, `percurso-1024.png`, `pratique-1440-grid.png`, `session-no-api-390.png`, `session-no-api-1440.png`, `onboarding-390.png`, `onboarding-1440.png`, `historique-fixture-ar-dark-1440.png` e `feedback-fixture-ar-dark-390.png`.

## Acessibilidade verificada

- Teclado: Tab alcança os controlos e o rádio focado mostra outline de 3 px; setas nos grupos de escolha já eram suportadas.
- Contraste: os testes `theme.test.ts` verificam pares de texto ≥4,5:1 e limites/foco ≥3:1 nos dois temas.
- RTL: a mudança para árabe alterou `html.lang` para `ar` e `html.dir` para `rtl`, preservou os nomes franceses e não criou overflow; tema escuro e preferências persistiram após recarregar.
- Movimento reduzido: emulação `prefers-reduced-motion: reduce` confirmou duração CSS quase nula; o orbe e a transcrição usam a preferência de acessibilidade da plataforma.
- Estados: a sessão sem API exibiu mensagem de erro e «Tentar outra vez»; o microfone e a reescuta ficaram desativados enquanto não existia sessão.

## Verificações pendentes

- O browser local reportou `GET http://localhost:3000/health` indisponível; por isso não foi possível avaliar conversa, gravação ou transcrição **reais** neste ensaio visual.
- Em `localhost` seguro, `navigator.mediaDevices.getUserMedia` existe e a permissão estava em `prompt`. Não foi concedida nem recusada uma permissão real, nem testados Firefox/Safari; os pedidos e a captura de áudio exigem teste manual nesses browsers e em HTTPS de produção.
- Escalabilidade de texto/zoom alto, leitores de ecrã e dispositivos iOS/Android ainda precisam de validação manual. A inspeção visual não substitui essas verificações.
- As imagens de design finais ainda não foram fornecidas; não há comparação pixel a pixel com a referência pretendida.
