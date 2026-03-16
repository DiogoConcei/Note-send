import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, LayoutGrid, Network, X, PlusCircle } from "lucide-react";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <>
      <div
        className={`${styles.mobileOverlay} ${isOpen ? styles.isOpen : ""}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.isOpen : ""}`}>
        <div className={styles.header}>
          <div className={styles.profile}>
            <div className={styles.avatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <span>{getInitial(user?.username || "")}</span>
              )}
            </div>
            <span className={styles.username}>{user?.username}</span>
          </div>
          {isOpen && (
            <button
              onClick={onClose}
              className={styles.closeButton}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
            onClick={onClose}
          >
            <LayoutGrid />
            <span>Minhas Notas</span>
          </NavLink>

          <NavLink
            to="/create"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
            onClick={onClose}
          >
            <PlusCircle />
            <span>Nova Nota</span>
          </NavLink>

          <NavLink
            to="/graph"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
            onClick={onClose}
          >
            <Network />
            <span>Grafo</span>
          </NavLink>
        </nav>

        <div className={styles.footer}>
          <button
            onClick={() => {
              logout();
            }}
            className={styles.logoutButton}
          >
            <LogOut />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>
    </>
  );
};
