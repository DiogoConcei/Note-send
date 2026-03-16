const getApiUrl = () => {
  const env = import.meta.env as unknown as Record<string, string>;
  let url = env.VITE_API_URL || "http://localhost:3000/api";

  // Se a URL não começar com http e não for localhost, assume que falta o protocolo
  if (url && !url.startsWith("http") && !url.includes("localhost")) {
    url = `https://${url}`;
  }

  console.log(`API URL configurada: ${url}`);
  return url;
};

export const API_URL = getApiUrl();

export const getHeaders = (token: string | null) => {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
