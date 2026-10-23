# Camille 2.0 — auditoria final funcional, visual e de segurança

**Estado:** não aprovada para lançamento. A auditoria web e os testes automatizados passaram, mas faltam ensaios de sessão com API/voz reais e a chave `CAMILLE_API_KEY` continua destinada ao bundle público. Não foi feito deploy nesta fase.

## Funcionalidades

Legenda: **A** automatizado, **W** observado no Chromium local, **P** pendente de validação real.

| # | Fluxo | Resultado e evidência |
| --- | --- | --- |
| 1 | Onboarding novo | **W** três passos, escolha de língua/nível e «Agora não»; permissão efetiva **P** |
| 2 | Preferências antigas | **A** leitura campo a campo e bypass de onboarding existente (`preferences.test.ts`) |
| 3 | Quatro destinos | **W** barra mobile e sidebar desktop, sem duplicação visível |
| 4 | Recomendação | **A/W** testes de desempate/sem histórico; Percurso mostra Entretien sem histórico |
| 5 | Três tarefas | **W** as três URLs mostram a tarefa correta; conversa efetiva **P** |
| 6 | Conversação | **A** API simulada em testes; integração web com API real **P** |
| 7 | Reprodução de áudio | Botões ligados aos fornecedores existentes; som efetivo **P** |
| 8 | Dois modos de microfone | Escolha visível/persistida; gravação e permissões efetivas **P** |
| 9 | Resposta por texto | Campo/ação visíveis; envio real **P** (API local indisponível) |
| 10 | Transcrição | Painel abre e duas colunas em desktop; conteúdo real **P** |
| 11 | Encerrar sessão | **W** sem resposta regressa ao Percurso; sessão já criada no servidor não é cancelada explicitamente (**P**, ver riscos) |
| 12 | Feedback/correções | **W** histórico fictício de teste: nível, resumo, correção destacada e conselho; geração real **P** |
| 13 | Repetir tarefa | **W** feedback de Interaction abriu `/session?tache=interaction` |
| 14 | Histórico/filtros | **A/W** três entradas fictícias, filtro Interaction reteve só essa tarefa |
| 15 | Gráfico | **A/W** ordem A1→A2→B1, linha alvo B1 e legenda em RTL |
| 16 | Limpeza | **W** confirmação obrigatória de 3 entradas; armazenamento ficou `[]` |
| 17 | Persistência | **A/W** árabe e tema escuro mantidos após recarregar |
| 18 | Sete idiomas | **A** igualdade de chaves e textos não vazios; revisão linguística humana **P** |
| 19 | Claro/escuro | **A/W** pares de contraste testados e capturas nos dois temas |
| 20 | RTL árabe | **W** `lang=ar`, `dir=rtl`, sem scroll horizontal, nomes franceses legíveis |

As entradas do histórico usadas no browser eram **fixtures locais inventadas apenas para teste**, nunca resultados apresentados como académicos ou dados de produção. Foram removidas no fim.

## Regressões corrigidas nesta fase

- Percurso e Praticar tinham texto fixo em português nas restantes línguas; agora usam os sete dicionários. Praticar deixou de impor texto preto no tema escuro e usa a última sessão por tarefa.
- Percurso obtinha a **sessão mais antiga** (`historique[length-1]`) como «última»; agora usa a entrada `0`, pois a persistência ordena por data decrescente.
- Percurso/Praticar tinham layout local sem largura máxima; agora usam os tokens partilhados, e Praticar distribui os três cartões no desktop amplo.
- Sessão/feedback dividiam colunas a partir de 900 px, competindo com a navegação compacta; agora exigem 1200 px.
- Reescuta sem fala mostrava aspeto ativo; agora comunica visualmente e semanticamente o estado desativado.
- Pulsação e rolagem animada da sessão ignoravam movimento reduzido; agora respeitam a preferência da plataforma.
- `theme/tokens.ts` continha uma paleta duplicada e obsoleta, diferente da usada e testada em `palettes.ts`; foi removida.

## Segurança e compatibilidade

- Não há ficheiros `.env` com valores versionados; `ANTHROPIC_API_KEY` e `OPENAI_API_KEY` são lidas no backend. Os schemas partilhados não foram alterados nesta fase; os testes da API e do cliente passaram.
- **Bloqueio de segurança/arquitetura:** `apps/mobile/src/api.ts` lê `EXPO_PUBLIC_CAMILLE_API_KEY` e o README confirma que a mesma chave exigida pela API é embutida no bundle web/native. Não é um segredo protegível no cliente. Os limites por IP reduzem abuso, mas não satisfazem o critério «chaves de API não expostas no cliente». Corrigir exige uma decisão de autenticação/abuso no backend; não foi ocultado por configuração nem alterado de improviso durante a estabilização.
- **Ciclo de vida:** ao sair sem resposta, a app abandona a rota sem endpoint de cancelamento; a sessão em memória expira após 2 h de inatividade (limpeza periódica). Não há prova de sessão remota ativa neste teste, pois a API local estava indisponível. Um cancelamento explícito exigiria alterar o contrato da API, por isso fica documentado antes de qualquer intervenção.
- A chave pública de acesso não deve ser confundida com as chaves privadas Anthropic/OpenAI. Não foram adicionadas dependências de UI nem métricas académicas fictícias.

## Auditoria visual

As capturas anteriores em `00-*`, `01-evidence` e `evidence/` foram usadas como baseline informativa, não como prova de correspondência com o design pretendido. A navegação antiga de três destinos foi substituída pela de quatro, com cores, cartões e tipografia da Camille 2.0. As novas capturas em [`05-evidence/`](./05-evidence/) cobrem mobile, desktop, modo escuro e RTL. A comparação com a imagem final do utilizador está pendente, pois essa imagem será fornecida mais tarde.

## Limitações de validação

Só foi usado Chromium/Expo Web local. A API em `localhost:3000` recusou ligação; o fluxo real de IA, áudio, transcrição, feedback gerado e recuperação de falhas não foi executado. Firefox, Safari, iOS e Android, permissões reais, leitores de ecrã e zoom/texto ampliado precisam de ensaio manual. O projeto **não está declarado pronto para produção**.
