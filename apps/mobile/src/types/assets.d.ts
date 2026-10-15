// Assets de som importados como módulos (o Metro devolve o id do asset).
declare module "*.wav" {
  const source: number;
  export default source;
}
