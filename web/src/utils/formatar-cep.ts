export function formatarCep(cep: string): string {
  if (cep.length !== 8) {
    return cep;
  }

  const parte1 = cep.slice(0, 5);
  const parte2 = cep.slice(5);

  return `${parte1}-${parte2}`;
}
