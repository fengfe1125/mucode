import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, AlertCircle } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const [config, setConfig] = useState({
    anthropicApiKey: '',
    openaiApiKey: '',
    defaultProvider: 'anthropic',
    modelPreference: 'claude-3-5-sonnet-20241022',
    language: 'zh' as 'zh' | 'en'
  });
  const [saved, setSaved] = useState(false);

  const t = {
    zh: {
      settings: '设置',
      provider: '服务商',
      defaultProvider: '默认服务商',
      anthropicKey: 'Anthropic API 密钥',
      openaiKey: 'OpenAI API 密钥',
      modelPref: '模型偏好',
      language: '语言',
      save: '保存配置',
      saved: '设置已保存！'
    },
    en: {
      settings: 'Settings',
      provider: 'Providers',
      defaultProvider: 'Default Provider',
      anthropicKey: 'Anthropic API Key',
      openaiKey: 'OpenAI API Key',
      modelPref: 'Model Preference',
      language: 'Language',
      save: 'Save Configuration',
      saved: 'Settings saved!'
    }
  }[config.language || 'zh'];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/config');
      if (res.data) setConfig(res.data);
    } catch (e) {
      console.error('Failed to load config', e);
    }
  };

  const saveConfig = async () => {
    try {
      await axios.post('http://localhost:3001/api/config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save config', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-gray-850 border-r border-gray-700 flex flex-col h-full shrink-0 shadow-lg z-10">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800">
        <h2 className="text-lg font-semibold flex items-center text-gray-100">
          <Settings size={18} className="mr-2" />
          {t.settings}
        </h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6 bg-gray-900">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t.provider}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.language}</label>
            <select
              value={config.language}
              onChange={(e) => setConfig({ ...config, language: e.target.value as any })}
              className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 px-3 text-sm text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="zh">简体中文 (Chinese)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.defaultProvider}</label>
            <select
              value={config.defaultProvider}
              onChange={(e) => setConfig({ ...config, defaultProvider: e.target.value as any })}
              className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 px-3 text-sm text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.anthropicKey}</label>
            <input
              type="password"
              value={config.anthropicApiKey || ''}
              onChange={(e) => setConfig({ ...config, anthropicApiKey: e.target.value })}
              className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 px-3 text-sm text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              placeholder="sk-ant-api03-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.openaiKey}</label>
            <input
              type="password"
              value={config.openaiApiKey || ''}
              onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
              className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 px-3 text-sm text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              placeholder="sk-proj-..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.modelPref}</label>
            <input
              type="text"
              value={config.modelPreference || ''}
              onChange={(e) => setConfig({ ...config, modelPreference: e.target.value })}
              className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 px-3 text-sm text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. claude-3-5-sonnet-20241022"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={saveConfig}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors shadow-sm"
          >
            <Save size={16} className="mr-2" />
            {t.save}
          </button>
          {saved && (
            <p className="text-green-400 text-sm mt-2 text-center flex items-center justify-center">
              <AlertCircle size={14} className="mr-1" />
              {t.saved}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
