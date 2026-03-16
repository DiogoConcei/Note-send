import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../Login/Login.module.scss"; // Reaproveitando estilos de Login

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register(email, username, password);
      await navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1>Criar Conta</h1>
          <p>Cadastre-se para começar a enviar notas.</p>
        </header>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className={styles.form}
        >
          <div className={styles.field}>
            <label htmlFor="username">Nome de Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              required
              placeholder="Ex: joao_silva"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Registrar"}
          </button>
        </form>

        <p className={styles.footer}>
          Já tem uma conta? <Link to="/login">Entre aqui</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
