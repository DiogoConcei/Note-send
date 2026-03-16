const getApiUrl = () => {
  const env = import.meta.env as unknown as Record<string, string>;
  return env.VITE_API_URL || "http://localhost:3000/api";
};

export const API_URL = getApiUrl();

export const getHeaders = (token: string | null) => {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
