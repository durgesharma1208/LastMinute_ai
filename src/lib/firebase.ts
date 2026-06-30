import { LocalUser } from '../types';

export type User = LocalUser;

// Pub/sub for Auth state change triggers
type AuthListener = (user: LocalUser | null, token: string | null) => void;
const authListeners: AuthListener[] = [];

let cachedAccessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('local_google_access_token') : null;

// Get current user from localStorage
const getCurrentUser = (): LocalUser | null => {
  try {
    const data = localStorage.getItem('local_current_user');
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error getting local user:', err);
    return null;
  }
};

// Set current user to localStorage
const setCurrentUser = (user: LocalUser | null) => {
  try {
    if (user) {
      localStorage.setItem('local_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('local_current_user');
    }
    // Notify all listeners of auth changes
    authListeners.forEach(cb => cb(user, cachedAccessToken));
  } catch (err) {
    console.error('Error setting local user:', err);
  }
};

// Get list of registered accounts
const getAccounts = (): { [email: string]: any } => {
  try {
    const data = localStorage.getItem('local_accounts');
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error('Error getting local accounts:', err);
    return {};
  }
};

// Save a new account
const saveAccount = (email: string, account: any) => {
  try {
    const accounts = getAccounts();
    accounts[email.toLowerCase().trim()] = account;
    localStorage.setItem('local_accounts', JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving local account:', err);
  }
};

// --- AUTH FUNCTIONS ---

// Mock initAuth subscription
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  const handleState = (user: User | null, token: string | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  };

  // Deliver current state immediately
  const initialUser = getCurrentUser();
  handleState(initialUser, cachedAccessToken);

  // Register callback
  authListeners.push(handleState);

  // Return unsubscribe function
  return () => {
    const index = authListeners.indexOf(handleState);
    if (index >= 0) {
      authListeners.splice(index, 1);
    }
  };
};

// Google sign-in simulation
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  // Mock successful Google authentication
  cachedAccessToken = 'mock_google_calendar_access_token_xyz_123';
  if (typeof window !== 'undefined') {
    localStorage.setItem('local_google_access_token', cachedAccessToken);
  }

  const user: User = {
    uid: 'google_user_123',
    email: 'googleuser@gmail.com',
    displayName: 'Google User',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
  };

  setCurrentUser(user);
  return { user, accessToken: cachedAccessToken };
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Logout
export const logoutUser = async () => {
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('local_google_access_token');
  }
  setCurrentUser(null);
};

// Email Sign In with robust validation
export const emailSignIn = async (email: string, password: string): Promise<User> => {
  const normEmail = email.toLowerCase().trim();
  const accounts = getAccounts();
  const account = accounts[normEmail];

  if (!account || account.password !== password) {
    throw new Error('auth/invalid-credential');
  }

  const user: User = {
    uid: account.uid,
    email: account.email,
    displayName: account.displayName || 'Productive User',
    photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.displayName || 'User')}&background=0D8ABC&color=fff`
  };

  setCurrentUser(user);
  return user;
};

// Email Sign Up with robust storage
export const emailSignUp = async (email: string, password: string, name: string): Promise<User> => {
  const normEmail = email.toLowerCase().trim();
  const accounts = getAccounts();

  if (accounts[normEmail]) {
    throw new Error('auth/email-already-in-use');
  }

  const uid = `user_${Date.now()}`;
  const newAccount = {
    uid,
    email: normEmail,
    password,
    displayName: name,
    photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`
  };

  saveAccount(normEmail, newAccount);

  const user: User = {
    uid,
    email: normEmail,
    displayName: name,
    photoURL: newAccount.photoURL
  };

  setCurrentUser(user);
  return user;
};
