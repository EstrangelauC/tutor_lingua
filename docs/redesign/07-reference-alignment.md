# Alinhamento visual com as referências de 23/10/2026

Foram inspecionadas as quatro capturas no Desktop (`11.51.30`, `11.51.56`, `11.52.08` e `11.52.20`). São conceitos de produtos diferentes, não um conjunto único de ecrãs da Camille. Adotámos os padrões visuais comuns sem copiar conteúdos ou indicadores fictícios:

- Sidebar azul com marca, destino ativo bem visível e objetivo TCF IRN contextual no desktop.
- Fundo claro, cartões brancos com mais espaço e grelhas responsivas em vez da antiga coluna estreita.
- Destaque azul para a ação principal e para o objetivo; cartões de tarefas numerados.
- No mobile, mantém-se a barra inferior, sem apresentar a sidebar em simultâneo.
- Percentagens, sequências de dias, pontos, cursos e calendário das referências **não** foram incluídos: a Camille não possui esses dados.

## Verificação local

- Percurso: inspecionado no Chromium a 390, 1024 e 1440 px, em tema claro; a 1440 px também em tema escuro.
- Praticar e Progressão sem histórico: inspecionados a 1440 px no Chromium.
- Definições em árabe: RTL inspecionado a 390 e 1440 px, sem scroll horizontal do documento.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` (70 testes) e `pnpm build:web` passaram após as correções.
- As quatro rotas mantêm os rótulos traduzidos e as tarefas continuam a usar os identificadores existentes da API.
- A comparação é de direção visual, não uma correspondência pixel a pixel: as imagens originais incluem ilustrações, fotografias e funcionalidades que não pertencem à Camille.

Validação em Safari, Firefox, iOS e Android continua pendente. Ver também [checklist de lançamento](06-release-checklist.md).
