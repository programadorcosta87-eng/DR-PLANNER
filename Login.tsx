import { useState, FormEvent } from 'react';
import { LogIn, UserPlus, Wallet, Eye, EyeOff } from 'lucide-react';
import { inputClass, btnPrimaryClass } from '../utils';

interface LoginProps {
  onLogin: (u: string, p: string) => Promise<void>;
  onSignup: (u: string, p: string) => Promise<void>;
}

export default function Login({ onLogin, onSignup }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await onLogin(username, password);
      } else {
        await onSignup(username, password);
      }
    } catch (err: any) {
      if (err.message === 'Invalid credentials') {
        setError('Usuário ou senha incorretos.');
      } else if (err.message === 'Username already in use') {
        setError('Este nome de usuário já está em uso.');
      } else {
        console.error(err);
        setError('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/40 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
          <Wallet size={32} />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">DR Planner</h1>
        <p className="mb-8 text-slate-500">
          {isLogin ? 'Faça login para continuar.' : 'Crie sua conta para começar.'}
        </p>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-3 text-sm text-red-600 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Nome de usuário</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              placeholder="Seu usuário"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${btnPrimaryClass} mt-2 flex items-center justify-center gap-2`}
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLoading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-500">
          {isLogin ? 'Ainda não tem uma conta? ' : 'Já possui uma conta? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-medium text-blue-600 hover:underline focus:outline-none"
          >
            {isLogin ? 'Criar conta' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
}
