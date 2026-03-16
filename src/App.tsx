import { useState } from "react";
import styles from "./App.module.scss";

interface NoteFormData {
  topic: string;
  content: string;
}

interface ValidationErrors {
  topic?: string;
  content?: string;
}

function App() {
  const [formData, setFormData] = useState<NoteFormData>({
    topic: "",
    content: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(false);

    if (validate()) {
      setIsSubmitting(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.topic,
            content: formData.content,
          }),
        });

        if (!response.ok) {
          throw new Error('Falha ao enviar a nota');
        }

        console.log("Nota enviada com sucesso!");
        setFormData({ topic: "", content: "" });
        setErrors({});
        setSubmitted(true);

        // Resetar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      } catch (error) {
        console.error("Erro ao enviar nota:", error);
        setErrors({ content: "Erro ao conectar com o servidor. Tente novamente." });
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

    // Limpar erro ao digitar
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <main className={styles.container}>
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
    </main>
  );
}

export default App;
