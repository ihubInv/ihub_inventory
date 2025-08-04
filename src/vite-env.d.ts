/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  readonly EMAIL_SERVICE_ID: string;
  readonly EMAIL_TEMPLATE_ID: string;
  readonly EMAIL_PUBLIC_KEY: string;


}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
