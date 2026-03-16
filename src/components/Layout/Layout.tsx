import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar";
import { Menu } from "lucide-react";
import styles from "./Layout.module.scss";

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
        }}
      />

      <main className={styles.mainContent}>
        <div className={styles.mobileHeader}>
          <button
            className={styles.menuButton}
            onClick={() => {
              setIsSidebarOpen(true);
            }}
          >
            <Menu size={24} />
          </button>
          <span className={styles.mobileTitle}>Note Send</span>
        </div>

        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
