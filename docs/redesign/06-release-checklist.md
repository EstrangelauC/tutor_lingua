# Camille 2.0 — checklist de lançamento

**Decisão atual: NÃO PUBLICAR COMO PRONTA PARA PRODUÇÃO.** O build passa, mas os critérios essenciais abaixo permanecem abertos.

## Aprovado

- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build:web`.
- [x] Navegação web responsiva a 390/768/1024/1440 px, sem barra e sidebar simultâneas.
- [x] Estados vazios, histórico, filtros, gráfico e feedback anterior validados com fixtures locais.
- [x] Persistência de idioma/tema, RTL e contraste claro/escuro no browser local.
- [x] Chaves privadas dos fornecedores de IA/transcrição permanecem no backend; nenhum `.env` com valores rastreado.

## Bloqueadores antes do lançamento

- [ ] Definir e implementar uma proteção da API que **não dependa de `CAMILLE_API_KEY` embutida no cliente público**, ou aprovar explicitamente uma política de chave pública/rate limiting que substitua esse critério. A mudança é arquitetural e não foi feita nesta auditoria.
- [ ] Executar uma sessão real das três tarefas, envio de texto e áudio em ambos os modos, transcrição, reprodução, término, feedback guardado, repetição e recuperação de falhas com a API de produção/estaging.
- [ ] Confirmar comportamento de permissões do microfone, captura e reprodução em Safari/Firefox e em iOS/Android reais ou simuladores adequados.
- [ ] Revisar o ciclo de vida de uma sessão remota quando o aluno sai antes da primeira resposta; atualmente depende do TTL de 2 h no servidor.

## Antes de dar por concluída a identidade visual

- [ ] Comparar as capturas de `05-evidence/` com as imagens de design que o utilizador vai fornecer; corrigir diferenças verificadas.
- [ ] Verificar zoom/texto ampliado e leitor de ecrã nas plataformas-alvo; rever as traduções dos sete idiomas com falantes competentes.
- [ ] Reexecutar os quatro comandos técnicos e os percursos web críticos após qualquer correção.
- [ ] Só depois fazer commit, push e confirmar o deploy Vercel, incluindo URL e revisão publicada.

**Nota:** o pedido anterior de commit/push/deploy continua pendente. Não seria honesto fazer deploy e declarar a Camille 2.0 estável com estes bloqueadores abertos.
