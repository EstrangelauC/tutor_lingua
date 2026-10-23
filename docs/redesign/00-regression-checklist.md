# Camille — checklist de regressão para a Fase 1

Baseline de 22/10/2026. Relaciona-se com [auditoria](00-audit.md) e [inventário F01–F30](00-functional-inventory.md).

Uma caixa por marcar significa **pendente**, não falha confirmada. As verificações assinaladas só comprovam o âmbito descrito. Usar dados de teste e registar plataforma, versão, resultado e evidência ao repetir.

## Gate 0 — baseline e escopo

- [x] Estrutura, rotas, contratos, armazenamento e dependências identificados.
- [x] Alterações locais preexistentes identificadas e preservadas.
- [x] Nenhuma modificação funcional, de áudio, contratos ou avaliação durante a auditoria.
- [x] Capturas web em 390×844 e 1440×900 recolhidas; não equivalem a captura nativa.
- [ ] Antes da implementação: congelar/versionar a árvore local auditada, incluindo ficheiros ainda não versionados.
- [ ] Por cada alteração: identificar os IDs funcionais afetados e os consumidores dos componentes; não apagar componentes sem esse levantamento.

## Gate 1 — verificação automatizada

- [x] `pnpm typecheck`: passa; confirmado sem cache via comando combinado.
- [x] `pnpm lint`: passa; confirmado sem cache via comando combinado.
- [x] `pnpm test`: 60 testes passam em execuções novas combinadas (25 mobile, 11 shared, 24 API).
- [x] Registada a falha ambiental inicial: API sem permissão de listen, 14 testes cancelados; repetição com permissão local passa 24/24.
- [x] `pnpm build:web`: export real de 11 rotas bem-sucedido.
- [x] `pnpm build`: shared/API com sucesso via cache (verificação adicional).
- [ ] Após cada lote de redesign: repetir os quatro comandos obrigatórios e guardar saída, exit code e uso de cache.
- [ ] Antes de publicação: validar no Node 22 da CI e executar `pnpm format:check` e o job Docker existentes.
- [ ] Adicionar testes de fluxo para navegação/sessão antes de substituir a sua estrutura: testes existentes não montam React nem áudio.

Logs de referência: [execução sem cache](evidence/checks-fresh.log), [API com servidor local](evidence/api-test-local.log), [export web](evidence/build-web.log). Não há relatório percentual de cobertura nem script de cobertura existente.

## Gate 2 — matriz de plataformas e apresentação

| Dimensão           | Mínimo de aceitação do redesign                                             | Estado do baseline                                    |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| Web estreita/larga | 390×844, 1440×900; também 320 px e transição 899/900 px                     | Capturas nas duas primeiras larguras                  |
| iOS e Android      | Um dispositivo ou simulador por SO; áudio real num aparelho                 | Pendente                                              |
| Idiomas            | pt-PT, en, es, ar, uk, tr, ro; strings longas sem truncar ações             | Dicionários testados; UI PT/AR observada              |
| Direção            | Árabe RTL, conversa francesa LTR; apoio e interface com direções diferentes | Árabe/escuro web capturado; matriz completa pendente  |
| Temas              | Claro, escuro, sistema; alternar e reabrir                                  | Claro/escuro observados; sistema/reabertura pendentes |
| Acessibilidade     | Teclado, zoom 200%, fonte ampliada, VoiceOver/TalkBack, movimento reduzido  | Inspeção apenas; lacunas documentadas                 |
| Rede/estado        | Offline, 503, 429, timeout, sessão expirada, carregamento longo             | Backend testado; 503/retry na UI sintéticos           |

## Gate 3 — onboarding e navegação (F01–F05, F20, F25)

- [x] Em browser de teste, instalação nova abre passo 1; percorridos passos 2 e 3 e «Agora não» abre início.
- [ ] Validar voltar entre passos sem perder escolhas, línguas independentes, A2/B1/B2 e permissão aceite/recusada.
- [ ] Reabrir após onboarding não o repete; dados antigos/JSON inválido/campos incompletos recuperam conforme defaults.
- [ ] Abrir cada tab por toque e teclado; rota e estado selecionado corretos, safe area sem sobreposição.
- [ ] Cada tarefa inicia sessão com os parâmetros corretos; parâmetro inválido cai em Entretien.
- [ ] Back do browser, back/gesto nativo, deep link de feedback válido/inválido e refresh têm saída compreensível.
- [ ] Terminar sem respostas sai sem criar histórico; terminar com respostas guarda resultado antes de navegar.
- [ ] Repetir tarefa/nova tarefa/retomar não duplicam sessões nem sugerem recuperação de conversa perdida.
- [ ] Redimensionar através de 900 px não reinicia a sessão nem perde rascunho/estado.

## Gate 4 — sessão, voz e texto (F06–F18)

- [x] Retry após 503, início Entretien, resposta escrita e conclusão precoce observados com HTTP sintético no browser.
- [ ] Percorrer oito respostas em cada tarefa e verificar contagem, progresso, fala final e bloqueio de novo envio.
- [ ] A2/B1/B2 e apoio selecionado chegam à criação; conversa e TTS permanecem franceses.
- [ ] TTS automático/replay/exemplo/correção nas três velocidades; sem sobreposição de falas.
- [ ] Pressionar, segurar e soltar grava/envia uma única vez; toque curto, dedo fora, permissão lenta e taps rápidos não bloqueiam nem duplicam.
- [ ] Mãos-livres abre apenas no momento previsto após TTS; bip/vibração respeitam preferência; silêncio após fala envia uma vez.
- [ ] Sem metering, utilizador consegue enviar manualmente; limite de 90 s funciona; silêncio completo não cria conversa falsa.
- [ ] Permissão recusada mantém alternativa textual; abrir definições funciona no nativo; indisponibilidade de hardware tem recuperação.
- [ ] Alternar voz/texto durante gravação cancela sem enviar; texto vazio bloqueado; limite 2000; falha repõe rascunho.
- [ ] Espaço funciona fora de campos, não interfere com escrita, não repete envio e não deixa micro aberto ao perder foco.
- [ ] Transcrição mobile alterna sem perder réplicas; desktop cumpre a decisão de visibilidade da Fase 1 (hoje não permite ocultar).
- [ ] Francês e texto introduzido ficam LTR em interface árabe; teclado virtual não tapa campo/enviar.
- [ ] Sair durante gravação, TTS, criação, envio e polling: nenhum callback tardio volta a falar/abrir micro; sem upload involuntário.
- [ ] Background/foreground, auriculares, interrupção de áudio e retorno ao ecrã não deixam modo de áudio ou gravação presos.
- [ ] Falha de prepare/record/stop/upload/TTS apresenta recuperação utilizável. Estes pontos não estão cobertos pela suite atual.

## Gate 5 — feedback, histórico e persistência (F19–F28)

- [x] UI com feedback sintético mostrou nível, correção destacada, conselho; nova tarefa → histórico exibiu 1 sessão, 1 min e ponto no gráfico.
- [ ] Validar feedback sem erros e com três erros; frases extensas; excerto ausente; A1 abaixo do objetivo; idioma de apoio diferente da interface.
- [ ] Ouvir forma correta e sair interrompe fala; botões repetir/nova tarefa/voltar acessíveis.
- [ ] ID ausente ou apagado mostra fallback e caminho de retorno, sem crash.
- [ ] Reabrir a app conserva preferências e resultado; reavaliar mesmo ID não duplica entrada.
- [ ] Histórico vazio e filtros sem resultados têm ações úteis; filtros por cada tarefa não alteram totais/gráfico globais.
- [ ] Gráfico com 0, 1, 10 e mais de 10 sessões; ordem cronológica, direção RTL, alvo e label acessível corretos.
- [ ] Limite 100 e descarte de entradas inválidas não quebram a UI; estatísticas correspondem ao histórico retido.
- [ ] Apagar/cancelar histórico em dados de teste atualiza início/gráfico/lista, mantém preferências e persiste após reload.
- [ ] Armazenamento bloqueado/cheio não impede uso; registar que perda de persistência atualmente não é comunicada.

## Gate 6 — loading e recuperação (F17, F29–F30)

- [x] 503 sintético mostrou três tentativas e erro traduzido; retry bem-sucedido voltou a permitir interação.
- [ ] Arranque lento mostra tentativa, sem ações duplicadas; não remover a proteção de envio/terminar ocupado.
- [ ] Offline, timeout, 401/403, 404, 409, 413/415/422, 429, 503 e resposta inválida apresentam o código/mensagem adequados.
- [ ] Timeout com servidor já avançado recupera via GET sem duplicar fala, resposta ou contagem.
- [ ] GET ainda ocupado mantém recuperação; falha/limite esgotado deixa recuperação compreensível; sem polling após saída.
- [ ] Avaliação falhada permite repetir e não grava histórico incompleto; sucesso idempotente não duplica dados.
- [ ] Sessão perdida após restart/expiração permite voltar e começar de novo sem loops.
- [ ] Splash/hidratação, wakeup indisponível e loading prolongado não deixam ecrã inacessível.

## Gate 7 — acessibilidade e idiomas (F03, F26–F27)

- [ ] Sete idiomas em todas as rotas e estados: ausência de chaves/textos vazios, ações visíveis e layout sem overflow.
- [ ] `html.lang/dir`, direção nativa por ecrã, ícones e cronologia do gráfico corretos; francês sempre LTR.
- [ ] Mudança de idioma não altera tarefa ativa ou histórico; feedback antigo usa língua registada.
- [ ] Contraste medido nos dois temas para texto, foco, gráficos, estados desativados e feedback.
- [ ] Labels mantidos durante loading; estados busy/disabled/checked/expanded expostos; ordem de foco coerente.
- [ ] Leitores anunciam progresso, erros e estados sem repetição excessiva; alternativa textual totalmente operável.
- [ ] Alvos de toque, fonte ampliada e zoom não cortam texto; corrigir conscientemente a lacuna do botão de correção de 36 px.
- [ ] Movimento reduzido e scroll animado têm comportamento definido (lacuna atual); não intensificar animações sem esse suporte.

## Gate de saída da Fase 1

- [ ] Todos os itens aplicáveis aos ficheiros alterados foram executados; pendências têm responsável, impacto e motivo.
- [ ] Comparação com capturas do baseline nos mesmos viewports/idioma/tema, com dados sintéticos identificados.
- [ ] Contratos, schemas, prompts e lógica de áudio preservados; diffs revistos para alterações acidentais.
- [ ] Testes e export passam após a última alteração; cobertura adicional verifica comportamentos, não apenas snapshots.
- [ ] Fluxo de voz validado em aparelho e navegador real antes de aprovação para publicação.

Registo recomendado por execução:

| Data / versão         | ID F/R | Plataforma / idioma / tema | Passos e resultado esperado | Resultado observado | Evidência / responsável |
| --------------------- | ------ | -------------------------- | --------------------------- | ------------------- | ----------------------- |
| A preencher na Fase 1 |        |                            |                             |                     |                         |
