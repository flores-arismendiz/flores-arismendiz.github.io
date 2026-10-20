// Módulo 3: Presupuesto, Gastos y Proveedores
import { store } from '../store.js';

let currentBudgetFilter = {
  category: 'all',
  paymentStatus: 'all',
  scope: 'all',
  search: ''
};

let editingExpenseId = null;

export function initBudgetModule() {
  renderBudgetView();
  setupBudgetEventListeners();
}

// Helpers de scope
const SCOPE_CONFIG = {
  'Novio': { label: '🤵 Novio', cls: 'badge-groom' },
  'Novia': { label: '👰 Novia', cls: 'badge-bride' },
  'Conjunto': { label: '💑 Conjunto', cls: 'badge-info' }
};

function scopeBadge(scope) {
  const cfg = SCOPE_CONFIG[scope] || SCOPE_CONFIG['Conjunto'];
  return `<span class="badge ${cfg.cls}">${cfg.label}</span>`;
}

export function renderBudgetView() {
  const container = document.getElementById('budget-view-container');
  if (!container) return;

  const state = store.getState();
  const metrics = store.getMetrics();
  const expenses = state.expenses;
  const categories = state.categories;
  const currency = metrics.currency;
  const groomName = state.settings.groomName || 'Novio';
  const brideName = state.settings.brideName || 'Novia';

  // Filtrado de gastos
  const filteredExpenses = expenses.filter(exp => {
    if (currentBudgetFilter.category !== 'all' && exp.category !== currentBudgetFilter.category) return false;
    if (currentBudgetFilter.paymentStatus !== 'all' && exp.paymentStatus !== currentBudgetFilter.paymentStatus) return false;
    if (currentBudgetFilter.scope !== 'all' && exp.scope !== currentBudgetFilter.scope) return false;
    if (currentBudgetFilter.search.trim()) {
      const q = currentBudgetFilter.search.toLowerCase();
      const matchConcept = exp.concept.toLowerCase().includes(q);
      const matchSupplier = (exp.supplier || '').toLowerCase().includes(q);
      const matchNotes = (exp.notes || '').toLowerCase().includes(q);
      if (!matchConcept && !matchSupplier && !matchNotes) return false;
    }
    return true;
  });

  // Totales de la selección filtrada
  const fTotalEstimated = filteredExpenses.reduce((acc, e) => acc + (e.estimatedBudget || 0), 0);
  const fTotalActual = filteredExpenses.reduce((acc, e) => acc + (e.actualCost || 0), 0);
  const fTotalPaid = filteredExpenses.reduce((acc, e) => acc + (e.advancePaid || 0), 0);
  const fTotalPending = Math.max(0, fTotalActual - fTotalPaid);
  const fTotalDeviation = fTotalActual - fTotalEstimated;

  // Totales diferenciados por scope (sobre todos los gastos, no solo filtrados)
  const groomTotal = expenses.filter(e => e.scope === 'Novio').reduce((a, e) => a + (e.actualCost || 0), 0);
  const brideTotal = expenses.filter(e => e.scope === 'Novia').reduce((a, e) => a + (e.actualCost || 0), 0);
  const jointTotal = expenses.filter(e => e.scope === 'Conjunto' || !e.scope).reduce((a, e) => a + (e.actualCost || 0), 0);

  const hasActiveFilter = currentBudgetFilter.category !== 'all'
    || currentBudgetFilter.paymentStatus !== 'all'
    || currentBudgetFilter.scope !== 'all'
    || currentBudgetFilter.search;

  container.innerHTML = `
    <div class="module-header">
      <div class="module-title-area">
        <div class="module-icon-wrap budget-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div>
          <h2 class="module-title">Presupuesto, Gastos y Proveedores</h2>
          <p class="module-subtitle">Control de cotizaciones, pagos adelantados, saldos por liquidar y desviaciones</p>
        </div>
      </div>
      <div class="module-actions">
        <button class="btn btn-primary" id="btn-open-expense-modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Registrar Gasto / Cotización
        </button>
      </div>
    </div>

    <!-- 4 Tarjetas Rápidas de Resumen Presupuestal -->
    <div class="budget-kpi-grid">
      <div class="card budget-kpi-card">
        <span class="budget-kpi-label">Presupuesto Estimado</span>
        <div class="budget-kpi-value">${currency} ${metrics.totalEstimatedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <span class="budget-kpi-sub">Cálculo inicial proyectado</span>
      </div>

      <div class="card budget-kpi-card">
        <span class="budget-kpi-label">Costo Real / Contratado</span>
        <div class="budget-kpi-value text-gold">${currency} ${metrics.totalActualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <span class="budget-kpi-sub">Monto total con contratos</span>
      </div>

      <div class="card budget-kpi-card">
        <span class="budget-kpi-label">Adelantos / Pagado</span>
        <div class="budget-kpi-value text-success">${currency} ${metrics.totalAdvancePaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <span class="budget-kpi-sub">${metrics.totalActualCost > 0 ? ((metrics.totalAdvancePaid / metrics.totalActualCost) * 100).toFixed(1) : 0}% cancelado a la fecha</span>
      </div>

      <div class="card budget-kpi-card">
        <span class="budget-kpi-label">Saldo Pendiente de Pago</span>
        <div class="budget-kpi-value text-amber">${currency} ${metrics.totalPendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <span class="budget-kpi-sub">Por liquidar a proveedores</span>
      </div>
    </div>

    <!-- Desglose por Responsable (Novio / Novia / Conjunto) -->
    <div class="budget-scope-summary-bar">
      <div class="scope-summary-item scope-groom">
        <span class="scope-icon">🤵</span>
        <div class="scope-info">
          <span class="scope-label">${groomName}</span>
          <span class="scope-amount">${currency} ${groomTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <span class="scope-count">${expenses.filter(e => e.scope === 'Novio').length} ítem(s)</span>
      </div>
      <div class="scope-summary-sep">+</div>
      <div class="scope-summary-item scope-bride">
        <span class="scope-icon">👰</span>
        <div class="scope-info">
          <span class="scope-label">${brideName}</span>
          <span class="scope-amount">${currency} ${brideTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <span class="scope-count">${expenses.filter(e => e.scope === 'Novia').length} ítem(s)</span>
      </div>
      <div class="scope-summary-sep">+</div>
      <div class="scope-summary-item scope-joint">
        <span class="scope-icon">💑</span>
        <div class="scope-info">
          <span class="scope-label">Conjunto</span>
          <span class="scope-amount">${currency} ${jointTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <span class="scope-count">${expenses.filter(e => e.scope === 'Conjunto' || !e.scope).length} ítem(s)</span>
      </div>
    </div>

    <!-- Barra de Filtros -->
    <div class="filters-card">
      <div class="filter-group filter-search">
        <label>Buscar</label>
        <div class="search-input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="budget-filter-search" placeholder="Buscar por concepto o proveedor..." value="${currentBudgetFilter.search}">
        </div>
      </div>
      <div class="filter-group">
        <label>Categoría</label>
        <select id="budget-filter-category" class="form-select">
          <option value="all">Todas las categorías</option>
          ${categories.map(c => `<option value="${c}" ${currentBudgetFilter.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Responsable</label>
        <select id="budget-filter-scope" class="form-select">
          <option value="all" ${currentBudgetFilter.scope === 'all' ? 'selected' : ''}>Todos</option>
          <option value="Novio" ${currentBudgetFilter.scope === 'Novio' ? 'selected' : ''}>🤵 ${groomName}</option>
          <option value="Novia" ${currentBudgetFilter.scope === 'Novia' ? 'selected' : ''}>👰 ${brideName}</option>
          <option value="Conjunto" ${currentBudgetFilter.scope === 'Conjunto' ? 'selected' : ''}>💑 Conjunto</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Estado de Pago</label>
        <select id="budget-filter-status" class="form-select">
          <option value="all" ${currentBudgetFilter.paymentStatus === 'all' ? 'selected' : ''}>Todos los estados</option>
          <option value="Pendiente" ${currentBudgetFilter.paymentStatus === 'Pendiente' ? 'selected' : ''}>Pendiente (Sin pagar)</option>
          <option value="Adelanto" ${currentBudgetFilter.paymentStatus === 'Adelanto' ? 'selected' : ''}>Adelanto / Seña</option>
          <option value="Pagado Total" ${currentBudgetFilter.paymentStatus === 'Pagado Total' ? 'selected' : ''}>Pagado Total</option>
        </select>
      </div>
      ${hasActiveFilter
        ? `<div class="filter-group filter-reset-group"><button class="btn btn-outline btn-sm" id="btn-reset-budget-filters">Limpiar Filtros</button></div>`
        : ''}
    </div>

    <!-- Tabla Comparativa de Gastos Ultra-Compacta -->
    <div class="table-container shadow-card">
      <table class="data-table compact-table budget-table">
        <thead>
          <tr>
            <th>Concepto / Proveedor / Categoría</th>
            <th class="text-center">Responsable</th>
            <th class="text-right">Costo Real vs Estimado</th>
            <th class="text-right">Pagado vs Saldo</th>
            <th class="text-center">Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${filteredExpenses.length === 0 ? `
            <tr>
              <td colspan="6" class="text-center py-4">No se encontraron ítems de presupuesto con los filtros seleccionados.</td>
            </tr>
          ` : filteredExpenses.map(exp => {
            const pending = Math.max(0, (exp.actualCost || 0) - (exp.advancePaid || 0));
            const deviation = (exp.actualCost || 0) - (exp.estimatedBudget || 0);

            let statusBadge = 'badge-warning';
            if (exp.paymentStatus === 'Pagado Total') statusBadge = 'badge-success';
            else if (exp.paymentStatus === 'Adelanto') statusBadge = 'badge-info';

            let deviationBadge = '';
            if (deviation > 0) {
              deviationBadge = `<span class="badge badge-danger" title="Sobrecosto">+${currency} ${deviation.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>`;
            } else if (deviation < 0) {
              deviationBadge = `<span class="badge badge-success" title="Ahorro conseguido">${currency} ${deviation.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>`;
            } else {
              deviationBadge = `<span class="badge badge-light" title="Exacto">= 0</span>`;
            }

            return `
              <tr>
                <td>
                  <div class="table-task-info">
                    <span class="table-task-title">${exp.concept}</span>
                    <div class="supplier-row">
                      <span class="badge badge-category">${exp.category}</span>
                      ${exp.supplier ? `<span class="supplier-name"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${exp.supplier}</span>` : ''}
                      ${exp.quoteUrl ? `
                        <a href="${exp.quoteUrl.startsWith('http') ? exp.quoteUrl : '#'}" target="_blank" class="quote-link" title="${exp.quoteUrl}">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                          ${exp.quoteUrl.startsWith('http') ? 'Cotización' : exp.quoteUrl}
                        </a>
                      ` : ''}
                    </div>
                    ${exp.notes ? `<div class="table-task-subnote">${exp.notes}</div>` : ''}
                  </div>
                </td>
                <td class="text-center">
                  ${scopeBadge(exp.scope || 'Conjunto')}
                </td>
                <td class="text-right">
                  <div class="compact-cell-stack">
                    <span class="font-mono font-bold text-gold">${currency} ${(exp.actualCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <div class="cell-sub-row">
                      <span class="cell-sub-label">Est: ${currency} ${(exp.estimatedBudget || 0).toLocaleString()}</span>
                      ${deviationBadge}
                    </div>
                  </div>
                </td>
                <td class="text-right">
                  <div class="compact-cell-stack">
                    <span class="font-mono text-success font-bold">Pagado: ${currency} ${(exp.advancePaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <div class="cell-sub-row">
                      <span class="font-mono ${pending > 0 ? 'text-amber font-bold' : 'text-muted'}">Saldo: ${currency} ${pending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      ${pending > 0 ? `
                        <button class="btn btn-outline btn-xs btn-quick-pay" data-id="${exp.id}" title="Pagar saldo total">Pagar</button>
                      ` : ''}
                    </div>
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge ${statusBadge}">${exp.paymentStatus}</span>
                </td>
                <td class="text-right">
                  <div class="action-buttons-wrap">
                    <button class="btn btn-outline btn-xs btn-edit-expense" data-id="${exp.id}" title="Editar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn btn-danger-outline btn-xs btn-delete-expense" data-id="${exp.id}" title="Eliminar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr class="table-total-row">
            <td colspan="2"><strong>TOTALES (${filteredExpenses.length} conceptos)</strong></td>
            <td class="text-right">
              <div class="compact-cell-stack">
                <span class="font-mono font-bold text-gold">${currency} ${fTotalActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span class="cell-sub-label">Est: ${currency} ${fTotalEstimated.toLocaleString()} (${fTotalDeviation > 0 ? '+' : ''}${currency} ${fTotalDeviation.toLocaleString()})</span>
              </div>
            </td>
            <td class="text-right">
              <div class="compact-cell-stack">
                <span class="font-mono text-success font-bold">${currency} ${fTotalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span class="font-mono text-amber font-bold">Saldo: ${currency} ${fTotalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  attachBudgetHandlers();
}

function attachBudgetHandlers() {
  const openModalBtn = document.getElementById('btn-open-expense-modal');
  if (openModalBtn) {
    openModalBtn.onclick = () => openExpenseModal(null);
  }

  // Quick Pay balance
  document.querySelectorAll('.btn-quick-pay').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const state = store.getState();
      const exp = state.expenses.find(e => e.id === id);
      if (exp) {
        if (confirm(`¿Liquidar saldo de "${exp.concept}" pasando el monto adelantado a ${exp.actualCost} y estado a 'Pagado Total'?`)) {
          store.updateExpense(id, {
            advancePaid: exp.actualCost,
            paymentStatus: 'Pagado Total'
          });
          renderBudgetView();
          showToast('Saldo liquidado con éxito');
        }
      }
    };
  });

  // Edit Expense
  document.querySelectorAll('.btn-edit-expense').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      openExpenseModal(id);
    };
  });

  // Delete Expense
  document.querySelectorAll('.btn-delete-expense').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Eliminar este concepto presupuestario?')) {
        store.deleteExpense(id);
        renderBudgetView();
        showToast('Concepto eliminado del presupuesto');
      }
    };
  });

  // Filtros
  const searchInput = document.getElementById('budget-filter-search');
  if (searchInput) {
    searchInput.oninput = (e) => {
      currentBudgetFilter.search = e.target.value;
      renderBudgetView();
    };
  }

  const catSelect = document.getElementById('budget-filter-category');
  if (catSelect) {
    catSelect.onchange = (e) => {
      currentBudgetFilter.category = e.target.value;
      renderBudgetView();
    };
  }

  const scopeSelect = document.getElementById('budget-filter-scope');
  if (scopeSelect) {
    scopeSelect.onchange = (e) => {
      currentBudgetFilter.scope = e.target.value;
      renderBudgetView();
    };
  }

  const statusSelect = document.getElementById('budget-filter-status');
  if (statusSelect) {
    statusSelect.onchange = (e) => {
      currentBudgetFilter.paymentStatus = e.target.value;
      renderBudgetView();
    };
  }

  const resetBtn = document.getElementById('btn-reset-budget-filters');
  if (resetBtn) {
    resetBtn.onclick = () => {
      currentBudgetFilter = { category: 'all', paymentStatus: 'all', scope: 'all', search: '' };
      renderBudgetView();
    };
  }
}

export function openExpenseModal(expenseId = null) {
  editingExpenseId = expenseId;
  const state = store.getState();
  const existingExp = expenseId ? state.expenses.find(e => e.id === expenseId) : null;
  const categories = state.categories;
  const currency = state.settings.currency || 'S/';
  const groomName = state.settings.groomName || 'Novio';
  const brideName = state.settings.brideName || 'Novia';

  const modalOverlay = document.getElementById('global-modal-overlay');
  const modalContent = document.getElementById('global-modal-body');
  if (!modalOverlay || !modalContent) return;

  const expData = existingExp || {
    concept: '',
    category: categories[0] || 'Locales y Recepción',
    scope: 'Conjunto',
    supplier: '',
    estimatedBudget: '',
    actualCost: '',
    advancePaid: '',
    paymentStatus: 'Pendiente',
    quoteUrl: '',
    notes: ''
  };

  modalContent.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">${existingExp ? 'Editar Gasto / Cotización' : 'Registrar Gasto o Cotización'}</h3>
        <button class="modal-close-btn" id="btn-close-modal">&times;</button>
      </div>
      <form id="expense-form" class="modal-form">
        <div class="form-group">
          <label class="form-label" for="exp-concept">Concepto / Servicio <span class="text-danger">*</span></label>
          <input type="text" id="exp-concept" class="form-control" required placeholder="Ej. Alquiler de Local, Recuerdos denarios, Fotógrafo" value="${expData.concept}">
        </div>

        <div class="form-row">
          <div class="form-group col-6">
            <label class="form-label" for="exp-category">Categoría</label>
            <select id="exp-category" class="form-select">
              ${categories.map(c => `<option value="${c}" ${expData.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              <option value="__NEW__">+ Agregar nueva categoría...</option>
            </select>
          </div>
          <div class="form-group col-6">
            <label class="form-label" for="exp-scope">Responsable del Gasto <span class="text-danger">*</span></label>
            <select id="exp-scope" class="form-select">
              <option value="Conjunto" ${expData.scope === 'Conjunto' ? 'selected' : ''}>💑 Conjunto (los dos)</option>
              <option value="Novio" ${expData.scope === 'Novio' ? 'selected' : ''}>🤵 ${groomName} (Novio)</option>
              <option value="Novia" ${expData.scope === 'Novia' ? 'selected' : ''}>👰 ${brideName} (Novia)</option>
            </select>
          </div>
        </div>

        <div class="form-group" id="exp-new-category-wrap" style="display: none;">
          <label class="form-label" for="exp-new-category-input">Nombre Nueva Categoría</label>
          <input type="text" id="exp-new-category-input" class="form-control" placeholder="Ej. Luna de Miel">
        </div>

        <div class="form-group">
          <label class="form-label" for="exp-supplier">Proveedor / Contacto (Opcional)</label>
          <input type="text" id="exp-supplier" class="form-control" placeholder="Ej. Hacienda San José, Atelier Novias" value="${expData.supplier || ''}">
        </div>

        <div class="form-row">
          <div class="form-group col-4">
            <label class="form-label" for="exp-estimated">Presupuesto Estimado (${currency}) <span class="text-danger">*</span></label>
            <input type="number" id="exp-estimated" class="form-control" min="0" step="0.01" required placeholder="0.00" value="${expData.estimatedBudget}">
          </div>
          <div class="form-group col-4">
            <label class="form-label" for="exp-actual">Costo Real / Pactado (${currency}) <span class="text-danger">*</span></label>
            <input type="number" id="exp-actual" class="form-control" min="0" step="0.01" required placeholder="0.00" value="${expData.actualCost}">
          </div>
          <div class="form-group col-4">
            <label class="form-label" for="exp-advance">Adelanto / Seña (${currency})</label>
            <input type="number" id="exp-advance" class="form-control" min="0" step="0.01" placeholder="0.00" value="${expData.advancePaid}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-6">
            <label class="form-label" for="exp-status">Estado de Pago</label>
            <select id="exp-status" class="form-select">
              <option value="Pendiente" ${expData.paymentStatus === 'Pendiente' ? 'selected' : ''}>Pendiente (Sin pagar)</option>
              <option value="Adelanto" ${expData.paymentStatus === 'Adelanto' ? 'selected' : ''}>Adelanto / Seña</option>
              <option value="Pagado Total" ${expData.paymentStatus === 'Pagado Total' ? 'selected' : ''}>Pagado Total</option>
            </select>
          </div>
          <div class="form-group col-6">
            <label class="form-label" for="exp-quote-url">Enlace Cotización / Recibo</label>
            <input type="text" id="exp-quote-url" class="form-control" placeholder="URL o N° Contrato / Recibo" value="${expData.quoteUrl || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="exp-notes">Notas / Observaciones</label>
          <textarea id="exp-notes" class="form-control" rows="2" placeholder="Detalles de pago, fecha límite de cancelación de saldo, especificaciones...">${expData.notes || ''}</textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="btn-cancel-modal">Cancelar</button>
          <button type="submit" class="btn btn-primary">${existingExp ? 'Guardar Cambios' : 'Registrar Gasto'}</button>
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

  const categorySelect = document.getElementById('exp-category');
  const newCatWrap = document.getElementById('exp-new-category-wrap');
  if (categorySelect && newCatWrap) {
    categorySelect.onchange = (e) => {
      newCatWrap.style.display = e.target.value === '__NEW__' ? 'block' : 'none';
    };
  }

  // Auto-ajuste de estado según adelanto
  const advanceInput = document.getElementById('exp-advance');
  const actualInput = document.getElementById('exp-actual');
  const statusSelect = document.getElementById('exp-status');
  if (advanceInput && actualInput && statusSelect) {
    const updateAutoStatus = () => {
      const adv = parseFloat(advanceInput.value) || 0;
      const act = parseFloat(actualInput.value) || 0;
      if (adv === 0) statusSelect.value = 'Pendiente';
      else if (adv >= act && act > 0) statusSelect.value = 'Pagado Total';
      else if (adv > 0 && adv < act) statusSelect.value = 'Adelanto';
    };
    advanceInput.oninput = updateAutoStatus;
    actualInput.oninput = updateAutoStatus;
  }

  const form = document.getElementById('expense-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const concept = document.getElementById('exp-concept').value.trim();
      let category = categorySelect.value;
      if (category === '__NEW__') {
        const newCat = document.getElementById('exp-new-category-input').value.trim();
        if (newCat) {
          store.addCategory(newCat);
          category = newCat;
        } else {
          category = categories[0];
        }
      }
      const scope = document.getElementById('exp-scope').value;
      const supplier = document.getElementById('exp-supplier').value.trim();
      const estimatedBudget = parseFloat(document.getElementById('exp-estimated').value) || 0;
      const actualCost = parseFloat(document.getElementById('exp-actual').value) || 0;
      const advancePaid = parseFloat(document.getElementById('exp-advance').value) || 0;
      const paymentStatus = document.getElementById('exp-status').value;
      const quoteUrl = document.getElementById('exp-quote-url').value.trim();
      const notes = document.getElementById('exp-notes').value.trim();

      if (editingExpenseId) {
        store.updateExpense(editingExpenseId, {
          concept, category, scope, supplier, estimatedBudget, actualCost, advancePaid, paymentStatus, quoteUrl, notes
        });
      } else {
        store.addExpense({
          concept, category, scope, supplier, estimatedBudget, actualCost, advancePaid, paymentStatus, quoteUrl, notes
        });
      }

      closeModal();
      renderBudgetView();
      showToast('Gasto registrado con éxito');
    };
  }
}

function setupBudgetEventListeners() {
  store.subscribe(() => {
    const container = document.getElementById('budget-view-container');
    if (container && container.offsetParent !== null) {
      renderBudgetView();
    }
  });
}

function showToast(message) {
  const toast = document.getElementById('global-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}
