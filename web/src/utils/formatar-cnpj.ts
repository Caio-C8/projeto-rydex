export function formatarCnpj(cnpj: string): string {
  const inicio = cnpj.slice(0, 2);
  const fim = cnpj.slice(-2);

  return `${inicio}.***.***/****-${fim}`;
}
