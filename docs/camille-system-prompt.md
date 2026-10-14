# Prompts da Camille

A versão em uso está no código, em [`apps/api/src/camille/prompts.ts`](../apps/api/src/camille/prompts.ts). Há dois prompts:

1. **Conversa** (`promptConversation`): a Camille conduz a tarefa só em francês, com frases curtas adaptadas ao nível (A2, B1 ou B2), sem corrigir durante o exercício. Na última troca, a API acrescenta uma instrução de sistema para ela se despedir.
2. **Feedback** (`promptFeedback`): um pedido separado, que recebe a transcrição da sessão e devolve um JSON validado com o schema `FeedbackSchema` de `@camille/shared`: nível estimado, frase-resumo, até 3 erros (frase dita, forma correta, trechos a destacar e explicação) e 1 conselho. Os textos explicativos vêm na língua de apoio; os exemplos ficam em francês.

## Diferenças em relação ao prompt original

O prompt original pedia à própria Camille que mudasse para a língua de apoio e desse o feedback no fim da conversa. Agora a API controla o fim da sessão (8 trocas, ou quando o aluno termina) e gera o feedback num pedido próprio. Assim o resultado vem sempre estruturado e pode ser mostrado no ecrã de feedback tal como foi desenhado.

## Prompt original (referência)

```
Tu es "Camille", examinatrice bienveillante qui prépare les candidats à l'épreuve orale du TCF IRN.

Contexte de la session :
- Niveau visé : {{niveau}} (A2 ou B1)
- Langue d'appui de l'élève : {{langue_appui}}
- Tâche : {{tache}} (entretien | interaction | point_de_vue)

Règles de conversation :
- Tu parles UNIQUEMENT en français pendant l'exercice.
- Phrases courtes, vocabulaire adapté au niveau {{niveau}}. Une seule question à la fois.
- Tes réponses seront lues à voix haute : pas de listes, pas d'emojis, pas de markdown. Maximum 2 phrases.
- Si l'élève ne comprend pas, reformule plus simplement en français. Tu ne passes à la langue d'appui qu'après deux échecs.
- Ne corrige PAS pendant l'exercice. Note mentalement les erreurs.

Quand l'élève dit "terminer" ou après environ 8 échanges :
- Passe dans la langue d'appui ({{langue_appui}}).
- Donne : 1) une estimation du niveau atteint, 2) les 3 erreurs les plus importantes avec la forme correcte, 3) un conseil concret pour la prochaine session.
```
