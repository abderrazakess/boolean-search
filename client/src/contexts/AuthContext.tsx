import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: { name?: string; email?: string; password?: string; avatar?: string }, currentPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "bs_users";
const SESSION_KEY = "bs_session";

function getUsers(): Record<string, { id: string; name: string; email: string; password: string; avatar?: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const users = getUsers();
    const stored = users[email.toLowerCase()];
    if (!stored || stored.password !== password) {
      throw new Error("Invalid email or password");
    }
    setUser({ id: stored.id, name: stored.name, email: stored.email, avatar: stored.avatar });
  };

  const register = async (name: string, email: string, password: string) => {
    const users = getUsers();
    const key = email.toLowerCase();
    if (users[key]) {
      throw new Error("An account with this email already exists");
    }
    const newUser = { id: Date.now().toString(), name, email: key, password };
    users[key] = newUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
  };

  const updateProfile = async (
    updates: { name?: string; email?: string; password?: string; avatar?: string },
    currentPassword: string
  ) => {
    const users = getUsers();
    const currentEmail = user!.email.toLowerCase();
    const stored = users[currentEmail];
    if (!stored || stored.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }

    const newEmail = updates.email ? updates.email.toLowerCase() : currentEmail;

    // If changing email, make sure it's not taken
    if (newEmail !== currentEmail && users[newEmail]) {
      throw new Error("This email is already in use");
    }

    const updatedUser = {
      ...stored,
      name: updates.name ?? stored.name,
      email: newEmail,
      password: updates.password || stored.password,
      avatar: updates.avatar !== undefined ? updates.avatar : stored.avatar,
    };

    // Remove old key if email changed
    if (newEmail !== currentEmail) {
      delete users[currentEmail];
    }
    users[newEmail] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const sessionUser = { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, avatar: updatedUser.avatar };
    setUser(sessionUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
