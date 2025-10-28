/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TOMTOM_API_KEY?: string;
  readonly VITE_TACCAR_BASE_URL?: string;
  readonly VITE_TACCAR_USERNAME?: string;
  readonly VITE_TACCAR_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
