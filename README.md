# LeadRadar

Dashboard de prospeccion para freelancers web: busca negocios locales, gestiona leads y genera mensajes/prompts con IA.

## Stack

- Next.js 14 + App Router
- TypeScript strict
- Tailwind + next-themes
- Supabase (estado, notas, prompts, settings no sensibles)
- IA por proveedor: `groq` (default) o `gemini`

## Configuracion local

1. Instala dependencias:

```bash
npm install
```

2. Crea tu env local:

```bash
cp .env.local.example .env.local
```

3. Rellena en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Ejecuta la migracion SQL en Supabase:

- `supabase/migrations/001_initial_schema.sql`

5. Arranca:

```bash
npm run dev
```

## Donde van las API keys

- **No** guardamos secretos en Supabase.
- La API key del proveedor IA (Groq/Gemini) se guarda en `localStorage` (en `/ajustes`).
- En Supabase solo se persisten ajustes no sensibles en `app_settings`.

## Proveedor IA recomendado

- Default recomendado: **Groq**.
- Modelos sugeridos:
  - WhatsApp/Web: `llama-3.3-70b-versatile`
  - Busqueda: `groq/compound-mini`

Puedes probar conectividad desde `/ajustes` con el boton **Probar IA**.

## Deploy en Vercel

1. Sube el repo a GitHub.
2. Importa en Vercel.
3. En Vercel > Settings > Environment Variables agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.
5. En Supabase, ejecuta la migracion `001_initial_schema.sql`.
6. En la app desplegada, entra a `/ajustes`, configura proveedor y API key.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
