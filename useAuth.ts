import { useState, useEffect } from 'react';
import { User } from './types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('budget_app_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('budget_app_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Mock authentication check
        const users = JSON.parse(localStorage.getItem('budget_app_users') || '{}');
        if (users[username] && users[username] === password) {
          const newUser = { uid: username, username };
          setUser(newUser);
          localStorage.setItem('budget_app_user', JSON.stringify(newUser));
          resolve();
        } else {
          const err: any = new Error('Invalid credentials');
          err.code = 'auth/wrong-password';
          reject(err);
        }
      }, 500); // Simulate network
    });
  };

  const signup = async (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('budget_app_users') || '{}');
        if (users[username]) {
          const err: any = new Error('Username already in use');
          err.code = 'auth/email-already-in-use';
          reject(err);
        } else {
          users[username] = password;
          localStorage.setItem('budget_app_users', JSON.stringify(users));
          
          const newUser = { uid: username, username };
          setUser(newUser);
          localStorage.setItem('budget_app_user', JSON.stringify(newUser));
          resolve();
        }
      }, 500);
    });
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('budget_app_user');
  };

  const updateUsername = async (newUsername: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (!user) return resolve();
        if (user.username === newUsername) return resolve(); // No change

        const users = JSON.parse(localStorage.getItem('budget_app_users') || '{}');
        
        // Check if new username already exists
        if (users[newUsername]) {
          const err: any = new Error('Este nome de usuário já está em uso.');
          return reject(err);
        }

        const oldUsername = user.username;
        const password = users[oldUsername];

        // 1. Update auth mapping
        users[newUsername] = password;
        delete users[oldUsername];
        localStorage.setItem('budget_app_users', JSON.stringify(users));

        // 2. Migrate transactions
        const txs = localStorage.getItem(`budget_app_txs_${oldUsername}`);
        if (txs) {
          // Update userId inside transactions to new uid
          const parsedTxs = JSON.parse(txs);
          const migratedTxs = parsedTxs.map((tx: any) => ({ ...tx, userId: newUsername }));
          localStorage.setItem(`budget_app_txs_${newUsername}`, JSON.stringify(migratedTxs));
          localStorage.removeItem(`budget_app_txs_${oldUsername}`);
        }

        // 3. Migrate settings
        const settings = localStorage.getItem(`budget_app_settings_${oldUsername}`);
        if (settings) {
          localStorage.setItem(`budget_app_settings_${newUsername}`, settings);
          localStorage.removeItem(`budget_app_settings_${oldUsername}`);
        }

        // 4. Update current session
        const updatedUser = { uid: newUsername, username: newUsername };
        setUser(updatedUser);
        localStorage.setItem('budget_app_user', JSON.stringify(updatedUser));
        
        resolve();
      }, 300);
    });
  };

  return { user, loading, login, signup, logout, updateUsername };
}
