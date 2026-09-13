import { useAuth } from './useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const { user, loading, login, signup, logout, updateUsername } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} onSignup={signup} />;
  }

  return <Dashboard user={user} onLogout={logout} onUpdateUsername={updateUsername} />;
}
