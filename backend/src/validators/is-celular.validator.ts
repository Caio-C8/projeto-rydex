import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

const dddsValidos = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 64, 63,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
];

@ValidatorConstraint({ name: "isCelular", async: false })
export class IsCelularConstraint implements ValidatorConstraintInterface {
  validate(telefone: string, args: ValidationArguments) {
    if (typeof telefone !== "string") {
      return false;
    }

    // 1. Verifica se o número possui exatamente 11 dígitos.
    if (telefone.length !== 11) {
      return false;
    }

    // 2. Verifica se o terceiro dígito é '9', indicando um número de celular.
    if (telefone[2] !== "9") {
      return false;
    }

    // 3. Verifica se todos os dígitos são iguais (ex: 11911111111)
    if (/^(\d)\1{10}$/.test(telefone)) {
      return false;
    }

    // 4. Verifica se os últimos 8 dígitos não são todos iguais (ex: 11988888888)
    const parteNumero = telefone.substring(3);
    if (/^(\d)\1{7,}$/.test(parteNumero)) {
      return false;
    }

    // 5. Extrai o DDD e verifica se é válido.
    const ddd = parseInt(telefone.substring(0, 2), 10);
    if (!dddsValidos.includes(ddd)) {
      return false;
    }

    // 6. Se todas as verificações passaram, o número de celular é válido.
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "Número de celular inválido.";
  }
}

export function IsCelular(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCelularConstraint,
    });
  };
}
