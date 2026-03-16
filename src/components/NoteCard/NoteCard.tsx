import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Share2, Trash2, Edit2, Pin } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import styles from "./NoteCard.module.scss";
import { type Note } from "../../types";

interface NoteCardProps {
  note: Note;
  topicColor: string;
  onDelete?: (id: number) => void;
  onEdit?: (note: Note) => void;
  onTogglePin?: (id: number) => void;
  isPinned?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = memo(
  ({
    note,
    topicColor: propsTopicColor,
    onDelete,
    onEdit,
    onTogglePin,
    isPinned = false,
  }) => {
    const topicColor = note.topic?.color ?? propsTopicColor;
    const topicLabel = note.topic?.label ?? note.title;

    const handleCopy = async () => {
      const textToCopy = `[${topicLabel}]\n\n${note.content}`;

      if (
        typeof navigator.clipboard !== "undefined" &&
        window.isSecureContext
      ) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          toast.success("Copiado com sucesso!");
          return;
        } catch (err) {
          console.error("Falha ao copiar:", err);
        }
      }

      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) toast.success("Copiado!");
      } catch {
        toast.error("Erro ao copiar.");
      }
    };

    const handleShare = async () => {
      if (typeof navigator.share !== "undefined") {
        try {
          await navigator.share({
            title: `Nota: ${topicLabel}`,
            text: note.content,
          });
        } catch (err) {
          if ((err as Error).name !== "AbortError")
            toast.error("Erro ao compartilhar.");
        }
      } else {
        await handleCopy();
      }
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={`${styles.card} ${isPinned ? styles.pinned : ""}`}
        style={{ "--topic-color": topicColor } as React.CSSProperties}
      >
        <div className={styles.header}>
          <motion.span layout="position" className={styles.topicTag}>
            {topicLabel}
          </motion.span>
          <div className={styles.actions}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTogglePin?.(note.id)}
              className={`${styles.iconButton} ${isPinned ? styles.activePin : ""}`}
              title="Fixar nota"
            >
              <Pin size={16} fill={isPinned ? "currentColor" : "none"} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => void handleCopy()}
              className={styles.iconButton}
              title="Copiar"
            >
              <Copy size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => void handleShare()}
              className={styles.iconButton}
              title="Compartilhar"
            >
              <Share2 size={16} />
            </motion.button>
          </div>
        </div>

        <div className={styles.content}>
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>

        <div className={styles.footer}>
          <time>
            {new Date(note.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
          <div className={styles.adminActions}>
            <motion.button
              whileHover={{ scale: 1.1, color: "var(--primary)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit?.(note)}
              className={styles.iconButton}
              title="Editar"
            >
              <Edit2 size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, color: "#ef4444" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete?.(note.id)}
              className={`${styles.iconButton} ${styles.deleteBtn}`}
              title="Excluir"
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }
);

NoteCard.displayName = "NoteCard";
