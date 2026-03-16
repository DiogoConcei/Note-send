import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { API_URL, getHeaders } from "../../services/api";
import styles from "./CreateNote.module.scss";
import { TopicSelect } from "../../components/TopicSelect/TopicSelect";
import { type Topic } from "../../types";
import { INITIAL_TOPICS, TOPIC_COLORS } from "../../constants";
import ReactMarkdown from "react-markdown";

const CreateNote: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [formData, setFormData] = useState({
    topicId: "" as string | number,
    content: "",
  });

  const [errors, setErrors] = useState<{ topicId?: string; content?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Carregar tópicos da API ao montar o componente
  React.useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${API_URL}/topics`, {
          headers: getHeaders(token),
        });
        if (response.ok) {
          const data = (await response.json()) as Topic[];
          setTopics(data);
        }
      } catch (error) {
        console.error("Erro ao carregar tópicos:", error);
      }
    };
    void fetchTopics();
  }, [token]);

  const validate = (): boolean => {
    const newErrors: { topicId?: string; content?: string } = {};
    if (!formData.topicId) newErrors.topicId = "Selecione um tópico";
    if (!formData.content.trim())
      newErrors.content = "A nota não pode estar vazia";
    else if (formData.content.length < 10)
      newErrors.content = "A nota deve ter pelo menos 10 caracteres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTopic = async (label: string) => {
    const color = TOPIC_COLORS[topics.length % TOPIC_COLORS.length];

    try {
      const response = await fetch(`${API_URL}/topics`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ label, color }),
      });

      if (response.ok) {
        const newTopic = (await response.json()) as Topic;
        setTopics((prev) => [...prev, newTopic]);
        setFormData((prev) => ({ ...prev, topicId: newTopic.id }));
        toast.success(`Tópico "${label}" criado!`);
      } else {
        toast.error("Erro ao criar tópico.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
      console.error("Erro ao criar tópico:", error);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const selectedTopic = topics.find((t) => t.id === formData.topicId);
        const response = await fetch(`${API_URL}/notes`, {
          method: "POST",
          headers: getHeaders(token),
          body: JSON.stringify({
            title: selectedTopic?.label ?? "Sem Tópico",
            content: formData.content,
            topicId: Number(formData.topicId),
          }),
        });

        if (response.ok) {
          toast.success("Nota criada com sucesso!");
          void navigate("/");
        } else {
          toast.error("Erro ao criar nota.");
        }
      } catch (error) {
        toast.error("Erro de conexão.");
        console.error("Erro ao enviar nota:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1>Nova Nota</h1>
          <p>Escreva o que está em sua mente.</p>
        </header>

        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form}>
          <div className={styles.field}>
            <label>Tópico</label>
            <TopicSelect
              topics={topics}
              selectedTopicId={formData.topicId}
              onSelect={(topic) => {
                setFormData((prev) => ({ ...prev, topicId: topic.id }));
              }}
              onAddTopic={(label) => void handleAddTopic(label)}
            />
            {errors.topicId && (
              <span className={styles.error}>{errors.topicId}</span>
            )}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="content">Conteúdo</label>
              <button
                type="button"
                className={styles.previewToggle}
                onClick={() => {
                  setShowPreview(!showPreview);
                }}
              >
                {showPreview ? "Editar" : "Ver Preview"}
              </button>
            </div>

            {showPreview ? (
              <div className={styles.previewArea}>
                <ReactMarkdown>
                  {formData.content || "*Nada para mostrar ainda...*"}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, content: e.target.value }));
                }}
                placeholder="Use Markdown para formatar seu texto..."
                rows={10}
              />
            )}
            {errors.content && (
              <span className={styles.error}>{errors.content}</span>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => void navigate("/")}
              className={styles.cancelBtn}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? "Salvando..." : "Criar Nota"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNote;
