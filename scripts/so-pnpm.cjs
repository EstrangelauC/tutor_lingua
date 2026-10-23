// Impede `npm install` / `yarn` neste monorepo: o npm não percebe `workspace:*` e deixa o
// node_modules a meio, e o pnpm passa a achar que está tudo instalado. Corre no preinstall.
const agent = process.env.npm_config_user_agent ?? "";
if (!agent.startsWith("pnpm/")) {
  console.error(
    "\nEste repositório usa pnpm. Corre `corepack enable` e depois `pnpm install`.\n" +
      `(gestor detetado: ${agent.split(" ")[0] || "desconhecido"})\n`,
  );
  process.exit(1);
}
