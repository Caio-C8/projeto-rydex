export const normalizarDinheiro = (valorEmCentavos: number): string => {
  const valorEmReais = valorEmCentavos / 100;

  const formatador = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return formatador.format(valorEmReais);
};
