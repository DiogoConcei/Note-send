import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { API_URL } from "../services/api";

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
    toast.info("Você saiu da sua conta.");
  };

  useEffect(() => {
    const validateToken = () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken);
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
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Erro ao fazer login";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // A resposta não era JSON
        }
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as {
        token: string;
        user: { id: number | string; email: string; name: string };
        message?: string;
      };

      const { token: newToken, user: userData } = data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser({
        id: userData.id.toString(),
        email: userData.email,
        username: userData.name,
      });
      toast.success(`Bem-vindo de volta, ${userData.name}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro no login";
      toast.error(message);
      throw error;
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: username }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Erro ao registrar";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // A resposta não era JSON
        }
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as {
        token: string;
        user: { id: number | string; email: string; name: string };
        message?: string;
      };

      const { token: newToken, user: userData } = data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser({
        id: userData.id.toString(),
        email: userData.email,
        username: userData.name,
      });
      toast.success("Conta criada com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro no registro";
      toast.error(message);
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      console.log(`Tentando login Google em: ${API_URL}/auth/google`);
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta do servidor (Google):", errorText);
        let errorMessage = `Erro no servidor (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // A resposta não era JSON (ex: HTML de erro)
          console.error("Resposta do servidor não é JSON:", errorText);
        }
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as {
        token: string;
        user: { id: number | string; email: string; name: string };
        message?: string;
      };

      const { token: newToken, user: userData } = data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser({
        id: userData.id.toString(),
        email: userData.email,
        username: userData.name,
      });
      toast.success(`Entrou com Google: ${userData.name}`);
    } catch (error) {
      console.error("Erro no login Google", error);
      const message =
        error instanceof Error ? error.message : "Falha no Google Login";
      toast.error(message);
      throw error;
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
