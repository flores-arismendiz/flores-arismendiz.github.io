# 💍 Nuestra Boda Católica - Sistema Integral de Gestión y Finanzas de Pareja

Una aplicación web completa, interactiva, reactiva y responsive (optimizada para móviles y computadoras de escritorio) diseñada especialmente para la planificación nupcial, cumplimiento de requisitos eclesiásticos católicos, ahorro en pareja y control presupuestario con un **Dashboard Analítico estilo Power BI**.

---

## 🏛️ Nueva Arquitectura de Diseño: Barra Lateral Izquierda (Sidebar Layout)

La interfaz ha sido rediseñada para ofrecer una experiencia **más compacta, moderna e intuitiva**:
- **Barra Lateral Izquierda (Sidebar Fijo):**
  - Identidad de la boda (*Monograma `✝💍`* y títulos).
  - **Widget de Cuenta Regresiva Compacto** con los días faltantes para el gran día.
  - Menú de navegación vertical estructurado con iconos nítidos y **badge en vivo con el contador de tareas pendientes**.
  - Tarjeta en el pie del sidebar con el **resumen patrimonial conjunto** (Monto ahorrado, % de meta y micro-barra de progreso).
  - En dispositivos móviles, el sidebar se convierte en un **drawer deslizante responsivo** con backdrop.
- **Topbar Compacta Superior:**
  - Migas de pan (*Breadcrumbs*) con el nombre de la sección activa.
  - Indicador rápido de **Ahorrado vs. Meta**.
  - **Botones de Acción Inmediata:** `+ Tarea` y `+ Gasto` accesibles con un solo clic desde cualquier pantalla.
- **Alta Densidad de Información:** Espaciados y tarjetas optimizadas para reducir el desplazamiento vertical y mantener toda la analítica clave a la vista.

### 2. Módulo de Ahorro y Metas en Pareja
* **Configuración de Meta:**
  * Campo editable para el **Monto Meta de Ahorro Total** con soporte para monedas **S/ (Soles)** y **$ (USD Dólares)**.
* **Formulario de Aportes Mensuales:**
  * Mes / Año (Ej. Octubre 2026).
  * Aporte individual de **Él** y aporte individual de **Ella**.
  * Comprobante o número de operación bancaria.
  * Fecha de depósito y notas adicionales.
* **Indicadores Visuales y Proyecciones:**
  * **Total Ahorrado Conjunto** con barra de progreso de lujo.
  * **Faltante para la Meta**.
  * **% de Cumplimiento**.
  * **Promedio de Ahorro Mensual**.
  * **Proyección de Meses Faltantes** calculada automáticamente al ritmo de ahorro actual.
  * **Comparativa Gráfica de Aportes:** Desglose porcentual y montos acumulados de Él vs. Ella.

### 3. Módulo de Presupuesto, Gastos y Proveedores
* **Registro de Gastos y Cotizaciones:**
  * Concepto / Servicio (Local de recepción, recuerdos, catering, etc.).
  * Proveedor y contacto.
  * Presupuesto Estimado vs. Costo Real / Pactado.
  * Monto Adelantado / Seña pagada a la fecha.
  * Estado de Pago (*Pendiente*, *Adelanto*, *Pagado Total*) con actualización automática al completar pagos.
  * Enlace a cotización o comprobante (URL o texto).
* **Control Presupuestario Tabular:**
  * Cálculo dinámico automático de **Saldo Pendiente de Pago** (`Costo Real - Adelanto Pagado`).
  * Cálculo de **Desviación** (`Costo Real - Presupuesto Estimado`) con badges semafóricos (Verde = Ahorro / Rojo = Sobrecosto).
  * Botón de **"Pagar Saldo" rápido** para liquidar pagos con un clic.
  * Filtros por estado de pago, categoría y buscador.

### 4. Módulo de Reportes y Dashboard Analítico (Estilo Power BI)
* **Tarjetas KPI Ejecutivas:**
  * **Presupuesto General:** Total Presupuestado vs. Total Contratado/Real vs. Total Pagado a la fecha.
  * **Meta de Ahorro:** Total Ahorrado vs. Meta (% de cumplimiento con micro-medidor).
  * **Avance de la Boda:** Tareas y trámites completados vs. Total (% de avance).
* **Semáforo de Desviación Financiera (Alerta de Salud):**
  * Analiza en tiempo real si el fondo de ahorro conjunto cubre los gastos comprometidos y pagos pendientes.
  * Luces activas (*Verde*, *Amarillo*, *Rojo*) con diagnóstico y recomendación clara.
* **Componentes Gráficos Interactivos (Chart.js):**
  1. **Gráfico de Dona:** Distribución del Gasto Real por Categorías con tooltips y porcentajes.
  2. **Gráfico de Barras Comparativo:** Presupuesto Estimado vs. Gasto Real por Categoría para auditoría visual inmediata.
  3. **Gráfico de Área y Líneas:** Evolución del ahorro mensual acumulado a lo largo del tiempo (Línea Él, Línea Ella y Fondo Conjunto).
* **Próximos Vencimientos:** Resumen de trámites prioritarios y accesos rápidos.

### 5. Exportación y Respaldo
* **Exportar a CSV / Excel:**
  * Reporte de Presupuesto con fórmulas y columnas en formato UTF-8 (con BOM para compatibilidad total con Microsoft Excel en español).
  * Lista de Pendientes y Cronograma.
  * Historial de Ahorros.
* **Copia de Seguridad Completa (JSON):**
  * Descargar respaldo integral de la base de datos para transferirlo entre novios.
  * Restaurar respaldo desde archivo local.
  * Botón para restaurar los datos de demostración o vaciar base de datos.

---

## 🚀 Instrucciones de Ejecución y Despliegue

La aplicación está construida con arquitectura modular moderna (HTML5, Vanilla CSS de Alta Fidelidad y ES6 Modules), sin requerir pesados procesos de compilación.

### Opción 1: Ejecutar con Node.js (Recomendado)
Desde la terminal en la carpeta del proyecto:
```bash
# Iniciar el servidor local incluido (cero dependencias externas requeridas)
node server.js
```
O también:
```bash
npm start
```
Luego abre tu navegador en:
👉 **`http://localhost:3000`**

### Opción 2: Ejecutar con Python
```bash
python -m http.server 3000
```
Luego abre tu navegador en:
👉 **`http://localhost:3000`**

### Opción 3: Despliegue en Google Antigravity o Servidor Web Estático
Puedes subir los archivos directamente a cualquier servidor web o servicio de hosting (Firebase Hosting, GitHub Pages, Vercel, Netlify o Google Cloud Storage):
- `index.html`
- `/css/styles.css`
- `/js/` (todos los módulos)

El panel administrativo utiliza Supabase como fuente de datos y requiere iniciar sesión. Para configurar el proyecto, sigue estos pasos:

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. En **SQL Editor**, ejecuta en orden [`supabase/migrations/20261020000000_initial_schema.sql`](./supabase/migrations/20261020000000_initial_schema.sql) y [`supabase/migrations/20261020010000_public_wedding_site.sql`](./supabase/migrations/20261020010000_public_wedding_site.sql).
3. En **Project Settings → API**, copia la **Project URL** y la clave pública **anon** (o **publishable**) en `SUPABASE_URL` y `SUPABASE_ANON_KEY` de [`js/supabase-config.js`](./js/supabase-config.js). Esas dos variables son públicas para este frontend; nunca uses una clave `service_role` ni una clave secreta.
4. Habilita **Email** en **Authentication → Sign In / Providers**. Abre la aplicación, pulsa **Conectar nube** y crea una cuenta o inicia sesión. Para compartir los datos con tu pareja, ambos dispositivos pueden iniciar sesión con la misma cuenta.

Las migraciones crean tablas independientes para preferencias, configuración pública de boda, categorías, tareas, ahorros, gastos, invitados y plantillas. Row Level Security (RLS) restringe las operaciones autenticadas al usuario propietario. El panel administrativo requiere iniciar sesión y carga sus datos desde Supabase; si no se puede conectar, no muestra los datos locales como sustituto. La página pública de invitación consulta la configuración publicada y el invitado mediante funciones RPC; la tabla de invitados no se abre públicamente.

Al iniciar sesión por primera vez, si la cuenta aún no tiene datos, los datos actuales del navegador se importan una vez a Supabase. A partir de ahí, las lecturas y los cambios se sincronizan con la base de datos. Para la invitación pública, los cambios de configuración se publican automáticamente al guardar desde el panel.

---

## 🎨 Paleta de Diseño y Tipografía
- **Champagne Gold:** `#C5A059` / `#B89047`
- **Blush Rose (Ella):** `#DB2777` / `#FDF2F8`
- **Royal Slate Blue (Él):** `#2563EB` / `#EFF6FF`
- **Marfil & Blanco Puro:** `#F8F6F2` / `#FFFFFF`
- **Tipografía de Títulos:** *Playfair Display* (Editorial romana elegante)
- **Tipografía de Datos y Tablas:** *Plus Jakarta Sans* y *JetBrains Mono*
