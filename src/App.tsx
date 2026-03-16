import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";

// Lazy loading das páginas para melhor performance
const NotesList = lazy(() => import("./pages/NotesList/NotesList"));
const CreateNote = lazy(() => import("./pages/CreateNote/CreateNote"));
const GraphViewPage = lazy(() => import("./pages/GraphViewPage/GraphViewPage"));
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));

// Loading simples para o suspense
const PageLoading = () => (
  <div
    style={{
      padding: "2rem",
      textAlign: "center",
      color: "var(--text-secondary)",
    }}
  >
    Carregando...
  </div>
);

// Substitua pelo seu Client ID real do Google Cloud Console
const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  "SUA_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

if (GOOGLE_CLIENT_ID === "SUA_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
  console.warn("ATENÇÃO: VITE_GOOGLE_CLIENT_ID não está configurado. O login com Google não funcionará.");
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton theme="dark" />
        <Router>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<NotesList />} />
                <Route path="create" element={<CreateNote />} />
                <Route path="graph" element={<GraphViewPage />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
