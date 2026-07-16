import axios from 'axios';

interface ApiErrorPayload {
  message?: string;
  mensagem?: string;
  error?: string;
  erro?: string;
}

function normalizeMessage(message: string): string {
  return message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function hasNotFoundMessage(messages: string[]): boolean {
  return messages.some((message) => {
    const normalized = normalizeMessage(message);
    return normalized.includes('not found') || normalized.includes('nao encontrado');
  });
}

function getErrorMessages(error: unknown): string[] {
  if (axios.isAxiosError<ApiErrorPayload | string>(error)) {
    const data = error.response?.data;
    const messages = [error.message];

    if (typeof data === 'string' && data.trim()) {
      messages.push(data);
    }

    if (data && typeof data === 'object') {
      const apiMessages = [data.message, data.mensagem, data.error, data.erro];
      messages.push(...apiMessages.filter((message): message is string => Boolean(message)));
    }

    return messages;
  }

  return error instanceof Error ? [error.message] : [];
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorPayload | string>(error)) {
    return 'Não foi possível concluir a ação. Tente novamente.';
  }

  const status = error.response?.status;
  const data = error.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    const message = data.message ?? data.mensagem ?? data.error ?? data.erro;

    if (message) {
      return message;
    }
  }

  if (status === 400) {
    return 'Revise os dados informados e tente novamente.';
  }

  if (status === 401) {
    return 'Sua sessão não está ativa. Faça login novamente.';
  }

  if (status === 403) {
    return 'Você não tem permissão para executar esta ação.';
  }

  if (status === 404) {
    return 'Nenhum registro foi encontrado para esta busca.';
  }

  if (status && status >= 500) {
    return 'A API está indisponível no momento. Tente novamente em instantes.';
  }

  return 'Não foi possível concluir a ação. Tente novamente.';
}

export function isNotFoundError(error: unknown): boolean {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return true;
  }

  return hasNotFoundMessage(getErrorMessages(error));
}

export function isServerError(error: unknown): boolean {
  return axios.isAxiosError(error) && Boolean(error.response?.status && error.response.status >= 500);
}
