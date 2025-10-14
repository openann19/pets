import { createDeepSeekService } from '../deepSeekService';

declare const global: unknown;

describe('DeepSeekService', () => {
  const apiKey = 'test-key';

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('analyzePetPhoto calls API and returns response', async () => {
    const mockResponse = {
      id: 'r1',
      object: 'chat.completion',
      created: Date.now(),
      model: 'deepseek-vision',
      choices: [
        { index: 0, message: { role: 'assistant', content: '{"species":"dog"}' }, finish_reason: 'stop' },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

    const svc = createDeepSeekService({ apiKey });
    const res = await svc.analyzePetPhoto('BASE64');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: `Bearer ${apiKey}` }),
      })
    );
    expect(res.choices[0].message.content).toContain('species');
  });

  test('analyzePetPhoto throws on API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Bad request', type: 'bad', code: '400' } }),
    });

    const svc = createDeepSeekService({ apiKey });

    await expect(svc.analyzePetPhoto('BASE64')).rejects.toThrow('DeepSeek API Error: Bad request');
  });

  test('testConnection returns boolean based on API result', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{}, {}] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: { message: 'x', type: 'y', code: 'z' } }) });

    const svc = createDeepSeekService({ apiKey });

    await expect(svc.testConnection()).resolves.toBe(true);
    await expect(svc.testConnection()).resolves.toBe(false);
  });
});
