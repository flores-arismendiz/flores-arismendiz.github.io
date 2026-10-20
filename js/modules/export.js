// Módulo de Exportación (CSV/Excel) y Respaldo de Datos
import { store } from '../store.js';

export function initExportModule() {
  renderExportView();
}

export function renderExportView() {
  const container = document.getElementById('export-view-container');
  if (!container) return;

  const state = store.getState();
  const metrics = store.getMetrics();
  const currency = metrics.currency;

  container.innerHTML = `
    <div class="module-header">
      <div class="module-title-area">
        <div class="module-icon-wrap export-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
        <div>
          <h2 class="module-title">Exportación de Reportes y Respaldo</h2>
          <p class="module-subtitle">Descarga de informes en Excel/CSV y copias de seguridad de los datos de la boda</p>
        </div>
      </div>
    </div>

    <div class="export-grid">
      <!-- Tarjeta 1: Exportar Presupuesto y Gastos -->
      <div class="card export-card">
        <div class="export-card-icon excel-green">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <h3 class="export-title">Reporte de Presupuesto y Proveedores</h3>
        <p class="export-desc">Incluye Concepto, Categoría, Proveedor, Estimado, Costo Real, Adelantos, Saldo Pendiente y Desviación con fórmulas compatibles con Microsoft Excel.</p>
        <button class="btn btn-primary btn-block" id="btn-export-budget-csv">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path></svg>
          Exportar Presupuesto (.CSV / Excel)
        </button>
      </div>

      <!-- Tarjeta 2: Exportar Lista de Tareas y Pendientes -->
      <div class="card export-card">
        <div class="export-card-icon task-blue">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <h3 class="export-title">Lista de Pendientes y Trámites</h3>
        <p class="export-desc">Descarga completa del checklist eclesiástico y nupcial con fechas límite, responsable (Él, Ella, Ambos), prioridad y estado.</p>
        <button class="btn btn-primary btn-block" id="btn-export-tasks-csv">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path></svg>
          Exportar Pendientes (.CSV / Excel)
        </button>
      </div>

      <!-- Tarjeta 3: Exportar Historial de Ahorros -->
      <div class="card export-card">
        <div class="export-card-icon gold-badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="20"></line><line x1="12" y1="4" x2="12" y2="6"></line></svg>
        </div>
        <h3 class="export-title">Historial de Ahorros en Pareja</h3>
        <p class="export-desc">Registro detallado mes a mes de los aportes individuales de Él, de Ella, suma conjunta y comprobantes bancarios anotados.</p>
        <button class="btn btn-primary btn-block" id="btn-export-savings-csv">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path></svg>
          Exportar Ahorros (.CSV / Excel)
        </button>
      </div>
    </div>

    <!-- Sección de Copia de Seguridad Completa (Backup & Restore) -->
    <div class="section-block mt-4">
      <div class="card backup-card">
        <div class="backup-header">
          <div>
            <h3 class="backup-title">Copia de Seguridad y Sincronización entre Dispositivos</h3>
            <p class="backup-desc">Guarda todo el estado de la boda en un archivo de respaldo o transfiérelo al teléfono de tu pareja.</p>
          </div>
        </div>
        <div class="backup-actions-row">
          <button class="btn btn-outline" id="btn-backup-json">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Descargar Respaldo Completo (.JSON)
          </button>
          <label class="btn btn-outline" style="cursor: pointer; margin: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Restaurar desde Archivo (.JSON)
            <input type="file" id="file-restore-json" accept=".json" style="display: none;">
          </label>
          <button class="btn btn-outline text-amber" id="btn-reset-demo">
            Restaurar Datos de Demostración
          </button>
          <button class="btn btn-danger-outline" id="btn-clear-database">
            Vaciar Todo
          </button>
        </div>
      </div>
    </div>
  `;

  attachExportHandlers();
}

function attachExportHandlers() {
  // Exportar Presupuesto CSV
  const btnBudgetCsv = document.getElementById('btn-export-budget-csv');
  if (btnBudgetCsv) {
    btnBudgetCsv.onclick = () => exportBudgetCsv();
  }

  // Exportar Tareas CSV
  const btnTasksCsv = document.getElementById('btn-export-tasks-csv');
  if (btnTasksCsv) {
    btnTasksCsv.onclick = () => exportTasksCsv();
  }

  // Exportar Ahorros CSV
  const btnSavingsCsv = document.getElementById('btn-export-savings-csv');
  if (btnSavingsCsv) {
    btnSavingsCsv.onclick = () => exportSavingsCsv();
  }

  // Backup JSON
  const btnBackupJson = document.getElementById('btn-backup-json');
  if (btnBackupJson) {
    btnBackupJson.onclick = () => {
      const dataStr = JSON.stringify(store.getState(), null, 2);
      downloadFile(dataStr, `boda_catolica_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      showToast('Copia de seguridad descargada');
    };
  }

  // Restore JSON
  const fileRestore = document.getElementById('file-restore-json');
  if (fileRestore) {
    fileRestore.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (store.loadImportedData(parsed)) {
            showToast('Datos restaurados correctamente');
            window.navigateToTab('dashboard');
          } else {
            alert('El archivo no contiene un formato válido.');
          }
        } catch (err) {
          alert('Error al leer el archivo JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
  }

  // Reset Demo
  const btnResetDemo = document.getElementById('btn-reset-demo');
  if (btnResetDemo) {
    btnResetDemo.onclick = () => {
      if (confirm('¿Restablecer todos los datos a la configuración inicial de ejemplo para Boda Católica?')) {
        store.resetToSampleData();
        showToast('Datos de demostración restablecidos');
        window.navigateToTab('dashboard');
      }
    };
  }

  // Clear Database
  const btnClearDb = document.getElementById('btn-clear-database');
  if (btnClearDb) {
    btnClearDb.onclick = () => {
      if (confirm('ADVERTENCIA: ¿Estás seguro de vaciar toda la información y comenzar desde cero?')) {
        store.clearAllData();
        showToast('Base de datos vaciada');
        window.navigateToTab('dashboard');
      }
    };
  }
}

function exportBudgetCsv() {
  const state = store.getState();
  const expenses = state.expenses;
  const currency = state.settings.currency || 'S/';
  const groomName = state.settings.groomName || 'Novio';
  const brideName = state.settings.brideName || 'Novia';

  // Mapa de scope a etiqueta legible
  const scopeLabel = { 'Novio': groomName, 'Novia': brideName, 'Conjunto': 'Conjunto' };

  let csv = '\uFEFF'; // BOM para soporte UTF-8 en Excel (tildes, etc.)
  csv += 'Concepto / Servicio;Categoría;Responsable;Proveedor;Presupuesto Estimado;Costo Real;Adelanto Pagado;Saldo Pendiente;Desviación;Estado de Pago;Cotización/Enlace;Notas\n';

  expenses.forEach(e => {
    const pending = Math.max(0, (e.actualCost || 0) - (e.advancePaid || 0));
    const dev = (e.actualCost || 0) - (e.estimatedBudget || 0);

    const row = [
      escapeCsv(e.concept),
      escapeCsv(e.category),
      escapeCsv(scopeLabel[e.scope] || 'Conjunto'),
      escapeCsv(e.supplier || ''),
      (e.estimatedBudget || 0).toFixed(2),
      (e.actualCost || 0).toFixed(2),
      (e.advancePaid || 0).toFixed(2),
      pending.toFixed(2),
      dev.toFixed(2),
      escapeCsv(e.paymentStatus),
      escapeCsv(e.quoteUrl || ''),
      escapeCsv(e.notes || '')
    ];
    csv += row.join(';') + '\n';
  });

  downloadFile(csv, `presupuesto_boda_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  showToast('Presupuesto exportado en CSV/Excel');
}

function exportTasksCsv() {
  const state = store.getState();
  const tasks = state.tasks;

  let csv = '\uFEFF';
  csv += 'Nombre del Pendiente;Categoría;Asignado a;Fecha Límite;Estado;Prioridad;Notas / Observaciones\n';

  tasks.forEach(t => {
    const row = [
      escapeCsv(t.title),
      escapeCsv(t.category),
      escapeCsv(t.assignedTo),
      escapeCsv(t.dueDate || ''),
      escapeCsv(t.status),
      escapeCsv(t.priority),
      escapeCsv(t.notes || '')
    ];
    csv += row.join(';') + '\n';
  });

  downloadFile(csv, `pendientes_boda_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  showToast('Lista de tareas exportada en CSV/Excel');
}

function exportSavingsCsv() {
  const state = store.getState();
  const savings = state.savings;

  let csv = '\uFEFF';
  csv += 'Mes / Periodo;Fecha Depósito;Aporte Él;Aporte Ella;Total Mes;Comprobante / Operación;Notas\n';

  savings.forEach(s => {
    const totalMonth = (s.amountGroom || 0) + (s.amountBride || 0);
    const row = [
      escapeCsv(s.monthYear),
      escapeCsv(s.date || ''),
      (s.amountGroom || 0).toFixed(2),
      (s.amountBride || 0).toFixed(2),
      totalMonth.toFixed(2),
      escapeCsv(s.receipt || ''),
      escapeCsv(s.notes || '')
    ];
    csv += row.join(';') + '\n';
  });

  downloadFile(csv, `ahorros_boda_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  showToast('Historial de ahorros exportado en CSV/Excel');
}

function escapeCsv(str) {
  if (str === null || str === undefined) return '""';
  const s = String(str).replace(/"/g, '""');
  return `"${s}"`;
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showToast(message) {
  const toast = document.getElementById('global-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}
