import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loginCustomer, registerCustomer } from '../services/api';

export type UserRole = 'cliente' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, run: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USER = {
  id: 'admin-1',
  name: 'Administrador',
  email: 'admin@sushimaster.cl',
  password: 'admin123',
  role: 'admin' as UserRole,
  phone: '+56 9 1111 1111',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('sushi-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('sushi-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sushi-user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
      const { password: _password, ...adminWithoutPassword } = ADMIN_USER;
      setUser(adminWithoutPassword);
      return true;
    }

    const backendUser = await loginCustomer(email, password);
    if (!backendUser) {
      return false;
    }

    setUser(backendUser);
    return true;
  };

  const register = async (
    name: string,
    run: string,
    email: string,
    password: string,
    phone: string
  ): Promise<boolean> => {
    if (email === ADMIN_USER.email) {
      return false;
    }

    try {
      const newUser = await registerCustomer({
        run,
        fullName: name,
        email,
        password,
        phone,
      });
      setUser(newUser);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
