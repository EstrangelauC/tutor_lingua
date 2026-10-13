# Prompt para o Claude Design

```
Cria o design de uma app web mobile-first (responsiva até desktop) chamada provisoriamente "Camille – Oral TCF IRN": um tutor de francês por voz com IA que prepara candidatos para a prova oral do TCF IRN (níveis A2 e B1).

CONCEITO
O utilizador fala em voz alta com "Camille", uma examinadora virtual bienveillante. A conversa é 100 % oral em francês; no fim, a Camille dá um feedback escrito na língua de apoio do utilizador. O tom visual deve ser calmo, encorajador e sério ao mesmo tempo — uma sala de exame acolhedora, não um jogo infantil.

MULTILÍNGUE (requisito central)
- Duas línguas distintas: a língua da interface e a língua de apoio (usada no feedback). Por defeito são iguais, mas configuráveis separadamente.
- Línguas de interface iniciais: português (PT-PT), inglês, espanhol, árabe, ucraniano, turco, romeno. Prevê que mais línguas sejam adicionadas.
- Suporte completo a RTL (árabe): layout espelhado, ícones direcionais invertidos.
- Componentes preparados para expansão de texto (+40 %) sem quebrar: nada de larguras fixas em botões ou etiquetas.
- Seletor de língua acessível a partir do onboarding e das definições, com o nome de cada língua na própria língua.
- O conteúdo da conversa com a Camille fica sempre em francês, independentemente da interface.

ECRÃS A DESENHAR
1. Boas-vindas / onboarding (3 passos): escolher língua da interface e de apoio → escolher nível alvo (A2 ou B1, com uma frase a explicar cada um) → pedir autorização do microfone com explicação clara.
2. Início: cartão "Continuar a praticar", escolha da tarefa em três cartões — Entretien (apresentar-se), Interaction (pedir informações / simular uma situação), Point de vue (dar e defender uma opinião) — e acesso ao histórico.
3. Sessão de voz (ecrã principal): avatar ou ilustração abstrata da Camille; estados visuais distintos para "a Camille fala", "a ouvir-te", "a pensar"; grande botão de microfone (premir para falar e modo mãos-livres); onda sonora animada; indicador discreto de progresso (cerca de 8 trocas); botão "Terminer" sempre visível; opção para mostrar/ocultar a transcrição da conversa. Sem correções durante o exercício.
4. Feedback (na língua de apoio): estimativa do nível atingido (A1/A2/B1) com visualização simples; os 3 erros mais importantes, cada um com "o que disseste" vs "forma correta" (o francês destacado); 1 conselho concreto para a próxima sessão; botões "Repetir esta tarefa" e "Nova tarefa".
5. Histórico e progresso: lista de sessões passadas (data, tarefa, nível estimado) e uma evolução simples ao longo do tempo.
6. Definições: línguas, nível alvo, velocidade de voz da Camille, modo do microfone, tema claro/escuro.

ESTADOS E CASOS LIMITE
Microfone recusado, sem ligação, a Camille não percebeu (reformula), primeira sessão sem histórico, carregamento entre trocas.

DIREÇÃO VISUAL
- Paleta suave com uma cor de destaque inspirada no azul francês, sem cair no cliché bandeira/Torre Eiffel.
- Tipografia muito legível, com bom suporte a caracteres latinos, árabes e cirílicos.
- Alvos de toque grandes (mín. 48 px), uso confortável com uma mão, contraste AA.
- Modo claro e escuro.
- Microinterações suaves no microfone e nas transições de estado da voz.

ENTREGA
Desenha primeiro em largura de telemóvel (390 px) e mostra também a versão desktop do ecrã de sessão e do feedback. Apresenta o ecrã de sessão e o de feedback em português e em árabe lado a lado para validar o i18n e o RTL.
```
