// Backend base URL. Set VITE_API_URL at build time (e.g. in Vercel project
// settings) to the deployed backend's public URL, without a trailing slash.
// Falls back to the local backend only during `npm run dev`.
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/+$/, "");

if (!API_BASE_URL) {
  console.error(
    "VITE_API_URL is not set. Configure it and rebuild the frontend."
  );
}

export default API_BASE_URL;
