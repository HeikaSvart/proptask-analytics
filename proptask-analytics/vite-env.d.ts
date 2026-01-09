/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string | undefined;
  readonly VITE_BACKEND_URL: string | undefined;
  readonly VITE_GEMINI_MODEL: string | undefined;
  readonly VITE_APP_PASSWORD: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
