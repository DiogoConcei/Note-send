import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Dashboard.module.scss";

interface NoteFormData {
  topic: string;
  content: string;
}

interface ValidationErrors {
  topic?: string;
  content?: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

function Dashboard() {
  const { user, logout, token } = useAuth();
  const [formData, setFormData] = useState<NoteFormData>({
    topic: "",
    content: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  const apiUrl =
    (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const response = await fetch(`${apiUrl}/notes`, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  React.useEffect(() => {
    void fetchNotes();
  }, []);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.topic.trim()) {
      newErrors.topic = "O tópico é obrigatório";
    } else if (formData.topic.length < 3) {
      newErrors.topic = "O tópico deve ter pelo menos 3 caracteres";
    }

    if (!formData.content.trim()) {
      newErrors.content = "A nota não pode estar vazia";
    } else if (formData.content.length < 10) {
      newErrors.content = "A nota deve ter pelo menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitted(false);

    if (validate()) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${apiUrl}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ?? ""}`,
          },
          body: JSON.stringify({
            title: formData.topic,
            content: formData.content,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao enviar a nota");
        }

        console.log("Nota enviada com sucesso!");
        setFormData({ topic: "", content: "" });
        setErrors({});
        setSubmitted(true);
        void fetchNotes(); // Atualiza a lista de notas

        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      } catch (error) {
        console.error("Erro ao enviar nota:", error);
        setErrors({
          content: "Erro ao conectar com o servidor. Tente novamente.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <main className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.userInfo}>
          {user?.avatar && (
            <img
              src={user.avatar}
              alt={user.username}
              className={styles.avatar}
            />
          )}
          <span>
            Bem-vindo, <strong>{user?.username}</strong>!
          </span>
        </div>
        <button onClick={logout} className={styles.logoutButton}>
          Sair
        </button>
      </nav>

      <div className={styles.contentLayout}>
        <section className={styles.card}>
          <header className={styles.header}>
            <h1>Nova Nota</h1>
            <p>Compartilhe suas ideias de forma rápida.</p>
          </header>

          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className={styles.form}
            noValidate
          >
            <div className={styles.field}>
              <label htmlFor="topic">Tópico</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Ex: Reunião Semanal"
                className={errors.topic ? styles.inputError : ""}
              />
              {errors.topic && (
                <span className={styles.errorMessage}>{errors.topic}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="content">Nota</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Escreva sua nota aqui..."
                rows={5}
                className={errors.content ? styles.inputError : ""}
              />
              {errors.content && (
                <span className={styles.errorMessage}>{errors.content}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "Enviando..." : "Enviar Nota"}
            </button>

            {submitted && (
              <div className={styles.successMessage}>
                Nota enviada com sucesso!
              </div>
            )}
          </form>
        </section>

        <section className={styles.notesList}>
          <h2>Minhas Notas</h2>
          {isLoadingNotes ? (
            <p>Carregando notas...</p>
          ) : notes.length === 0 ? (
            <p>Nenhuma nota encontrada.</p>
          ) : (
            <div className={styles.grid}>
              {notes.map((note) => (
                <div key={note.id} className={styles.noteCard}>
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                  <time>
                    {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                  </time>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
