import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, getHeaders } from "../../services/api";
import styles from "./NotesList.module.scss";
import { NoteCard } from "../../components/NoteCard/NoteCard";
import { type Note } from "../../types";

const NotesList: React.FC = () => {
  const { token } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pinnedNoteIds, setPinnedNoteIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

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
      toast.error("Erro ao carregar dados.");
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta nota?")) {
      try {
        const response = await fetch(`${API_URL}/notes/${String(id)}`, {
          method: "DELETE",
          headers: getHeaders(token),
        });
        if (response.ok) {
          setNotes((prev) => prev.filter((n) => n.id !== id));
          toast.success("Nota excluída com sucesso.");
        } else {
          toast.error("Erro ao excluir nota.");
        }
      } catch (error) {
        toast.error("Erro de conexão.");
        console.error("Erro ao excluir nota:", error);
      }
    }
  };

  const handleTogglePin = useCallback((id: number) => {
    setPinnedNoteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const filteredNotes = useMemo(() => {
    let result = notes;

    // Filtro por busca de texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.content.toLowerCase().includes(q) ||
          note.title.toLowerCase().includes(q)
      );
    }

    // Filtro por tópico selecionado
    if (selectedTopicId !== null) {
      result = result.filter((note) => note.topicId === selectedTopicId);
    }

    return result;
  }, [notes, searchQuery, selectedTopicId]);

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      const isAPinned = pinnedNoteIds.has(a.id);
      const isBPinned = pinnedNoteIds.has(b.id);
      if (isAPinned && !isBPinned) return -1;
      if (!isAPinned && isBPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredNotes, pinnedNoteIds]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Minhas Notas</h1>
          <p>{notes.length} notas no total</p>
        </div>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Pesquisar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Barra de Filtro de Tópicos */}
      <div className={styles.filterBar}>
        <button
          className={`${styles.topicFilter} ${selectedTopicId === null ? styles.active : ""}`}
          onClick={() => setSelectedTopicId(null)}
        >
          Todos
        </button>
        {topics.map((topic) => (
          <button
            key={topic.id}
            className={`${styles.topicFilter} ${selectedTopicId === topic.id ? styles.active : ""}`}
            onClick={() => setSelectedTopicId(topic.id)}
            style={{ "--topic-color": topic.color } as React.CSSProperties}
          >
            <span className={styles.dot} />
            {topic.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : sortedNotes.length === 0 ? (
        <div className={styles.empty}>
          {searchQuery || selectedTopicId
            ? "Nenhuma nota corresponde aos seus filtros."
            : "Você ainda não tem notas. Comece criando uma!"}
        </div>
      ) : (
        <motion.div layout className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {sortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                topicColor="var(--primary)"
                onDelete={(id) => {
                  void handleDelete(id);
                }}
                onTogglePin={handleTogglePin}
                isPinned={pinnedNoteIds.has(note.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default NotesList;
