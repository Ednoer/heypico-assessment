import axios, { AxiosError } from 'axios';

export interface DeepSeekServiceConfig {
  apiKey: string;
  apiUrl?: string;
  maxRetries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
}

export class DeepSeekService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly timeoutMs: number;

  constructor(config?: Partial<DeepSeekServiceConfig>) {
    this.apiKey = config?.apiKey || process.env.DEEPSEEK_API_KEY || '';
    this.apiUrl = config?.apiUrl || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    this.maxRetries = config?.maxRetries ?? 3;
    this.baseDelayMs = config?.baseDelayMs ?? 1000;
    this.timeoutMs = config?.timeoutMs ?? 30000;
  }

  async complete(prompt: string, retryCount = 0): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY belum dikonfigurasi');
    }
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: this.timeoutMs,
        }
      );
      return response.data.choices?.[0]?.message?.content ?? '';
    } catch (err) {
      const error = err as AxiosError<any> & { code?: string };
      const status = error.response?.status;
      const message = (error.response?.data as any)?.error?.message || error.message;

      const shouldRetry = () => {
        if (retryCount >= this.maxRetries) return false;
        if (status === 429) return true;
        if (status && status >= 500) return true;
        if (error.code === 'ECONNABORTED' || message?.includes('timeout')) return true;
        if (!status) return true; // network type errors
        return false;
      };

      if (status === 400 && message?.toLowerCase().includes('too long')) {
        throw new Error('Konten terlalu panjang untuk diproses. Pertimbangkan lakukan chunking.');
      }
      if (status === 401) {
        throw new Error('API key DeepSeek tidak valid atau expired.');
      }

      if (shouldRetry()) {
        const delay = this.baseDelayMs * Math.pow(2, retryCount);
        await new Promise((r) => setTimeout(r, delay));
        return this.complete(prompt, retryCount + 1);
      }
      throw new Error(`Gagal memanggil DeepSeek: ${status ?? 'network'} - ${message}`);
    }
  }
}


