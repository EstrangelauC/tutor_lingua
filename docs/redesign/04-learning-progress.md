# Progressão, onboarding e definições

## Progressão

O ecrã `historique.tsx` apresenta três áreas: visão geral, evolução académica e histórico. A visão geral usa `statistiques` para contar sessões e somar os minutos já calculados pelo projeto. O último nível estimado vem da sessão mais recente. O gráfico mantém a série de até dez sessões, a referência do nível alvo e a nota de que se trata de uma estimativa, não de um resultado oficial.

Cada linha do histórico mostra data completa, tarefa, duração, trocas e nível estimado. Os filtros por tarefa mantêm a ordem das sessões e não alteram os dados guardados. Uma sessão abre o respetivo feedback pelo seu ID. Sem histórico, surgem totais zero, gráfico vazio, explicação e acesso à página Praticar.

## Onboarding

Continuam a existir três passos: idiomas, nível alvo e microfone. As escolhas de idioma e nível são guardadas no momento da seleção. A terceira etapa explica a permissão, mostra que é possível responder por texto e permite continuar sem conceder acesso. Ao terminar, `onboardingFait` continua a ser a única condição de entrada na aplicação. Preferências antigas mantêm `onboardingFait: true` pelo leitor existente, pelo que utilizadores anteriores não repetem o percurso.

## Definições

As opções existentes estão distribuídas por seis secções: Idiomas, Objetivo de estudo, Voz e microfone, Aparência e acessibilidade, Dados locais e Sobre a aplicação. A alteração de velocidade conserva a amostra de voz. O modo de microfone, retornos, tema e idiomas mantêm os mesmos valores persistidos. A limpeza do histórico continua a ter um passo de confirmação e não altera preferências.

## Internacionalização e acessibilidade

Os novos títulos das secções foram adicionados aos sete dicionários. O conteúdo francês mantém a direção LTR através dos estilos existentes da aplicação. A navegação para feedback conserva o ID de sessão, e as linhas do histórico têm uma descrição acessível com data e resultados.

## Validação

- Automatizada: leitura de preferências antigas e novas, atualização de idiomas, leitura e agregação do histórico, filtros por tarefa, chaves dos sete dicionários e contraste dos temas.
- Compilação e lint: `pnpm --filter @camille/mobile typecheck` e `pnpm --filter @camille/mobile lint`.
- Export web: `pnpm --filter @camille/mobile exec expo export --platform web --output-dir /tmp/camille-prompt4-web`.
- Browser web: percurso de onboarding (idiomas → B2 → microfone → “Agora não”), abertura da Progressão vazia e da página Praticar, secções de Definições, mudança para árabe, persistência após recarregar e alternância entre sidebar desktop e barra mobile. O browser mostrou apenas uma falha de `GET /health` em `localhost:3000`, porque a API local não estava em execução.
- Pendente em dispositivos: permissão do microfone iOS/Android, navegação RTL em árabe, seleção de filtros por toque e confirmação visual da limpeza. Estes fluxos exigem execução da aplicação num dispositivo ou simulador; os testes Node não simulam permissões nativas nem eventos de toque.

## Persistência

Não houve migração de esquema. `lirePreferences` continua a ler cada campo separadamente e `lireHistorique` continua a validar e ordenar as entradas locais. `effacerHistorique` só é chamado após a confirmação do utilizador.
