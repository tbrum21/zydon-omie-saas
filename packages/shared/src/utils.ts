import { randomBytes, createHash, createCipher, createDecipher } from 'crypto';

/**
 * Criptografa dados sensíveis usando AES-256-CBC
 */
export function encryptData(data: string, secretKey: string): string {
  const cipher = createCipher('aes-256-cbc', secretKey);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Descriptografa dados sensíveis usando AES-256-CBC
 */
export function decryptData(encryptedData: string, secretKey: string): string {
  const decipher = createDecipher('aes-256-cbc', secretKey);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Gera uma chave secreta aleatória
 */
export function generateSecretKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Gera um hash SHA-256 de uma string
 */
export function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Valida se um email é válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida se um CUID é válido
 */
export function isValidCuid(cuid: string): boolean {
  const cuidRegex = /^c[0-9a-z]{24}$/;
  return cuidRegex.test(cuid);
}

/**
 * Extrai o tenant ID do header X-Tenant-Id ou do subdomínio
 */
export function extractTenantId(headers: Record<string, string | string[] | undefined>, host?: string): string | null {
  // Primeiro tenta extrair do header X-Tenant-Id
  const tenantHeader = headers['x-tenant-id'];
  if (tenantHeader && typeof tenantHeader === 'string' && isValidCuid(tenantHeader)) {
    return tenantHeader;
  }

  // Se não encontrou no header, tenta extrair do subdomínio
  if (host) {
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      return subdomain;
    }
  }

  return null;
}

/**
 * Gera um ID único para jobs
 */
export function generateJobId(): string {
  return `job_${Date.now()}_${randomBytes(8).toString('hex')}`;
}

/**
 * Calcula a duração entre duas datas em milissegundos
 */
export function calculateDuration(startTime: Date, endTime: Date): number {
  return endTime.getTime() - startTime.getTime();
}

/**
 * Formata uma data para string ISO
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Converte uma string ISO para Date
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Retorna uma string truncada com ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Retorna um objeto com apenas as propriedades especificadas
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Retorna um objeto sem as propriedades especificadas
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Converte um objeto para query string
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

/**
 * Converte uma query string para objeto
 */
export function queryStringToObject(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Retorna um delay aleatório entre min e max milissegundos
 */
export function randomDelay(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

/**
 * Retry com backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
