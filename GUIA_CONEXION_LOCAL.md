# Guía de Conexión y Ejecución Local - Resico Fácil

## 📋 Prerrequisitos

- Node.js 18+ o Bun instalado
- Cuenta en Supabase (gratis en https://supabase.com)
- Navegador web moderno

---

## 🔧 PASO 1: Configurar Supabase

### 1.1 Crear proyecto en Supabase
1. Ve a https://supabase.com y crea una cuenta gratuita
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name**: `resico-facil`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Elige la más cercana a México (us-east-1 o similar)
4. Espera ~2 minutos a que se cree el proyecto

### 1.2 Obtener credenciales
1. En tu proyecto, ve a **Settings** → **API**
2. Copia estos dos valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.3 Ejecutar migraciones SQL
1. Ve a **SQL Editor** en Supabase
2. Copia y pega el contenido del archivo `supabase/migrations/initial_schema.sql`
3. Ejecuta el script completo
4. Verifica que se crearon las tablas en **Table Editor**

### 1.4 Configurar Storage Buckets
1. Ve a **Storage** en el menú izquierdo
2. Crea los siguientes buckets (públicos o privados según necesites):
   - `taxpayer-documents`
   - `expense-receipts`
   - `identity-documents`
   - `declaration-pdfs`
   - `support-files`
   - `tutorial-resources`

3. Para cada bucket, configura políticas RLS si son privados

---

## 💻 PASO 2: Configurar Variables de Entorno

### 2.1 Crear archivo .env.local
El archivo ya está creado en `/workspace/.env.local`. Edítalo con tus credenciales:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-completo-aqui
```

### 2.2 Verificar archivo
Asegúrate de que no haya espacios ni saltos de línea extra en las claves.

---

## 🚀 PASO 3: Instalar Dependencias

### Opción A: Usando npm (recomendado)
```bash
npm install
```

### Opción B: Usando Bun (más rápido)
```bash
bun install
```

---

## ▶️ PASO 4: Ejecutar en Local

### Desarrollo con hot-reload
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

### Construcción para producción
```bash
npm run build
npm run preview
```

---

## 🧪 PASO 5: Probar la Aplicación

### 5.1 Registro de usuario
1. Abre http://localhost:5173
2. Haz clic en "Registrarse"
3. Completa el formulario con:
   - Email válido
   - Contraseña segura
   - Nombre completo
4. Confirma tu email (si está habilitado) o usa modo desarrollo

### 5.2 Completar perfil fiscal
1. Después de registrarte, completa tu perfil:
   - RFC (12 o 13 caracteres)
   - CURP
   - Régimen fiscal (RESICO)
   - Actividad económica
   - Teléfono y domicilio

### 5.3 Registrar ingresos/gastos
1. Ve a la sección "Ingresos y Gastos"
2. Agrega registros de prueba
3. Sube comprobantes (opcional)

### 5.4 Verificar en Supabase
1. Ve a **Table Editor** en Supabase
2. Revisa las tablas:
   - `profiles`
   - `taxpayer_profiles`
   - `income_records`
   - `expense_records`

---

## 🔐 Configuración Adicional de Seguridad

### Habilitar Email Confirmation (opcional)
1. En Supabase: **Authentication** → **Providers** → **Email**
2. Activa "Enable Email Confirmation"
3. Configura templates de email si lo deseas

### Configurar Políticas RLS
Las políticas ya están incluidas en el script SQL inicial. Verifica que:
- ✅ Los usuarios solo ven sus propios datos
- ✅ Los contadores solo ven clientes asignados
- ✅ Los administradores tienen acceso controlado

---

## 🛠️ Solución de Problemas Comunes

### Error: "Invalid API key"
- Verifica que copiaste correctamente `VITE_SUPABASE_ANON_KEY`
- Asegúrate de que no hay espacios al inicio/final
- Reinicia el servidor de desarrollo

### Error: "relation does not exist"
- Ejecutaste el script SQL en Supabase?
- Verifica en **Table Editor** que las tablas existen
- Revisa los nombres de tablas en el código

### Error: CORS o permisos de Storage
- En Supabase: **Storage** → Selecciona bucket → **Policies**
- Agrega política para usuarios autenticados:
```sql
CREATE POLICY "Usuarios autenticados pueden subir archivos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'taxpayer-documents');
```

### La app no carga datos
1. Abre DevTools del navegador (F12)
2. Ve a **Console** y busca errores
3. Verifica **Network** para ver peticiones fallidas
4. Confirma que las políticas RLS permiten el acceso

---

## 📱 Modo Offline / PWA

La aplicación soporta funcionamiento parcial sin conexión:

1. Los datos se guardan localmente con IndexedDB
2. Al recuperar conexión, se sincronizan automáticamente
3. Puedes registrar ingresos/gastos sin internet

Para probar:
1. Abre DevTools → **Application** → **Service Workers**
2. Simula offline
3. Registra datos
4. Vuelve online y verifica sincronización

---

## 🎯 Siguientes Pasos

Después de tener la app corriendo localmente:

1. **Personaliza branding**: Colores, logo, nombre
2. **Agrega datos de prueba**: Usa scripts seed
3. **Prueba flujos completos**: Registro → Perfil → Ingresos → Declaración
4. **Configura contadores**: Crea cuentas de contador y asigna clientes
5. **Prepara despliegue**: Vercel, Netlify o Cloudflare Pages

---

## 📞 Soporte

Si tienes problemas:
1. Revisa logs en consola del navegador
2. Verifica logs en Supabase (**Logs** → **Edge Functions**)
3. Consulta documentación: `/docs/README.md`

¡Tu aplicación Resico Fácil está lista para operar! 🎉
