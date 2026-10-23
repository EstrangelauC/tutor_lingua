# Navegação e Percurso de Aprendizagem

## 🗺️ Estrutura de Navegação

A navegação foi reestruturada para centrar a experiência no percurso de preparação ao TCF IRN, eliminando distrações e focando no progresso do aluno.

### Destinos Principais

1. **Percurso (Dashboard)**: O ponto central de partida. Apresenta o objetivo, a recomendação da próxima tarefa e o resumo da última atividade.
2. **Praticar**: Acesso direto às três tarefas da prova (Entretien, Interaction, Point de vue), com a indicação do último resultado obtido em cada uma.
3. **Progressão**: Histórico detalhado de todas as sessões e a evolução do nível estimado.
4. **Definições**: Configurações de interface, língua de apoio e nível alvo.

### Adaptação por Plataforma

- **Mobile**: Barra inferior (Bottom Tab Bar) com 4 separadores. Ícones minimalistas e rótulos claros.
- **Desktop**: Sidebar lateral esquerda. Inclui a marca "Camille" e a informação contextual do nível alvo, otimizando o espaço horizontal.

## 🚀 Regra de Recomendação de Prática

Para guiar o aluno de forma determinística, implementámos a seguinte lógica de recomendação no ficheiro `src/session/recommendation.ts`:

1. **Ausência de Histórico**: Se o aluno nunca praticou, a recomendação é sempre **Entretien** (ponto de partida natural).
2. **Cobertura de Tarefas**: Se existem tarefas que nunca foram praticadas, a recomendação segue a ordem de prioridade: `Entretien` $\to$ `Interaction` $\to$ `Point de vue`.
3. **Otimização de Nível**: Se todas as tarefas foram praticadas, a aplicação identifica a tarefa com o **menor nível estimado** em relação ao nível alvo.
4. **Resolução de Empates**: Em caso de empate no nível mais baixo, aplica-se a mesma ordem de prioridade (`Entretien` $\to$ `Interaction` $\to$ `Point de vue`).

## 🛠️ Implementação Técnica

- **Arquitetura**: Utilização de `expo-router` com um layout condicional em `(onglets)/_layout.tsx` para alternar entre a Sidebar (Desktop) e a TabBar (Mobile).
- **I18n**: Atualização de todos os rótulos de navegação nos 7 idiomas suportados, preservando o suporte a RTL.
- **Fluxo de Sessão**: As rotas de `/session` e `/feedback` foram removidas dos separadores principais, funcionando agora como fluxos modais/sobrepostos ao percurso.

## ✅ Critérios de Aceitação

- [x] Navegação principal com 4 destinos.
- [x] Sidebar no Desktop / TabBar no Mobile.
- [x] Dashboard de Percurso com recomendação determinística.
- [x] Página de Prática com as 3 tarefas TCF.
- [x] Internacinalização completa.
- [x] Testes de recomendação implementados e validados.
