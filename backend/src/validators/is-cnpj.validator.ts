import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

@ValidatorConstraint({ name: "isCnpj", async: false })
export class IsCnpjConstraint implements ValidatorConstraintInterface {
  validate(cnpj: string, args: ValidationArguments) {
    // 1. Verificação básica de tipo
    if (typeof cnpj !== "string") {
      return false;
    }

    // 2. Limpa o CNPJ (remove pontos, traços e barras), deixando apenas números
    const cnpjLimpo = cnpj.replace(/[^\d]+/g, "");

    // 3. Verifica o tamanho (deve ter 14 dígitos)
    if (cnpjLimpo.length !== 14) {
      return false;
    }

    // 4. Verifica se todos os dígitos são iguais (ex: 00000000000000)
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
      return false;
    }

    // 5. Validação dos dígitos verificadores
    // Separa os números para cálculo
    const tamanho = cnpjLimpo.length - 2;
    const numeros = cnpjLimpo.substring(0, tamanho);
    const digitos = cnpjLimpo.substring(tamanho);

    // --- Cálculo do 1º Dígito Verificador ---
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado !== parseInt(digitos.charAt(0))) {
      return false;
    }

    // --- Cálculo do 2º Dígito Verificador ---
    // Inclui o primeiro dígito verificador no cálculo
    const tamanhoComDigito = tamanho + 1;
    const numerosComDigito = cnpjLimpo.substring(0, tamanhoComDigito);

    soma = 0;
    pos = tamanhoComDigito - 7;

    for (let i = tamanhoComDigito; i >= 1; i--) {
      soma += parseInt(numerosComDigito.charAt(tamanhoComDigito - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado !== parseInt(digitos.charAt(1))) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "CNPJ inválido.";
  }
}

export function IsCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCnpjConstraint,
    });
  };
}
