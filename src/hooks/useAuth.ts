import { useEffect, useState, useCallback } from 'react';

export interface LocalUser {
  email: string;
  fullName: string;
}

interface StoredUser {
  email: string;
  password: string;
  fullName: string;
}

const USERS_KEY = 'agri_users';
const SESSION_KEY = 'agri_session';

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): LocalUser | null {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

function saveSession(user: LocalUser | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function signUpLocal(email: string, password: string, fullName: string): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please sign in.' };
  }
  users.push({ email: email.toLowerCase(), password, fullName });
  saveStoredUsers(users);
  saveSession({ email: email.toLowerCase(), fullName });
  return { success: true };
}

export function signInLocal(email: string, password: string): { success: boolean; error?: string; user?: LocalUser } {
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { success: false, error: 'No account found with this email. Please sign up first.' };
  }
  if (user.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }
  const localUser: LocalUser = { email: user.email, fullName: user.fullName };
  saveSession(localUser);
  return { success: true, user: localUser };
}

export function signOutLocal() {
  saveSession(null);
}

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    setLoading(false);

    // Listen for storage changes (e.g. logout from another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        setUser(getSession());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const signOut = useCallback(() => {
    signOutLocal();
    setUser(null);
  }, []);

  return { user, loading, signOut };
}
