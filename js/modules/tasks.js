// Módulo 1: Gestión de Pendientes y Tareas (Todo / Kanban)
import { store } from '../store.js';

let currentFilter = {
  category: 'all',
  status: 'all',
  assignedTo: 'all',
  priority: 'all',
  search: ''
};

let currentViewMode = 'kanban'; // 'kanban' o 'table'
let editingTaskId = null;

export function initTasksModule() {
  renderTasksView();
  setupTasksEventListeners();
}

export function renderTasksView() {
  const container = document.getElementById('tasks-view-container');
  if (!container) return;

  const state = store.getState();
  const tasks = state.tasks;
  const categories = state.categories;

  // Filtrado
  const filteredTasks = tasks.filter(task => {
    if (currentFilter.category !== 'all' && task.category !== currentFilter.category) return false;
    if (currentFilter.status !== 'all' && task.status !== currentFilter.status) return false;
    if (currentFilter.assignedTo !== 'all' && task.assignedTo !== currentFilter.assignedTo) return false;
    if (currentFilter.priority !== 'all' && task.priority !== currentFilter.priority) return false;
    if (currentFilter.search.trim()) {
      const q = currentFilter.search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNotes = (task.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'Completado').length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const activeElement = document.activeElement;
  const searchSelection = activeElement?.id === 'task-filter-search'
    ? {
        start: activeElement.selectionStart,
        end: activeElement.selectionEnd,
        direction: activeElement.selectionDirection
      }
    : null;

  container.innerHTML = `
    <div class="module-header">
      <div class="module-title-area">
        <div class="module-icon-wrap task-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <div>
          <h2 class="module-title">Pendientes y Trámites Nupciales</h2>
          <p class="module-subtitle">Gestión integral de expedientes eclesiásticos, recepción y preparativos</p>
        </div>
      </div>
      <div class="module-actions">
        <button class="btn btn-secondary view-toggle-btn" id="btn-toggle-view" title="Alternar Vista">
          ${currentViewMode === 'kanban' 
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> Vista Lista` 
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg> Vista Tablero`}
        </button>
        <button class="btn btn-primary" id="btn-open-task-modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Tarea
        </button>
      </div>
    </div>

    <!-- Barra de Resumen Rápido -->
    <div class="task-summary-bar">
      <div class="task-stat-item">
        <span class="stat-label">Total Pendientes:</span>
        <span class="stat-number">${totalCount}</span>
      </div>
      <div class="task-stat-item">
        <span class="stat-label">Completados:</span>
        <span class="stat-number stat-success">${completedCount}</span>
      </div>
      <div class="task-stat-item">
        <span class="stat-label">En Proceso:</span>
        <span class="stat-number stat-info">${tasks.filter(t => t.status === 'En Proceso').length}</span>
      </div>
      <div class="task-stat-item">
        <span class="stat-label">Pendientes:</span>
        <span class="stat-number stat-warning">${tasks.filter(t => t.status === 'Pendiente').length}</span>
      </div>
      <div class="task-progress-wrap">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${progressPct}%"></div>
        </div>
        <span class="progress-text">${progressPct}% completado</span>
      </div>
    </div>

    <!-- Barra de Filtros -->
    <div class="filters-card">
      <div class="filter-group filter-search">
        <label>Buscar</label>
        <div class="search-input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="task-filter-search" placeholder="Buscar por nombre o nota..." value="${escapeHtml(currentFilter.search)}">
        </div>
      </div>
      <div class="filter-group">
        <label>Categoría</label>
        <select id="task-filter-category" class="form-select">
          <option value="all">Todas las categorías</option>
          ${categories.map(c => `<option value="${c}" ${currentFilter.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Asignado a</label>
        <select id="task-filter-assigned" class="form-select">
          <option value="all" ${currentFilter.assignedTo === 'all' ? 'selected' : ''}>Todos</option>
          <option value="Él" ${currentFilter.assignedTo === 'Él' ? 'selected' : ''}>Él</option>
          <option value="Ella" ${currentFilter.assignedTo === 'Ella' ? 'selected' : ''}>Ella</option>
          <option value="Ambos" ${currentFilter.assignedTo === 'Ambos' ? 'selected' : ''}>Ambos</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Prioridad</label>
        <select id="task-filter-priority" class="form-select">
          <option value="all" ${currentFilter.priority === 'all' ? 'selected' : ''}>Todas</option>
          <option value="Alta" ${currentFilter.priority === 'Alta' ? 'selected' : ''}>Alta</option>
          <option value="Media" ${currentFilter.priority === 'Media' ? 'selected' : ''}>Media</option>
          <option value="Baja" ${currentFilter.priority === 'Baja' ? 'selected' : ''}>Baja</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Estado</label>
        <select id="task-filter-status" class="form-select">
          <option value="all" ${currentFilter.status === 'all' ? 'selected' : ''}>Todos</option>
          <option value="Pendiente" ${currentFilter.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En Proceso" ${currentFilter.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
          <option value="Completado" ${currentFilter.status === 'Completado' ? 'selected' : ''}>Completado</option>
        </select>
      </div>
      ${(currentFilter.category !== 'all' || currentFilter.status !== 'all' || currentFilter.assignedTo !== 'all' || currentFilter.priority !== 'all' || currentFilter.search)
        ? `<div class="filter-group filter-reset-group"><button class="btn btn-outline btn-sm" id="btn-reset-task-filters">Limpiar Filtros</button></div>`
        : ''}
    </div>

    <!-- Vista de Contenido (Kanban o Tabla) -->
    <div class="tasks-content-area">
      ${currentViewMode === 'kanban' 
        ? renderKanbanBoard(filteredTasks) 
        : renderTasksTable(filteredTasks)}
    </div>
  `;

  attachInteractiveHandlers();

  if (searchSelection) {
    const searchInput = document.getElementById('task-filter-search');
    searchInput?.focus({ preventScroll: true });
    searchInput?.setSelectionRange(searchSelection.start, searchSelection.end, searchSelection.direction);
  }
}

function renderKanbanBoard(tasks) {
  const columns = [
    { id: 'Pendiente', title: 'Pendiente', colorClass: 'col-pending', badgeClass: 'badge-warning', icon: '⏳' },
    { id: 'En Proceso', title: 'En Proceso', colorClass: 'col-progress', badgeClass: 'badge-info', icon: '⚡' },
    { id: 'Completado', title: 'Completado', colorClass: 'col-done', badgeClass: 'badge-success', icon: '✓' }
  ];

  return `
    <div class="kanban-grid">
      ${columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return `
          <div class="kanban-column ${col.colorClass}" data-col-status="${col.id}">
            <div class="kanban-column-header">
              <div class="kanban-title-wrap">
                <span class="kanban-icon">${col.icon}</span>
                <h3 class="kanban-col-title">${col.title}</h3>
                <span class="badge ${col.badgeClass}">${colTasks.length}</span>
              </div>
            </div>
            <div class="kanban-cards-list">
              ${colTasks.length === 0 
                ? `<div class="kanban-empty">No hay tareas en esta etapa</div>` 
                : colTasks.map(task => renderTaskCard(task)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderTaskCard(task) {
  const isDone = task.status === 'Completado';
  const priorityClass = task.priority === 'Alta' ? 'priority-high' : task.priority === 'Media' ? 'priority-medium' : 'priority-low';
  const assigneeClass = task.assignedTo === 'Él' ? 'assignee-groom' : task.assignedTo === 'Ella' ? 'assignee-bride' : 'assignee-both';

  return `
    <div class="kanban-card ${isDone ? 'card-completed' : ''}" data-task-id="${task.id}">
      <div class="card-top-row">
        <label class="custom-checkbox-wrap" title="Marcar como ${isDone ? 'pendiente' : 'completada'}">
          <input type="checkbox" class="task-quick-check" data-id="${task.id}" ${isDone ? 'checked' : ''}>
          <span class="checkmark"></span>
        </label>
        <span class="badge badge-category" title="${task.category}">${task.category}</span>
        <div class="card-actions-mini">
          <button class="btn-icon-mini btn-edit-task" data-id="${task.id}" title="Editar Tarea">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-icon-mini btn-delete-task text-danger" data-id="${task.id}" title="Eliminar Tarea">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>

      <h4 class="card-task-title ${isDone ? 'strike' : ''}">${task.title}</h4>
      
      ${task.notes ? `<p class="card-task-notes">${task.notes}</p>` : ''}

      <div class="card-footer-row">
        <div class="card-tags">
          <span class="badge ${assigneeClass}" title="Asignado a: ${task.assignedTo}">
            ${task.assignedTo === 'Él' ? '🤵 Él' : task.assignedTo === 'Ella' ? '👰 Ella' : '💑 Ambos'}
          </span>
          <span class="badge ${priorityClass}" title="Prioridad: ${task.priority}">${task.priority}</span>
        </div>
        ${task.dueDate ? `
          <div class="card-date ${isPastDue(task.dueDate) && !isDone ? 'date-overdue' : ''}" title="Fecha Límite">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>${formatDate(task.dueDate)}</span>
          </div>
        ` : ''}
      </div>

      <div class="card-status-fast-switch">
        <button class="btn-status-pill ${task.status === 'Pendiente' ? 'active' : ''}" data-id="${task.id}" data-set-status="Pendiente">Pendiente</button>
        <button class="btn-status-pill ${task.status === 'En Proceso' ? 'active' : ''}" data-id="${task.id}" data-set-status="En Proceso">En Proceso</button>
        <button class="btn-status-pill ${task.status === 'Completado' ? 'active' : ''}" data-id="${task.id}" data-set-status="Completado">Listo ✓</button>
      </div>
    </div>
  `;
}

function renderTasksTable(tasks) {
  if (tasks.length === 0) {
    return `<div class="empty-state-card">
      <p>No se encontraron pendientes con los filtros seleccionados.</p>
    </div>`;
  }

  return `
    <div class="table-container shadow-card">
      <table class="data-table compact-table tasks-table">
        <thead>
          <tr>
            <th width="36">✓</th>
            <th>Pendiente / Categoría</th>
            <th>Responsable & Prioridad</th>
            <th>Fecha & Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(task => {
            const isDone = task.status === 'Completado';
            const priorityClass = task.priority === 'Alta' ? 'priority-high' : task.priority === 'Media' ? 'priority-medium' : 'priority-low';
            const assigneeClass = task.assignedTo === 'Él' ? 'assignee-groom' : task.assignedTo === 'Ella' ? 'assignee-bride' : 'assignee-both';
            const statusBadgeClass = task.status === 'Completado' ? 'badge-success' : task.status === 'En Proceso' ? 'badge-info' : 'badge-warning';

            return `
              <tr class="${isDone ? 'row-completed' : ''}">
                <td>
                  <label class="custom-checkbox-wrap">
                    <input type="checkbox" class="task-quick-check" data-id="${task.id}" ${isDone ? 'checked' : ''}>
                    <span class="checkmark"></span>
                  </label>
                </td>
                <td>
                  <div class="table-task-info">
                    <span class="table-task-title ${isDone ? 'strike' : ''}">${task.title}</span>
                    <div class="supplier-row">
                      <span class="badge badge-category">${task.category}</span>
                      ${task.notes ? `<span class="table-task-subnote">${task.notes}</span>` : ''}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="compact-cell-stack">
                    <span class="badge ${assigneeClass}">${task.assignedTo === 'Él' ? '🤵 Él' : task.assignedTo === 'Ella' ? '👰 Ella' : '💑 Ambos'}</span>
                    <span class="badge ${priorityClass}">Prioridad: ${task.priority}</span>
                  </div>
                </td>
                <td>
                  <div class="compact-cell-stack">
                    <span class="badge ${statusBadgeClass}">${task.status}</span>
                    <span class="cell-sub-label ${isPastDue(task.dueDate) && !isDone ? 'text-danger font-bold' : ''}">
                      📅 ${task.dueDate ? formatDate(task.dueDate) : 'Sin fecha'}
                    </span>
                  </div>
                </td>
                <td class="text-right">
                  <div class="action-buttons-wrap">
                    <button class="btn btn-outline btn-xs btn-edit-task" data-id="${task.id}" title="Editar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn btn-danger-outline btn-xs btn-delete-task" data-id="${task.id}" title="Eliminar">
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
  `;
}

function attachInteractiveHandlers() {
  // Toggle view
  const toggleBtn = document.getElementById('btn-toggle-view');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      currentViewMode = currentViewMode === 'kanban' ? 'table' : 'kanban';
      renderTasksView();
    };
  }

  // Open modal
  const openModalBtn = document.getElementById('btn-open-task-modal');
  if (openModalBtn) {
    openModalBtn.onclick = () => openTaskModal(null);
  }

  // Quick checkbox
  document.querySelectorAll('.task-quick-check').forEach(chk => {
    chk.onchange = (e) => {
      const id = e.target.getAttribute('data-id');
      store.quickCompleteTask(id, e.target.checked);
      renderTasksView();
    };
  });

  // Fast status pill in card
  document.querySelectorAll('.btn-status-pill').forEach(btn => {
    btn.onclick = (e) => {
      const id = btn.getAttribute('data-id');
      const newStatus = btn.getAttribute('data-set-status');
      store.updateTask(id, { status: newStatus });
      renderTasksView();
    };
  });

  // Edit task
  document.querySelectorAll('.btn-edit-task').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      openTaskModal(id);
    };
  });

  // Delete task
  document.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        store.deleteTask(id);
        renderTasksView();
      }
    };
  });

  // Filtros
  const searchInput = document.getElementById('task-filter-search');
  if (searchInput) {
    searchInput.oninput = (e) => {
      currentFilter.search = e.target.value;
      renderTasksView();
    };
  }

  const catSelect = document.getElementById('task-filter-category');
  if (catSelect) {
    catSelect.onchange = (e) => {
      currentFilter.category = e.target.value;
      renderTasksView();
    };
  }

  const assignedSelect = document.getElementById('task-filter-assigned');
  if (assignedSelect) {
    assignedSelect.onchange = (e) => {
      currentFilter.assignedTo = e.target.value;
      renderTasksView();
    };
  }

  const prioritySelect = document.getElementById('task-filter-priority');
  if (prioritySelect) {
    prioritySelect.onchange = (e) => {
      currentFilter.priority = e.target.value;
      renderTasksView();
    };
  }

  const statusSelect = document.getElementById('task-filter-status');
  if (statusSelect) {
    statusSelect.onchange = (e) => {
      currentFilter.status = e.target.value;
      renderTasksView();
    };
  }

  const resetBtn = document.getElementById('btn-reset-task-filters');
  if (resetBtn) {
    resetBtn.onclick = () => {
      currentFilter = { category: 'all', status: 'all', assignedTo: 'all', priority: 'all', search: '' };
      renderTasksView();
    };
  }
}

// Modal de Tarea
export function openTaskModal(taskId = null) {
  editingTaskId = taskId;
  const state = store.getState();
  const existingTask = taskId ? state.tasks.find(t => t.id === taskId) : null;
  const categories = state.categories;

  const modalOverlay = document.getElementById('global-modal-overlay');
  const modalContent = document.getElementById('global-modal-body');
  if (!modalOverlay || !modalContent) return;

  const taskData = existingTask || {
    title: '',
    category: categories[0] || 'Trámites e Iglesia Católica',
    assignedTo: 'Ambos',
    dueDate: '',
    status: 'Pendiente',
    priority: 'Media',
    notes: ''
  };

  modalContent.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">${existingTask ? 'Editar Pendiente / Tarea' : 'Registrar Nuevo Pendiente'}</h3>
        <button class="modal-close-btn" id="btn-close-modal">&times;</button>
      </div>
      <form id="task-form" class="modal-form">
        <div class="form-group">
          <label class="form-label" for="task-title">Nombre del Pendiente <span class="text-danger">*</span></label>
          <input type="text" id="task-title" class="form-control" required placeholder="Ej. Solicitud de Partida de Bautizo con fines matrimoniales" value="${taskData.title}">
        </div>

        <div class="form-row">
          <div class="form-group col-6">
            <label class="form-label" for="task-category">Categoría</label>
            <select id="task-category" class="form-select">
              ${categories.map(c => `<option value="${c}" ${taskData.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              <option value="__NEW__">+ Agregar nueva categoría...</option>
            </select>
          </div>
          <div class="form-group col-6" id="new-category-wrap" style="display: none;">
            <label class="form-label" for="new-category-input">Nombre Nueva Categoría</label>
            <input type="text" id="new-category-input" class="form-control" placeholder="Ej. Luna de Miel">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Asignado a</label>
          <div class="radio-pill-group">
            <label class="radio-pill">
              <input type="radio" name="assignedTo" value="Él" ${taskData.assignedTo === 'Él' ? 'checked' : ''}>
              <span class="pill-label">🤵 Él</span>
            </label>
            <label class="radio-pill">
              <input type="radio" name="assignedTo" value="Ella" ${taskData.assignedTo === 'Ella' ? 'checked' : ''}>
              <span class="pill-label">👰 Ella</span>
            </label>
            <label class="radio-pill">
              <input type="radio" name="assignedTo" value="Ambos" ${taskData.assignedTo === 'Ambos' ? 'checked' : ''}>
              <span class="pill-label">💑 Ambos</span>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-4">
            <label class="form-label" for="task-due-date">Fecha Límite</label>
            <input type="date" id="task-due-date" class="form-control" value="${taskData.dueDate}">
          </div>
          <div class="form-group col-4">
            <label class="form-label" for="task-status">Estado</label>
            <select id="task-status" class="form-select">
              <option value="Pendiente" ${taskData.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="En Proceso" ${taskData.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
              <option value="Completado" ${taskData.status === 'Completado' ? 'selected' : ''}>Completado</option>
            </select>
          </div>
          <div class="form-group col-4">
            <label class="form-label" for="task-priority">Prioridad</label>
            <select id="task-priority" class="form-select">
              <option value="Alta" ${taskData.priority === 'Alta' ? 'selected' : ''}>Alta</option>
              <option value="Media" ${taskData.priority === 'Media' ? 'selected' : ''}>Media</option>
              <option value="Baja" ${taskData.priority === 'Baja' ? 'selected' : ''}>Baja</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="task-notes">Notas / Observaciones</label>
          <textarea id="task-notes" class="form-control" rows="3" placeholder="Detalles de requisitos, parroquia de origen, contactos o documentos requeridos...">${taskData.notes || ''}</textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="btn-cancel-modal">Cancelar</button>
          <button type="submit" class="btn btn-primary">${existingTask ? 'Guardar Cambios' : 'Registrar Tarea'}</button>
        </div>
      </form>
    </div>
  `;

  modalOverlay.classList.add('active');

  // Eventos dentro del modal
  const closeBtn = document.getElementById('btn-close-modal');
  const cancelBtn = document.getElementById('btn-cancel-modal');
  const closeModal = () => modalOverlay.classList.remove('active');
  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;

  const categorySelect = document.getElementById('task-category');
  const newCatWrap = document.getElementById('new-category-wrap');
  if (categorySelect && newCatWrap) {
    categorySelect.onchange = (e) => {
      newCatWrap.style.display = e.target.value === '__NEW__' ? 'block' : 'none';
    };
  }

  const form = document.getElementById('task-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title').value.trim();
      let category = categorySelect.value;
      if (category === '__NEW__') {
        const newCat = document.getElementById('new-category-input').value.trim();
        if (newCat) {
          store.addCategory(newCat);
          category = newCat;
        } else {
          category = categories[0];
        }
      }

      const assignedTo = document.querySelector('input[name="assignedTo"]:checked')?.value || 'Ambos';
      const dueDate = document.getElementById('task-due-date').value;
      const status = document.getElementById('task-status').value;
      const priority = document.getElementById('task-priority').value;
      const notes = document.getElementById('task-notes').value.trim();

      if (editingTaskId) {
        store.updateTask(editingTaskId, { title, category, assignedTo, dueDate, status, priority, notes });
      } else {
        store.addTask({ title, category, assignedTo, dueDate, status, priority, notes });
      }

      closeModal();
      renderTasksView();
    };
  }
}

function setupTasksEventListeners() {
  store.subscribe(() => {
    // Si la vista actual está activa, re-renderizar
    const container = document.getElementById('tasks-view-container');
    if (container && container.offsetParent !== null) {
      renderTasksView();
    }
  });
}

function isPastDue(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}
