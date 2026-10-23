# Camille 2.0 Design System

## 🎯 Visão Geral

A identidade visual 2.0 da Camille foi concebida para transmitir **credibilidade académica**, **profissionalismo** e **clareza**. O objetivo é criar um ambiente que favoreça a concentração e a progressão educativa, afastando-se de estéticas infantis ou gamificação excessiva.

## 🎨 Paleta de Cores

### Modo Claro (Academic Light)

| Token              | Valor     | Uso                                     |
| :----------------- | :-------- | :-------------------------------------- |
| **Primary Navy**   | `#142D4E` | Identidade principal, botões primários  |
| **Academic Blue**  | `#2459A6` | Ações secundárias, destaques académicos |
| **Background**     | `#F6F8FC` | Fundo da aplicação                      |
| **Surface**        | `#FFFFFF` | Cartões, inputs, áreas de conteúdo      |
| **Primary Text**   | `#17243A` | Títulos e texto principal               |
| **Secondary Text** | `#56657B` | Descrições e texto secundário           |
| **Border**         | `#E2E8F0` | Linhas divisórias e bordas de controlos |
| **Success**        | `#13725E` | Feedback positivo e conclusão           |
| **Warning**        | `#875911` | Alertas e estados de atenção            |
| **Error**          | `#B5303C` | Erros críticos e alertas                |

### Modo Escuro (Academic Dark)

| Token               | Valor     | Uso                              |
| :------------------ | :-------- | :------------------------------- |
| **Deep Navy**       | `#101A29` | Fundo da aplicação               |
| **Navy Surface**    | `#17253A` | Superfícies e cartões            |
| **Off-White**       | `#EDF2FA` | Texto principal                  |
| **Muted Blue-Gray** | `#B8C5D8` | Texto secundário                 |
| **Navy Border**     | `#33465F` | Linhas e bordas                  |
| **Contrast Navy**   | `#C0D5F2` | Identidade principal (contraste) |
| **Vibrant Blue**    | `#9CC3FF` | Ações secundárias e destaques    |

Os valores acima refletem a paleta efetivamente usada em `apps/mobile/src/theme/palettes.ts`, ajustada para contraste WCAG AA. `tokens.ts` contém apenas escalas de espaço, raio, borda, larguras e breakpoints; não existe uma segunda paleta.

## ✍️ Tipografia

A hierarquia foi desenhada para legibilidade máxima em dispositivos móveis e desktop, com suporte nativo a alfabetos latino, árabe e cirílico.

| Variante        | Tamanho | Peso  | Uso                  |
| :-------------- | :------ | :---- | :------------------- |
| **Page**        | 32px    | 800   | Títulos de páginas   |
| **Section**     | 20px    | 600   | Títulos de secções   |
| **Body**        | 17px    | 400   | Texto principal      |
| **Description** | 15px    | 400   | Textos de apoio      |
| **Label**       | 14px    | 600   | Rótulos e botões     |
| **Meta**        | 13px    | 400   | Metadados e legendas |
| **Result**      | 56px    | 800   | Níveis e pontuações  |
| **French**      | 19px    | Serif | Conteúdo em francês  |

## 🧱 Componentes Core

### Estrutura

- **`Ecran`**: Container raiz com gestão de `SafeAreaView`.
- **`Section`**: Agrupador com `SectionHeader`.
- **`AcademicCard`**: Superfície elevada para conteúdo organizado.

### Interação

- **`Bouton`**: Variantes `principal`, `secondaire`, `danger` e `fantome`. Touch target $\ge$ 48px.
- **`Choix`**: Segmentos, Pílulas e Checkboxes modernizados.

### Feedback e Estado

- **`LevelBadge`**: Indicador de nível profissional.
- **`ProgressIndicator`**: Barra de progresso linear minimalista.
- **`EmptyState`**: Estado de ausência de dados com iconografia.
- **`FeedbackCard`**: Notificações de sistema (Sucesso, Erro, Info).
- **`LoadingState`**: Feedback de processamento discreto.

## 📱 Responsividade e Acessibilidade

- **Breakpoints**: Mobile Compacto $\to$ Mobile Grande $\to$ Tablet $\to$ Desktop.
- **Acessibilidade**: Contraste WCAG AA em ambos os modos.
- **RTL**: Suporte total para direção de texto à direita (Árabe).
