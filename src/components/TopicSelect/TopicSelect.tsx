import React, { useState, useRef, useEffect } from "react";
import styles from "./TopicSelect.module.scss";

import { type Topic } from "../../types";

interface TopicSelectProps {
  topics: Topic[];
  selectedTopicId: number | string;
  onSelect: (topic: Topic) => void;
  onAddTopic: (label: string) => void;
}

export const TopicSelect: React.FC<TopicSelectProps> = ({
  topics,
  selectedTopicId,
  onSelect,
  onAddTopic,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTopicLabel, setNewTopicLabel] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddTopic = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (newTopicLabel.trim()) {
      onAddTopic(newTopicLabel.trim());
      setNewTopicLabel("");
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        className={`${styles.selectBox} ${isOpen ? styles.open : ""}`}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <div className={styles.selectedValue}>
          {selectedTopic ? (
            <>
              <span
                className={styles.colorIndicator}
                style={{ backgroundColor: selectedTopic.color }}
              />
              {selectedTopic.label}
            </>
          ) : (
            <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>
              Selecione um tópico...
            </span>
          )}
        </div>
        <div className={`${styles.arrow} ${isOpen ? styles.up : ""}`} />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.optionsList}>
            {topics.map((topic) => (
              <div
                key={topic.id}
                className={`${styles.option} ${
                  topic.id === selectedTopicId ? styles.selected : ""
                }`}
                onClick={() => {
                  onSelect(topic);
                  setIsOpen(false);
                }}
              >
                <span
                  className={styles.colorIndicator}
                  style={{ backgroundColor: topic.color }}
                />
                {topic.label}
              </div>
            ))}
          </div>

          <div className={styles.addNew}>
            <div className={styles.addInputWrapper}>
              <input
                type="text"
                placeholder="Novo tópico..."
                className={styles.addInput}
                value={newTopicLabel}
                onChange={(e) => {
                  setNewTopicLabel(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (newTopicLabel.trim()) {
                      onAddTopic(newTopicLabel.trim());
                      setNewTopicLabel("");
                    }
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              <button
                type="button"
                className={styles.addButton}
                disabled={!newTopicLabel.trim()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (newTopicLabel.trim()) {
                    onAddTopic(newTopicLabel.trim());
                    setNewTopicLabel("");
                  }
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
