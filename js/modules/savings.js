// Módulo 2: Ahorro y Metas en Pareja
import { store } from '../store.js';

let editingSavingId = null;

export function initSavingsModule() {
  renderSavingsView();
  setupSavingsEventListeners();
}

export function renderSavingsView() {
  const container = document.getElementById('savings-view-container');
  if (!container) return;

  const state = store.getState();
  const metrics = store.getMetrics();
  const savings = [...state.savings].reverse(); // mostrar más recientes primero en tabla
  const currency = metrics.currency;

  container.innerHTML = `
    <div class="module-header">
      <div class="module-title-area">
        <div class="module-icon-wrap savings-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div>
          <h2 class="module-title">Fondo de Ahorro y Metas en Pareja</h2>
          <p class="module-subtitle">Planificación patrimonial, aportes conjuntos y proyección hacia la meta</p>
        </div>
      </div>
      <div class="module-actions">
        <button class="btn btn-primary" id="btn-open-saving-modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Registrar Aporte Mensual
        </button>
      </div>
    </div>

    <!-- Panel de Configuración de Meta y Tarjetas de Avance -->
    <div class="savings-top-grid">
      <!-- Tarjeta de Configuración de Meta -->
      <div class="card meta-config-card">
        <div class="card-header-clean">
          <span class="card-badge-pill">Configuración</span>
          <h3 class="card-clean-title">Meta Global de Ahorro</h3>
        </div>
        <form id="goal-settings-form" class="goal-form">
          <div class="form-row">
            <div class="form-group col-4">
              <label class="form-label" for="setting-currency">Moneda</label>
              <select id="setting-currency" class="form-select">
                <option value="S/" ${currency === 'S/' ? 'selected' : ''}>S/ (Soles)</option>
                <option value="$" ${currency === '$' ? 'selected' : ''}>$ (USD Dólares)</option>
              </select>
            </div>
            <div class="form-group col-8">
              <label class="form-label" for="setting-goal">Monto Meta Total</label>
              <div class="input-currency-wrap">
                <span class="currency-prefix">${currency}</span>
                <input type="number" id="setting-goal" class="form-control" min="0" step="100" value="${metrics.savingsGoal}">
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-outline btn-block mt-2" id="btn-save-goal">
            Actualizar Meta Financiera
          </button>
        </form>
      </div>

      <!-- Tarjeta de Progreso Principal (KPI) -->
      <div class="card savings-hero-card">
        <div class="hero-card-header">
          <div>
            <span class="hero-label">Total Ahorrado Conjunto</span>
            <div class="hero-amount">${currency} ${metrics.totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div class="goal-target-badge">
            <span>Meta: ${currency} ${metrics.savingsGoal.toLocaleString()}</span>
          </div>
        </div>

        <div class="savings-progress-section">
          <div class="progress-bar-legend">
            <span>Avance hacia la meta</span>
            <strong class="text-gold">${metrics.savingsProgressPct.toFixed(1)}%</strong>
          </div>
          <div class="progress-bar-lux">
            <div class="progress-bar-lux-fill" style="width: ${metrics.savingsProgressPct}%"></div>
          </div>
        </div>

        <div class="savings-submetrics-grid">
          <div class="submetric-box">
            <span class="submetric-title">Faltante para la Meta</span>
            <span class="submetric-value text-amber">${currency} ${metrics.remainingToGoal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="submetric-box">
            <span class="submetric-title">Promedio Mensual</span>
            <span class="submetric-value">${currency} ${metrics.monthlyAverageSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="submetric-box">
            <span class="submetric-title">Proyección Restante</span>
            <span class="submetric-value text-gold">${metrics.projectedMonthsToGoal} ${metrics.projectedMonthsToGoal === 1 ? 'mes' : 'meses'}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparativa Aportes Él vs Ella -->
    <div class="couple-split-card shadow-card">
      <div class="couple-split-header">
        <h4>Distribución Acumulada de Aportes</h4>
        <span class="text-muted">Participación equitativa en el fondo común</span>
      </div>
      <div class="couple-split-body">
        <div class="partner-stat groom-stat">
          <div class="partner-avatar">🤵</div>
          <div class="partner-info">
            <span class="partner-name">Aporte de Él</span>
            <span class="partner-amount">${currency} ${metrics.totalGroomSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span class="partner-pct">${metrics.totalSaved > 0 ? ((metrics.totalGroomSaved / metrics.totalSaved) * 100).toFixed(1) : 0}% del fondo</span>
          </div>
        </div>

        <div class="split-divider-line">
          <div class="split-heart">💍</div>
        </div>

        <div class="partner-stat bride-stat">
          <div class="partner-avatar">👰</div>
          <div class="partner-info">
            <span class="partner-name">Aporte de Ella</span>
            <span class="partner-amount">${currency} ${metrics.totalBrideSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span class="partner-pct">${metrics.totalSaved > 0 ? ((metrics.totalBrideSaved / metrics.totalSaved) * 100).toFixed(1) : 0}% del fondo</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla Histórica de Aportes -->
    <div class="section-block">
      <div class="section-title-row">
        <h3 class="section-title">Historial Mensual de Aportes</h3>
        <span class="badge badge-light">${state.savings.length} depósitos registrados</span>
      </div>

      <div class="table-container shadow-card">
        <table class="data-table compact-table savings-table">
          <thead>
            <tr>
              <th>Mes / Fecha Depósito</th>
              <th class="text-right">Aportes Él / Ella</th>
              <th class="text-right">Total del Mes</th>
              <th>Comprobante / Notas</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${savings.length === 0 ? `
              <tr>
                <td colspan="5" class="text-center py-4">No se han registrado aportes mensuales todavía.</td>
              </tr>
            ` : savings.map(s => {
              const monthTotal = (s.amountGroom || 0) + (s.amountBride || 0);
              return `
                <tr>
                  <td>
                    <div class="compact-cell-stack">
                      <strong>${s.monthYear}</strong>
                      <span class="cell-sub-label">📅 ${s.date ? formatDate(s.date) : '-'}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="compact-cell-stack">
                      <span class="text-groom font-mono font-bold">🤵 Él: ${currency} ${(s.amountGroom || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <span class="text-bride font-mono font-bold">👰 Ella: ${currency} ${(s.amountBride || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </td>
                  <td class="text-right font-bold font-mono text-gold font-lg">
                    ${currency} ${monthTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div class="table-task-info">
                      <span class="receipt-note" title="${s.receipt || ''}">${s.receipt || 'Aporte regular'}</span>
                      ${s.notes ? `<span class="table-task-subnote">${s.notes}</span>` : ''}
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="action-buttons-wrap">
                      <button class="btn btn-outline btn-xs btn-edit-saving" data-id="${s.id}" title="Editar">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button class="btn btn-danger-outline btn-xs btn-delete-saving" data-id="${s.id}" title="Eliminar">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  attachSavingsHandlers();
}

function attachSavingsHandlers() {
  // Guardar configuración de meta
  const goalForm = document.getElementById('goal-settings-form');
  if (goalForm) {
    goalForm.onsubmit = (e) => {
      e.preventDefault();
      const currency = document.getElementById('setting-currency').value;
      const savingsGoal = parseFloat(document.getElementById('setting-goal').value) || 0;
      store.updateSettings({ currency, savingsGoal });
      renderSavingsView();
      showToast('Meta y moneda actualizadas correctamente');
    };
  }

  // Abrir modal de nuevo aporte
  const openModalBtn = document.getElementById('btn-open-saving-modal');
  if (openModalBtn) {
    openModalBtn.onclick = () => openSavingModal(null);
  }

  // Botones de editar aporte
  document.querySelectorAll('.btn-edit-saving').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      openSavingModal(id);
    };
  });

  // Botones de eliminar aporte
  document.querySelectorAll('.btn-delete-saving').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Eliminar este registro de aporte mensual?')) {
        store.deleteSaving(id);
        renderSavingsView();
        showToast('Registro de ahorro eliminado');
      }
    };
  });
}

export function openSavingModal(savingId = null) {
  editingSavingId = savingId;
  const state = store.getState();
  const existingSaving = savingId ? state.savings.find(s => s.id === savingId) : null;
  const currency = state.settings.currency || 'S/';

  const modalOverlay = document.getElementById('global-modal-overlay');
  const modalContent = document.getElementById('global-modal-body');
  if (!modalOverlay || !modalContent) return;

  const defaultMonthYear = getCurrentMonthYearName();
  const today = new Date().toISOString().split('T')[0];

  const savingData = existingSaving || {
    monthYear: defaultMonthYear,
    date: today,
    amountGroom: '',
    amountBride: '',
    receipt: '',
    notes: ''
  };

  modalContent.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">${existingSaving ? 'Editar Aporte Mensual' : 'Registrar Aporte Mensual de Pareja'}</h3>
        <button class="modal-close-btn" id="btn-close-modal">&times;</button>
      </div>
      <form id="saving-form" class="modal-form">
        <div class="form-row">
          <div class="form-group col-6">
            <label class="form-label" for="saving-month-year">Mes / Periodo <span class="text-danger">*</span></label>
            <input type="text" id="saving-month-year" class="form-control" required placeholder="Ej. Noviembre 2026" value="${savingData.monthYear}">
          </div>
          <div class="form-group col-6">
            <label class="form-label" for="saving-date">Fecha de Depósito</label>
            <input type="date" id="saving-date" class="form-control" value="${savingData.date}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-6">
            <label class="form-label" for="saving-amount-groom">Aporte de Él (${currency}) <span class="text-danger">*</span></label>
            <input type="number" id="saving-amount-groom" class="form-control" min="0" step="0.01" required placeholder="0.00" value="${savingData.amountGroom}">
          </div>
          <div class="form-group col-6">
            <label class="form-label" for="saving-amount-bride">Aporte de Ella (${currency}) <span class="text-danger">*</span></label>
            <input type="number" id="saving-amount-bride" class="form-control" min="0" step="0.01" required placeholder="0.00" value="${savingData.amountBride}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="saving-receipt">Comprobante / N° Operación (Opcional)</label>
          <input type="text" id="saving-receipt" class="form-control" placeholder="Ej. Depósito cuenta mancomunada BBVA #4490" value="${savingData.receipt || ''}">
        </div>

        <div class="form-group">
          <label class="form-label" for="saving-notes">Notas / Observaciones</label>
          <textarea id="saving-notes" class="form-control" rows="2" placeholder="Observaciones adicionales, bonos o conceptos especiales...">${savingData.notes || ''}</textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="btn-cancel-modal">Cancelar</button>
          <button type="submit" class="btn btn-primary">${existingSaving ? 'Guardar Cambios' : 'Registrar Aporte'}</button>
        </div>
      </form>
    </div>
  `;

  modalOverlay.classList.add('active');

  const closeBtn = document.getElementById('btn-close-modal');
  const cancelBtn = document.getElementById('btn-cancel-modal');
  const closeModal = () => modalOverlay.classList.remove('active');
  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;

  const form = document.getElementById('saving-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const monthYear = document.getElementById('saving-month-year').value.trim();
      const date = document.getElementById('saving-date').value;
      const amountGroom = parseFloat(document.getElementById('saving-amount-groom').value) || 0;
      const amountBride = parseFloat(document.getElementById('saving-amount-bride').value) || 0;
      const receipt = document.getElementById('saving-receipt').value.trim();
      const notes = document.getElementById('saving-notes').value.trim();

      if (editingSavingId) {
        store.updateSaving(editingSavingId, { monthYear, date, amountGroom, amountBride, receipt, notes });
      } else {
        store.addSaving({ monthYear, date, amountGroom, amountBride, receipt, notes });
      }

      closeModal();
      renderSavingsView();
      showToast('Aporte mensual guardado con éxito');
    };
  }
}

function setupSavingsEventListeners() {
  store.subscribe(() => {
    const container = document.getElementById('savings-view-container');
    if (container && container.offsetParent !== null) {
      renderSavingsView();
    }
  });
}

function getCurrentMonthYearName() {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function showToast(message) {
  const toast = document.getElementById('global-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}
