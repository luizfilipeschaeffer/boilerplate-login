"use client";
import { useState } from "react";

const REQUIRED_ENVS = [
  { key: "POSTGRES_URL", label: "POSTGRES_URL", desc: "URL de conexão com o banco de dados PostgreSQL. Exemplo: postgres://user:senha@host:5432/db" },
  { key: "DATABASE_URL", label: "DATABASE_URL", desc: "URL de conexão alternativa para o banco de dados (usada por alguns ORMs). Geralmente igual à POSTGRES_URL." },
  { key: "JWT_SECRET", label: "JWT_SECRET", desc: "Chave secreta para assinar e validar tokens JWT. Gere uma string aleatória segura." },
  { key: "RESEND_API_KEY", label: "RESEND_API_KEY", desc: "Chave da API Resend para envio de e-mails. Obtenha em https://resend.com/" },
  { key: "NEXT_PUBLIC_BASE_URL", label: "NEXT_PUBLIC_BASE_URL", desc: "URL base pública da aplicação. Exemplo: https://seu-projeto.vercel.app" },
];

const SETUP_PASSWORD = "WXZp4vE08P0dXMeNngZm864DMP9w2GComy98vVXeXQQJ9PRbSi7P04H9GQ4q3LY4";

type Step = 'auth' | 'env-select' | 'local-form' | 'guide';

export default function EnvSetupPage() {
  const [step, setStep] = useState<Step>('auth');
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [envType, setEnvType] = useState<'local'|'production'|''>('');
  const [form, setForm] = useState(() => Object.fromEntries(REQUIRED_ENVS.map(e => [e.key, ""])));
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password === SETUP_PASSWORD) {
      setStep('env-select');
      setError("");
    } else {
      setError("Senha incorreta!");
    }
  }

  function handleCopyVars() {
    const text = REQUIRED_ENVS.map(e => e.key).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEnvSelect(type: 'local'|'production') {
    setEnvType(type);
    if (type === 'local') {
      setStep('local-form');
    } else {
      setStep('guide');
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/env-setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      setShowRestartModal(true);
    } else {
      setError("Erro ao salvar o .env. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-2">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        {step === 'auth' && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Configuração Inicial</h2>
            <form onSubmit={handleAuth} className="space-y-4" autoComplete="off">
              <div>
                <label className="block mb-1 font-medium">Senha de configuração:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" autoComplete="off" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Entrar</button>
              {error && <div className="text-red-600 text-center mt-2">{error}</div>}
            </form>
          </>
        )}
        {step === 'env-select' && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Qual ambiente você está configurando?</h2>
            <div className="flex flex-col gap-4">
              <button
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                onClick={() => handleEnvSelect('local')}
              >
                Ambiente Local (criar .env automaticamente)
              </button>
              <button
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                onClick={() => handleEnvSelect('production')}
              >
                Produção (Vercel ou outro cloud)
              </button>
            </div>
          </>
        )}
        {step === 'local-form' && (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">Preencha as variáveis para o ambiente local</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4" autoComplete="off">
              {REQUIRED_ENVS.map(env => (
                <div key={env.key}>
                  <label className="block font-mono font-semibold text-blue-700 dark:text-blue-300 mb-1">{env.key}</label>
                  <input
                    name={env.key}
                    value={form[env.key]}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                    autoComplete="off"
                  />
                  <span className="block text-xs text-gray-600 dark:text-gray-400">{env.desc}</span>
                </div>
              ))}
              <button type="submit" disabled={saving} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                {saving ? 'Salvando...' : 'Salvar .env local'}
              </button>
              {error && <div className="text-red-600 text-center mt-2">{error}</div>}
              {success && <div className="text-green-600 text-center mt-2">Salvo com sucesso! Recarregando...</div>}
            </form>
          </>
        )}
        {step === 'guide' && (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">Configuração das Variáveis de Ambiente</h2>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-4">Para que a aplicação funcione na Vercel, configure as variáveis abaixo:</p>
            <div className="mb-4">
              <ul className="space-y-2">
                {REQUIRED_ENVS.map(env => (
                  <li key={env.key} className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                    <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{env.key}</span>
                    <span className="block text-sm text-gray-600 dark:text-gray-400">{env.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleCopyVars}
              className="w-full bg-blue-500 text-white py-2 rounded mb-2 hover:bg-blue-600 transition flex items-center justify-center"
            >
              {copied ? 'Copiado!' : 'Copiar nomes das variáveis'}
            </button>
            <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              <strong>Passo a passo para configurar na Vercel:</strong>
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                <li>Acesse o painel do seu projeto na <a href="https://vercel.com/" target="_blank" className="text-blue-600 underline">Vercel</a>.</li>
                <li>Vá em <b>Settings &gt; Environment Variables</b>.</li>
                <li>Adicione cada variável acima com o valor correspondente.</li>
                <li>Salve e faça o deploy/restart do projeto.</li>
                <li>Após configurar, recarregue esta página.</li>
              </ol>
            </div>
            <div className="mb-2">
              <strong>Exemplo de valor:</strong>
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 font-mono text-xs mt-1">
                POSTGRES_URL=postgres://user:senha@host:5432/db<br/>
                JWT_SECRET=uma-string-secreta-bem-grande<br/>
                RESEND_API_KEY=re_abc123...<br/>
                NEXT_PUBLIC_BASE_URL=https://seu-projeto.vercel.app
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Dúvidas? Consulte a <a href="https://vercel.com/docs/projects/environment-variables" target="_blank" className="underline">documentação oficial da Vercel</a>.
            </div>
          </>
        )}
        {/* Modal de reinício do servidor */}
        {showRestartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <h3 className="text-xl font-bold mb-4 text-red-600">Reinicie o servidor</h3>
              <p className="mb-4 text-gray-800 dark:text-gray-200">
                O arquivo <span className="font-mono">.env</span> foi criado com sucesso!<br/>
                Para que as novas variáveis de ambiente sejam reconhecidas, <b>reinicie o servidor de desenvolvimento</b>.<br/>
                <span className="text-sm text-gray-600 dark:text-gray-400">(Pare e rode novamente <span className="font-mono">npm run dev</span> ou <span className="font-mono">pnpm dev</span> no terminal.)</span>
              </p>
              <div className="mb-4">
                <span className="block text-lg font-semibold text-green-700 dark:text-green-300">Até logo, jovem padawan!</span>
                <img
                  src="https://i.kym-cdn.com/entries/icons/original/000/018/682/yoda.jpg"
                  alt="Meme Mestre Yoda"
                  className="mx-auto mt-2 rounded shadow max-h-40"
                />
                <img
                  src="https://media.giphy.com/media/12Y6Vh3Jv6Ec3e/giphy.gif"
                  alt="Yoda dançando gif"
                  className="mx-auto mt-2 rounded shadow max-h-40"
                />
              </div>
              <button
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => window.location.reload()}
              >
                Ok, entendi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 