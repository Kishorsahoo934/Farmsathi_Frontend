import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/constants';

import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize user from localStorage or Firebase Auth Redirect (Mock + Real Sync)
  useEffect(() => {
    // 1. Check localStorage first (Mock persistence)
    const savedUser = localStorage.getItem('farmsathi_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
      setLoading(false);
      return;
    }

    // 2. Otherwise, handle Firebase Auth
    let resolvedRedirect = false;
    let currentFirebaseUser = null;

    const checkLoadingState = () => {
      if (resolvedRedirect) {
        if (currentFirebaseUser) {
          const loggedUser = {
            uid: currentFirebaseUser.uid,
            email: currentFirebaseUser.email,
            displayName: currentFirebaseUser.displayName || currentFirebaseUser.email.split('@')[0],
          };
          localStorage.setItem('farmsathi_user', JSON.stringify(loggedUser));
          setUser(loggedUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    };

    // Process redirect result
    getRedirectResult(auth)
      .then((result) => {
        resolvedRedirect = true;
        if (result && result.user) {
          currentFirebaseUser = result.user;
          checkLoadingState();
          navigate('/dashboard');
        } else {
          checkLoadingState();
        }
      })
      .catch((error) => {
        console.error("Error handling redirect result:", error);
        resolvedRedirect = true;
        checkLoadingState();
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      currentFirebaseUser = firebaseUser;
      checkLoadingState();
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Ping backend to wake it up from cold start on Render
    const wakeupBackend = async () => {
      try {
        await fetch(API_BASE_URL);
        console.log('Backend wakeup ping sent successfully.');
      } catch (err) {
        console.error('Failed to wake up the backend:', err);
      }
    };
    wakeupBackend();
  }, []);

  // Helper to manage registered users in localStorage
  const getRegisteredUsers = () => {
    const users = localStorage.getItem('farmsathi_registered_users');
    return users ? JSON.parse(users) : {};
  };

  const saveRegisteredUsers = (users) => {
    localStorage.setItem('farmsathi_registered_users', JSON.stringify(users));
  };

  // Mock Password Login
  const login = useCallback(async (email, password) => {
    await new Promise((r) => setTimeout(r, 400)); // Simulated delay
    const users = getRegisteredUsers();
    const cleanEmail = email.toLowerCase().trim();
    if (!users[cleanEmail]) {
      const error = new Error('No account found with this email.');
      error.code = 'auth/user-not-found';
      throw error;
    }
    if (users[cleanEmail].password !== password) {
      const error = new Error('Incorrect password.');
      error.code = 'auth/wrong-password';
      throw error;
    }
    const loggedUser = {
      uid: users[cleanEmail].uid || Math.random().toString(36).substring(2),
      email: cleanEmail,
      displayName: users[cleanEmail].displayName || cleanEmail.split('@')[0],
    };
    localStorage.setItem('farmsathi_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return { user: loggedUser };
  }, []);

  // Mock Signup
  const signup = useCallback(async (email, password) => {
    await new Promise((r) => setTimeout(r, 400)); // Simulated delay
    const users = getRegisteredUsers();
    const cleanEmail = email.toLowerCase().trim();
    if (users[cleanEmail]) {
      const error = new Error('This email is already registered.');
      error.code = 'auth/email-already-in-use';
      throw error;
    }
    const newUid = Math.random().toString(36).substring(2);
    users[cleanEmail] = {
      uid: newUid,
      email: cleanEmail,
      password: password,
      displayName: cleanEmail.split('@')[0],
    };
    saveRegisteredUsers(users);
    const loggedUser = {
      uid: newUid,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0],
    };
    localStorage.setItem('farmsathi_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return { user: loggedUser };
  }, []);

  // Real Google Login using Firebase Auth (Synchronous call to prevent popup blocking)
  const loginWithGoogle = useCallback(() => {
    return signInWithPopup(auth, googleProvider)
      .then((result) => {
        const firebaseUser = result.user;
        const loggedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        };
        localStorage.setItem('farmsathi_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return { user: loggedUser };
      })
      .catch((error) => {
        console.error("Google Auth Error:", error);
        throw error;
      });
  }, []);

  // Logout (handles both Firebase and Mock sessions)
  const logout = useCallback(async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (e) {
      console.error('Error signing out from Firebase:', e);
    }
    localStorage.removeItem('farmsathi_user');
    setUser(null);
  }, []);

  // Real OTP generation & delivery using backend SMTP
  const sendOtp = useCallback(async (email) => {
    const res = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send OTP' }));
      throw new Error(err.detail || 'Failed to send OTP');
    }
    return res.json();
  }, []);

  // Real OTP verification using backend API
  const verifyOtp = useCallback(async (email, otp) => {
    const res = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid OTP' }));
      throw new Error(err.detail || 'Invalid OTP');
    }
    return res.json();
  }, []);

  const getFirebaseErrorMessage = (error) => {
    const map = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    return map[error.code] || error.message || 'Authentication error.';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, sendOtp, verifyOtp, getFirebaseErrorMessage, authError, setAuthError }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
