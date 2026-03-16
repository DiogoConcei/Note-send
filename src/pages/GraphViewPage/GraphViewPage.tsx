import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { API_URL, getHeaders } from "../../services/api";
import styles from "./GraphViewPage.module.scss";
import { GraphView } from "../../components/GraphView/GraphView";
import { type Note, type Topic } from "../../types";
import { motion } from "framer-motion";

const GraphViewPage: React.FC = () => {
  const { token } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notesRes, topicsRes] = await Promise.all([
        fetch(`${API_URL}/notes`, { headers: getHeaders(token) }),
        fetch(`${API_URL}/topics`, { headers: getHeaders(token) }),
      ]);

      if (notesRes.ok && topicsRes.ok) {
        const [notesData, topicsData] = await Promise.all([
          notesRes.json(),
          topicsRes.json(),
        ]);
        setNotes(notesData);
        setTopics(topicsData);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados do grafo.");
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.container}
    >
      <header className={styles.header}>
        <h1>Grafo de Tópicos</h1>
        <p>Visualize as conexões entre seus pensamentos.</p>
      </header>

      {isLoading ? (
        <div className={styles.loading}>Carregando grafo...</div>
      ) : (
        <div className={styles.graphWrapper}>
          <GraphView notes={notes} topics={topics} />
        </div>
      )}
    </motion.div>
  );
};

export default GraphViewPage;
