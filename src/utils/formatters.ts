export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function maskCpf(cpf?: string): string {
  const digits = onlyDigits(cpf ?? '');

  if (digits.length !== 11) {
    return cpf || 'Não informado';
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function calculateCpfDigit(digits: string): number {
  let sum = 0;
  const weightStart = digits.length + 1;

  for (let index = 0; index < digits.length; index += 1) {
    sum += Number(digits[index]) * (weightStart - index);
  }

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(cpf: string): boolean {
  const digits = onlyDigits(cpf);

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  return calculateCpfDigit(digits.slice(0, 9)) === Number(digits[9]) && calculateCpfDigit(digits.slice(0, 10)) === Number(digits[10]);
}

export function generateValidCpf(): string {
  while (true) {
    const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
    let cpf = `${base}${calculateCpfDigit(base)}`;
    cpf = `${cpf}${calculateCpfDigit(cpf)}`;

    if (isValidCpf(cpf)) {
      return cpf;
    }
  }
}

export function getCpfForApi(cpf: string): string {
  const digits = onlyDigits(cpf);
  return isValidCpf(digits) ? digits : generateValidCpf();
}

export function formatCurrency(value?: number | null): string {
  if (typeof value !== 'number') {
    return 'Não informado';
  }

  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(value);
}

export function formatDate(value?: string): string {
  if (!value) {
    return 'Não informada';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}
