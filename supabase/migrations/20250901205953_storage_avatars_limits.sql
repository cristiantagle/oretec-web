-- Asegura el bucket 'avatars' y establece límites de tamaño y MIME
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Limitar tamaño a 2MB y permitir solo image/jpeg, image/png
UPDATE storage.buckets
   SET file_size_limit = 2097152, -- 2 app components deploy.fish eslint.config.mjs lib middleware.ts next-env.d.ts next.config.js node_modules oretec-web-starter-mp-links oretec-web-starter-mp-links-full oretec.manifest package-lock.json package.json postcss.config.js postcss.config.mjs public README.md scaffold_admin_contact_detail.fish scaffold_contacts.fish setup_admin_auth.sh setup_admin_logout_button.fish supabase tailwind.config.js tree.txt tsconfig.json 1024 app components deploy.fish eslint.config.mjs lib middleware.ts next-env.d.ts next.config.js node_modules oretec-web-starter-mp-links oretec-web-starter-mp-links-full oretec.manifest package-lock.json package.json postcss.config.js postcss.config.mjs public README.md scaffold_admin_contact_detail.fish scaffold_contacts.fish setup_admin_auth.sh setup_admin_logout_button.fish supabase tailwind.config.js tree.txt tsconfig.json 1024 bytes
       allowed_mime_types = ARRAY['image/jpeg','image/png']
 WHERE id = 'avatars';

-- Refrescar cache de PostgREST
NOTIFY pgrst, 'reload schema';
