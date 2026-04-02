import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(__dirname, '../../config.json');

export interface ApiConfig {
  anthropicApiKey?: string;
  openaiApiKey?: string;
  defaultProvider: 'anthropic' | 'openai';
  modelPreference: string;
  language: 'zh' | 'en';
}

const DEFAULT_CONFIG: ApiConfig = {
  defaultProvider: 'anthropic',
  modelPreference: 'claude-3-5-sonnet-20241022',
  language: 'zh'
};

export function getConfig(): ApiConfig {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error reading config:', e);
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: Partial<ApiConfig>): ApiConfig {
  const current = getConfig();
  const updated = { ...current, ...config };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}
