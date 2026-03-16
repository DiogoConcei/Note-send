import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface DecodedToken {
  id?: string;
  sub?: string;
  email?: string;
  username?: string;
  name?: string;
  picture?: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const validateToken = () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken);
          // Verificar se o token expirou
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            setUser({
              id: (decoded.id || decoded.sub) as string,
              email: decoded.email || "",
              username: (decoded.username || decoded.name) as string,
              avatar: decoded.picture,
            });
            setToken(storedToken);
          }
        } catch (error) {
          console.error("Token inválido", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    const env = import.meta.env as unknown as Record<string, string>;
    const apiUrl = env.VITE_API_URL || "http://localhost:3000/api";

    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao fazer login");
    }

    const { token: newToken, user: userData } = data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser({
      id: userData.id.toString(),
      email: userData.email,
      username: userData.name,
    });
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    const env = import.meta.env as unknown as Record<string, string>;
    const apiUrl = env.VITE_API_URL || "http://localhost:3000/api";

    const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: username }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao registrar");
    }

    const { token: newToken, user: userData } = data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser({
      id: userData.id.toString(),
      email: userData.email,
      username: userData.name,
    });
  };

  const loginWithGoogle = async (credential: string) => {
    const env = import.meta.env as unknown as Record<string, string>;
    const apiUrl = env.VITE_API_URL || "http://localhost:3000/api";

    try {
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro no login com Google");
      }

      const { token: newToken, user: userData } = data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser({
        id: userData.id.toString(),
        email: userData.email,
        username: userData.name,
      });
    } catch (error) {
      console.error("Erro no login Google", error);
      throw error instanceof Error ? error : new Error("Falha ao autenticar com Google");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        loginWithGoogle,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
