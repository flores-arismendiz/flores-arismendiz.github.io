// Módulo 4: Invitaciones WhatsApp & Web Nupcial Interactiva (Estilo ChungDoi)
import { store } from '../store.js';
import { DEFAULT_GUESTS, DEFAULT_INVITATION_TEMPLATES, DEFAULT_WEDDING_WEB } from '../data.js';
import { uploadWeddingMusic } from '../supabase.js';
import { renderWeddingWebPage } from './wedding_web.js';

let currentSubTab = 'guests'; // 'guests', 'web_admin', 'designer', 'settings'
let selectedTemplateId = null;
let previewGuestId = null;
let currentFilter = {
  status: 'all',
  templateId: 'all',
  search: ''
};

export function initInvitationsModule() {
  const state = store.getState();
  if (state.invitationTemplates && state.invitationTemplates.length > 0) {
    selectedTemplateId = state.invitationTemplates[0].id;
  }
  renderInvitationsView();
  setupInvitationsEventListeners();

  // Suscribirse a cambios en el Store para actualizar la vista si estamos en este módulo
  store.subscribe(() => {
    const container = document.getElementById('invitations-view-container');
    if (container && container.style.display !== 'none') {
      renderInvitationsView();
    }
  });
}

export function renderInvitationsView() {
  const container = document.getElementById('invitations-view-container');
  if (!container) return;

  const state = store.getState();
  const templates = state.invitationTemplates || [];
  const guests = state.guests || [];
  const settings = state.settings || {};
  const web = settings.weddingWeb || DEFAULT_WEDDING_WEB;
  const metrics = store.getInvitationMetrics();

  // Asegurar plantilla seleccionada válida
  if (!selectedTemplateId && templates.length > 0) {
    selectedTemplateId = templates[0].id;
  }
  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0] || {
    id: 'tpl-minimalist-web',
    name: 'Invitación Minimalista con Link Web',
    content: ''
  };

  // Filtrado de invitados
  const filteredGuests = guests.filter(g => {
    if (currentFilter.status !== 'all' && g.status !== currentFilter.status) return false;
    if (currentFilter.templateId !== 'all' && g.templateId !== currentFilter.templateId) return false;
    if (currentFilter.search.trim()) {
      const q = currentFilter.search.toLowerCase();
      const matchName = (g.name || '').toLowerCase().includes(q);
      const matchPhone = (g.phone || '').toLowerCase().includes(q);
      const matchNotes = (g.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchNotes) return false;
    }
    return true;
  });

  container.innerHTML = `
    <!-- Encabezado del Módulo -->
    <div class="module-header">
      <div class="module-title-area">
        <div class="module-icon-wrap" style="background: linear-gradient(135deg, #10B981, #059669); color: white;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h2 class="module-title">Invitaciones WhatsApp & Web Nupcial</h2>
            <span class="badge-rsvp badge-pulse" style="background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; font-size:11px; padding:2px 8px; border-radius:12px;">Estilo ChungDoi</span>
          </div>
          <p class="module-subtitle">Administra tu web interactiva (fotos, video, música, mapas), envía el link por WhatsApp y monitorea las confirmaciones</p>
        </div>
      </div>
      <div class="module-actions">
        <!-- Botón Destacado: Ver Web de Boda en Pantalla Completa -->
        <button class="btn btn-outline" id="btn-open-wedding-web" style="border-color:#C5A059; color:#C5A059; font-weight:600;" title="Abrir la web de invitación tal como la ve el invitado">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span>Ver Mi Web de Boda</span>
        </button>

        <button class="btn btn-primary" id="btn-add-guest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          <span>+ Nuevo Invitado</span>
        </button>
        
        <button class="btn btn-secondary" id="btn-export-guests-csv" title="Descargar lista de confirmaciones">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Excel / CSV</span>
        </button>
      </div>
    </div>

    <!-- Barra de Métricas y Estado de Asistencia -->
    <div class="invitations-metrics-grid">
      <div class="inv-metric-card">
        <div class="inv-metric-icon" style="background: #EFF6FF; color: #2563EB;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="inv-metric-info">
          <span class="inv-metric-label">Invitados Registrados</span>
          <div class="inv-metric-val-wrap">
            <span class="inv-metric-val">${metrics.totalGuests}</span>
            <span class="inv-metric-sub">(${metrics.totalPassesReserved} pases totales)</span>
          </div>
        </div>
      </div>

      <div class="inv-metric-card" style="border-left: 3px solid #059669;">
        <div class="inv-metric-icon" style="background: #ECFDF5; color: #059669;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="inv-metric-info">
          <span class="inv-metric-label">Confirmados (RSVP)</span>
          <div class="inv-metric-val-wrap">
            <span class="inv-metric-val text-success">${metrics.confirmedCount}</span>
            <span class="inv-metric-sub text-success" style="font-weight: 600;">${metrics.totalPassesConfirmed} pases (${metrics.attendanceRatePct}%)</span>
          </div>
        </div>
      </div>

      <div class="inv-metric-card" style="border-left: 3px solid #D97706;">
        <div class="inv-metric-icon" style="background: #FFFBEB; color: #D97706;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="inv-metric-info">
          <span class="inv-metric-label">Pendientes / Por Responder</span>
          <div class="inv-metric-val-wrap">
            <span class="inv-metric-val text-warning">${metrics.pendingCount}</span>
            <span class="inv-metric-sub">(${metrics.totalPassesPending} pases por validar)</span>
          </div>
        </div>
      </div>

      <div class="inv-metric-card" style="border-left: 3px solid #DC2626;">
        <div class="inv-metric-icon" style="background: #FEF2F2; color: #DC2626;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <div class="inv-metric-info">
          <span class="inv-metric-label">Declinados</span>
          <div class="inv-metric-val-wrap">
            <span class="inv-metric-val text-danger">${metrics.declinedCount}</span>
            <span class="inv-metric-sub">(${metrics.totalPassesDeclined} pases liberados)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de Pestañas Secundarias (Sub-navegación) -->
    <div class="inv-subnav-bar">
      <div class="inv-subnav-pills">
        <button class="inv-subnav-btn ${currentSubTab === 'guests' ? 'active' : ''}" data-subtab="guests">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>Lista de Invitados & Envíos</span>
          <span class="subnav-counter">${guests.length}</span>
        </button>

        <button class="inv-subnav-btn ${currentSubTab === 'web_admin' ? 'active' : ''}" data-subtab="web_admin" style="font-weight:600;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span>Web de Invitación (ChungDoi)</span>
        </button>

        <button class="inv-subnav-btn ${currentSubTab === 'designer' ? 'active' : ''}" data-subtab="designer">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          <span>Mensaje WhatsApp Minimalista</span>
        </button>

        <button class="inv-subnav-btn ${currentSubTab === 'settings' ? 'active' : ''}" data-subtab="settings">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span>Datos de la Ceremonia & Novios</span>
        </button>
      </div>
    </div>

    <!-- Contenido Dinámico de la Sub-Pestaña -->
    <div class="inv-tab-content-wrap">
      ${currentSubTab === 'guests' ? renderGuestsListSubTab(filteredGuests, templates, settings) : ''}
      ${currentSubTab === 'web_admin' ? renderWeddingWebAdminSubTab(web, settings, guests) : ''}
      ${currentSubTab === 'designer' ? renderDesignerSubTab(templates, currentTemplate, guests, settings) : ''}
      ${currentSubTab === 'settings' ? renderWeddingDetailsSubTab(settings) : ''}
    </div>
  `;

  attachDynamicListeners();
}

// -------------------------------------------------------------
// SUB-TAB 1: TABLA DE INVITADOS & CONFIRMACIONES
// -------------------------------------------------------------
function renderGuestsListSubTab(filteredGuests, templates, settings) {
  const templateMap = {};
  templates.forEach(t => { templateMap[t.id] = t.name; });

  return `
    <div class="inv-guests-section">
      <!-- Filtros y Búsqueda -->
      <div class="inv-filter-toolbar">
        <div class="search-input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="inv-search-input" placeholder="Buscar por nombre, familia, teléfono o nota..." value="${escapeHtml(currentFilter.search)}">
          ${currentFilter.search ? `<button id="btn-clear-search" class="clear-search-btn" title="Limpiar">&times;</button>` : ''}
        </div>

        <div class="inv-filter-dropdowns">
          <div class="inv-filter-field">
            <label class="inv-filter-label" for="inv-filter-status">Filtrar por estado</label>
            <select id="inv-filter-status" class="filter-select">
              <option value="all" ${currentFilter.status === 'all' ? 'selected' : ''}>Todos los estados</option>
              <option value="Confirmado" ${currentFilter.status === 'Confirmado' ? 'selected' : ''}>Confirmados</option>
              <option value="Pendiente" ${currentFilter.status === 'Pendiente' ? 'selected' : ''}>Pendientes</option>
              <option value="Actualizada enviada" ${currentFilter.status === 'Actualizada enviada' ? 'selected' : ''}>Actualizada enviada</option>
              <option value="Sin enviar" ${currentFilter.status === 'Sin enviar' ? 'selected' : ''}>Sin enviar</option>
              <option value="Declinado" ${currentFilter.status === 'Declinado' ? 'selected' : ''}>Declinados</option>
            </select>
          </div>

          <div class="inv-filter-field">
            <label class="inv-filter-label" for="inv-filter-template">Filtrar por invitación</label>
            <select id="inv-filter-template" class="filter-select">
              <option value="all" ${currentFilter.templateId === 'all' ? 'selected' : ''}>Todas las plantillas</option>
              ${templates.map(t => `<option value="${t.id}" ${currentFilter.templateId === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Tabla de Invitados -->
      <div class="table-responsive-container">
        <table class="inv-data-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Invitado / Familia</th>
              <th>WhatsApp / Teléfono</th>
              <th style="text-align: center;">Pases</th>
              <th>Invitación Asignada</th>
              <th style="text-align: center;">Estado RSVP</th>
              <th>Fecha de Envío</th>
              <th style="text-align: right; min-width: 200px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filteredGuests.length === 0 ? `
              <tr>
                <td colspan="8" class="table-empty-row">
                  <div class="empty-state-wrap">
                    <div class="empty-icon-circle">💌</div>
                    <h4>No se encontraron invitados</h4>
                    <p>Agrega un nuevo invitado o modifica los filtros de búsqueda.</p>
                    <button class="btn btn-primary btn-sm" id="btn-empty-add-guest">+ Agregar Primer Invitado</button>
                  </div>
                </td>
              </tr>
            ` : filteredGuests.map((g, index) => {
              const tplName = templateMap[g.templateId] || 'Minimalista Web';
              const statusBadge = getStatusBadgeHtml(g.status, g.confirmedPasses, g.passes);
              const sentDateLabel = g.sentAt ? formatShortDate(g.sentAt) : '<span class="text-muted">No enviado</span>';
              const isResend = Boolean(g.sentAt);

              return `
                <tr data-guest-id="${g.id}">
                  <td class="text-muted text-center">${index + 1}</td>
                  <td>
                    <div class="guest-name-cell">
                      <span class="guest-primary-name">${escapeHtml(g.name)}</span>
                      ${g.notes ? `<span class="guest-sub-note" title="${escapeHtml(g.notes)}">${escapeHtml(g.notes)}</span>` : ''}
                    </div>
                  </td>
                  <td>
                    ${g.phone ? `
                      <a href="https://wa.me/${cleanPhoneNumber(g.phone)}" target="_blank" rel="noopener noreferrer" class="guest-phone-link" title="Abrir chat en WhatsApp">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.2-1.2l-.3-.2-3.1.9.9-3-.2-.3A8 8 0 1 1 12 20zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8.9-.3.1-.6 0a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4s0-.3 0-.4-.5-1.3-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8s2.2 3.4 5.3 4.7c.7.3 1.3.5 1.8.7.8.2 1.5.2 2.1.1.7-.1 2.1-.9 2.4-1.7s.3-1.5.2-1.7-.3-.2-.5-.3z"/></svg>
                        <span>${escapeHtml(g.phone)}</span>
                      </a>
                    ` : '<span class="text-muted">Sin teléfono</span>'}
                  </td>
                  <td style="text-align: center;">
                    <span class="passes-pill ${g.status === 'Confirmado' ? 'confirmed' : ''}" title="${g.status === 'Confirmado' ? `${g.confirmedPasses || g.passes} confirmados de ${g.passes}` : `${g.passes} pases reservados`}">
                      ${g.status === 'Confirmado' ? `${g.confirmedPasses || g.passes} / ${g.passes}` : g.passes}
                    </span>
                  </td>
                  <td>
                    <div class="template-cell-info">
                      <span class="template-name-tag" title="${escapeHtml(tplName)}">${escapeHtml(tplName)}</span>
                      <button class="btn-icon-sm btn-preview-guest-inv" data-guest-id="${g.id}" title="Ver mensaje exacto que se le enviará">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                    </div>
                  </td>
                  <td style="text-align: center;">
                    <div class="status-cell-wrap">
                      ${statusBadge}
                      <button class="btn-quick-status-toggle" data-guest-id="${g.id}" title="Cambiar estado manualmente (Teléfono / Verbal)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div class="sent-date-cell">
                      ${sentDateLabel}
                      ${g.lastMessageSent ? '<span class="check-sent-icon" title="Mensaje guardado">✓</span>' : ''}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div class="row-actions-group">
                      <!-- Botón Enviar WhatsApp Directo con Link a la Web -->
                      <button class="btn-action-wa btn-send-wa" data-guest-id="${g.id}" title="${isResend ? 'Reenviar invitación actualizada por WhatsApp' : 'Enviar mensaje por WhatsApp con enlace a la web'}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.2-1.2l-.3-.2-3.1.9.9-3-.2-.3A8 8 0 1 1 12 20zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8.9-.3.1-.6 0a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4s0-.3 0-.4-.5-1.3-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8s2.2 3.4 5.3 4.7c.7.3 1.3.5 1.8.7.8.2 1.5.2 2.1.1.7-.1 2.1-.9 2.4-1.7s.3-1.5.2-1.7-.3-.2-.5-.3z"/></svg>
                        <span>${isResend ? 'Reenviar' : 'Enviar'}</span>
                      </button>

                      <!-- Ver Web Personalizada del Invitado -->
                      <button class="btn-icon-subtle btn-view-guest-web" data-token="${g.token}" title="Ver cómo verá este invitado su web de boda">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </button>

                      <!-- Copiar Link Web -->
                      <button class="btn-icon-subtle btn-copy-rsvp-link" data-guest-id="${g.id}" title="Copiar enlace web de invitación para este invitado">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      </button>

                      <!-- Editar Invitado -->
                      <button class="btn-icon-subtle btn-edit-guest" data-guest-id="${g.id}" title="Editar datos del invitado">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>

                      <!-- Eliminar Invitado -->
                      <button class="btn-icon-subtle text-danger btn-delete-guest" data-guest-id="${g.id}" title="Eliminar invitado">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
}

// -------------------------------------------------------------
// SUB-TAB 2: ADMINISTRADOR DE LA WEB DE INVITACIÓN (CHUNGDOI STYLE)
// -------------------------------------------------------------
function renderWeddingWebAdminSubTab(web, settings, guests) {
  const firstGuest = guests.find(guest => guest.token);
  const publicWebUrl = getInvitationWebUrl(firstGuest?.token);

  return `
    <div class="web-admin-wrapper">
      <!-- Barra Superior de Acciones Rápidas -->
      <div class="web-admin-quick-bar">
        <div>
          <h3 class="panel-section-title">Editor Administrable de la Web de Invitación</h3>
          <p class="panel-section-sub">Personaliza fotos, video, música, mapas de ubicación y cuentas de regalos de tu web estilo ChungDoi</p>
        </div>
        <div class="web-admin-cta-group">
          <button type="button" class="btn btn-outline btn-copy-public-link" data-url="${escapeHtml(publicWebUrl)}" title="Copiar enlace web para probar desde un celular">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span>Copiar Enlace Web</span>
          </button>
          <button type="button" class="btn btn-primary btn-preview-fullscreen" id="btn-admin-preview-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>Ver Web en Pantalla Completa</span>
          </button>
        </div>
      </div>

      <form id="form-wedding-web-admin" class="web-admin-form">
        <div class="web-admin-card public-site-url-card">
          <label class="form-label" for="web-public-site-url">URL pública de la invitación</label>
          <input type="url" id="web-public-site-url" class="form-input" value="${escapeHtml(web.publicSiteUrl || DEFAULT_WEDDING_WEB.publicSiteUrl)}" placeholder="https://tudominio.com/" required>
          <span class="form-hint">Usa la dirección publicada de GitHub Pages para que tus invitados puedan abrir el enlace desde cualquier celular. Guarda los cambios y vuelve a copiar el enlace de prueba.</span>
        </div>

        <!-- SECCIÓN 1: FOTOS PRINCIPALES & PORTADA -->
        <div class="web-admin-card">
          <div class="card-section-header">
            <div class="header-icon-circle">📸</div>
            <div>
              <h4 class="card-section-title">Fotos de Portada & Novios</h4>
              <p class="card-section-desc">Sube fotos desde tu computadora o ingresa URLs de imágenes en alta resolución</p>
            </div>
          </div>

          <div class="form-row-2">
            <!-- Foto de Portada (Hero) -->
            <div class="media-upload-card">
              <label class="form-label">Foto de Portada Principal (Hero)</label>
              <div class="media-preview-box">
                <img id="preview-cover-photo" src="${escapeHtml(web.coverPhoto || '')}" alt="Vista previa portada">
              </div>
              <div class="media-inputs-row">
                <input type="text" id="web-cover-photo" class="form-input" value="${escapeHtml(web.coverPhoto || '')}" placeholder="URL de la imagen...">
                <label class="btn btn-secondary btn-sm btn-file-upload">
                  <span>Subir Foto</span>
                  <input type="file" class="hidden-file-input" data-target-input="web-cover-photo" data-target-preview="preview-cover-photo" accept="image/*">
                </label>
              </div>
            </div>

            <!-- Foto de la Pareja (Nuestra Historia) -->
            <div class="media-upload-card">
              <label class="form-label">Foto de los Novios (Nuestra Historia)</label>
              <div class="media-preview-box">
                <img id="preview-couple-photo" src="${escapeHtml(web.couplePhoto || '')}" alt="Vista previa novios">
              </div>
              <div class="media-inputs-row">
                <input type="text" id="web-couple-photo" class="form-input" value="${escapeHtml(web.couplePhoto || '')}" placeholder="URL de la imagen...">
                <label class="btn btn-secondary btn-sm btn-file-upload">
                  <span>Subir Foto</span>
                  <input type="file" class="hidden-file-input" data-target-input="web-couple-photo" data-target-preview="preview-couple-photo" accept="image/*">
                </label>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label" for="web-love-story">Texto de Nuestra Historia / Dedicatoria</label>
            <textarea id="web-love-story" class="form-textarea" rows="3">${escapeHtml(web.loveStory || '')}</textarea>
          </div>
        </div>

        <!-- SECCIÓN 2: VIDEO & MÚSICA DE FONDO -->
        <div class="web-admin-card">
          <div class="card-section-header">
            <div class="header-icon-circle" style="background:#FFFBEB; color:#D97706;">🎥</div>
            <div>
              <h4 class="card-section-title">Video & Música Romántica de Fondo</h4>
              <p class="card-section-desc">Agrega una canción significativa y video de la sesión de los novios</p>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="web-music-url">Música de Fondo</label>
              <input type="text" id="web-music-url" class="form-input" value="${escapeHtml(web.musicUrl || '')}" placeholder="URL opcional del MP3">
              <div class="music-upload-row">
                <label class="btn btn-secondary btn-sm btn-file-upload">
                  <span>Subir canción MP3</span>
                  <input type="file" id="web-music-file" class="hidden-file-input" accept=".mp3,audio/mpeg">
                </label>
                <span class="form-hint">MP3 de hasta 20 MB. Se guardará en Supabase Storage.</span>
              </div>
              <p id="web-music-upload-status" class="form-hint music-upload-status" role="status" aria-live="polite"></p>
              <audio id="web-music-preview" class="music-preview" controls preload="none" ${web.musicUrl ? `src="${escapeHtml(web.musicUrl)}"` : 'hidden'}>
                Tu navegador no admite la reproducción de audio.
              </audio>
            </div>

            <div class="form-group">
              <label class="form-label" for="web-video-url">Video de los Novios (YouTube o Vimeo)</label>
              <input type="text" id="web-video-url" class="form-input" value="${escapeHtml(web.videoUrl || '')}" placeholder="https://www.youtube.com/watch?v=...">
              <span class="form-hint">Opcional. Se mostrará en una sección de video dedicada</span>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: UBICACIONES & FOTOS (IGLESIA & RECEPCIÓN) -->
        <div class="web-admin-card">
          <div class="card-section-header">
            <div class="header-icon-circle" style="background:#ECFDF5; color:#059669;">📍</div>
            <div>
              <h4 class="card-section-title">Ubicaciones Interactivas & Enlaces de Google Maps</h4>
              <p class="card-section-desc">Tus invitados podrán abrir el mapa y llegar con un solo clic</p>
            </div>
          </div>

          <!-- Parroquia / Iglesia -->
          <div class="location-admin-box">
            <h5 class="location-admin-sub">⛪ Ceremonia Religiosa (Parroquia / Iglesia)</h5>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="web-church-name">Nombre de la Parroquia</label>
                <input type="text" id="web-church-name" class="form-input" value="${escapeHtml(settings.churchName || '')}" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="web-church-address">Dirección Exacta</label>
                <input type="text" id="web-church-address" class="form-input" value="${escapeHtml(web.churchAddress || '')}">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="web-church-map">Enlace de Google Maps / Waze</label>
                <input type="text" id="web-church-map" class="form-input" value="${escapeHtml(web.churchMapUrl || '')}" placeholder="https://maps.google.com/...">
              </div>
              <div class="form-group">
                <label class="form-label" for="web-church-photo">Foto de la Iglesia (URL o subir)</label>
                <div class="media-inputs-row">
                  <input type="text" id="web-church-photo" class="form-input" value="${escapeHtml(web.churchPhoto || '')}">
                  <label class="btn btn-secondary btn-sm btn-file-upload">
                    <span>Subir</span>
                    <input type="file" class="hidden-file-input" data-target-input="web-church-photo" accept="image/*">
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Recepción / Fiesta -->
          <div class="location-admin-box" style="margin-top: 1.25rem;">
            <h5 class="location-admin-sub">🎉 Fiesta & Recepción (Local / Salón)</h5>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="web-reception-name">Nombre del Local de Recepción</label>
                <input type="text" id="web-reception-name" class="form-input" value="${escapeHtml(settings.receptionVenue || '')}" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="web-reception-address">Dirección Exacta</label>
                <input type="text" id="web-reception-address" class="form-input" value="${escapeHtml(web.receptionAddress || '')}">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="web-reception-map">Enlace de Google Maps / Waze</label>
                <input type="text" id="web-reception-map" class="form-input" value="${escapeHtml(web.receptionMapUrl || '')}" placeholder="https://maps.google.com/...">
              </div>
              <div class="form-group">
                <label class="form-label" for="web-reception-photo">Foto del Local (URL o subir)</label>
                <div class="media-inputs-row">
                  <input type="text" id="web-reception-photo" class="form-input" value="${escapeHtml(web.receptionPhoto || '')}">
                  <label class="btn btn-secondary btn-sm btn-file-upload">
                    <span>Subir</span>
                    <input type="file" class="hidden-file-input" data-target-input="web-reception-photo" accept="image/*">
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 4: GALERÍA DE FOTOS PREBODA -->
        <div class="web-admin-card">
          <div class="card-section-header">
            <div class="header-icon-circle" style="background:#FDF2F8; color:#DB2777;">🖼️</div>
            <div>
              <h4 class="card-section-title">Galería de Fotos Preboda</h4>
              <p class="card-section-desc">Comparte tus mejores momentos en pareja</p>
            </div>
          </div>

          <div class="gallery-admin-grid" id="admin-gallery-list">
            ${(web.gallery || []).map((imgUrl, idx) => `
              <div class="gallery-thumb-item" data-idx="${idx}">
                <img src="${escapeHtml(imgUrl)}" alt="Miniatura ${idx + 1}">
                <button type="button" class="btn-remove-gallery-img" data-idx="${idx}" title="Eliminar foto">&times;</button>
              </div>
            `).join('')}
          </div>

          <div class="gallery-add-toolbar">
            <div class="media-inputs-row">
              <input type="text" id="web-new-gallery-url" class="form-input" placeholder="Pegar URL de nueva foto...">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-add-gallery-url">+ Agregar URL</button>
              <label class="btn btn-primary btn-sm btn-file-upload">
                <span>📁 Subir desde PC</span>
                <input type="file" id="file-add-gallery" accept="image/*">
              </label>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 5: CÓDIGO DE VESTIMENTA & REGALOS -->
        <div class="web-admin-card">
          <div class="card-section-header">
            <div class="header-icon-circle" style="background:#EFF6FF; color:#2563EB;">🎁</div>
            <div>
              <h4 class="card-section-title">Código de Vestimenta & Mesa de Regalos / Cuentas</h4>
              <p class="card-section-desc">Instrucciones de vestuario, datos de transferencia BCP/BBVA y números Yape/Plin</p>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="web-dresscode-title">Título Dress Code</label>
              <input type="text" id="web-dresscode-title" class="form-input" value="${escapeHtml(web.dressCodeTitle || 'Elegante / Traje Formal')}">
            </div>
            <div class="form-group">
              <label class="form-label" for="web-dresscode-note">Nota de Vestimenta</label>
              <input type="text" id="web-dresscode-note" class="form-input" value="${escapeHtml(web.dressCodeNote || '')}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="web-gift-note">Mensaje de Lluvia de Sobres / Agradecimiento</label>
            <textarea id="web-gift-note" class="form-textarea" rows="2">${escapeHtml(web.giftNote || '')}</textarea>
          </div>

          <!-- Cuentas Bancarias & Yape -->
          <div class="form-row-2" style="margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label" for="web-bank-bcp">Cuenta BCP (N° y CCI)</label>
              <input type="text" id="web-bank-bcp" class="form-input" value="${escapeHtml(web.bankAccounts?.[0]?.number || '193-98765432-0-12')}" placeholder="N° Cuenta BCP">
            </div>
            <div class="form-group">
              <label class="form-label" for="web-bank-bbva">Cuenta BBVA (N° y CCI)</label>
              <input type="text" id="web-bank-bbva" class="form-input" value="${escapeHtml(web.bankAccounts?.[1]?.number || '0011-0123-0200456789')}" placeholder="N° Cuenta BBVA">
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="web-wallet-yape">Número para Yape</label>
              <input type="text" id="web-wallet-yape" class="form-input" value="${escapeHtml(web.digitalWallets?.[0]?.phone || '987 654 321')}">
            </div>
            <div class="form-group">
              <label class="form-label" for="web-wallet-plin">Número para Plin</label>
              <input type="text" id="web-wallet-plin" class="form-input" value="${escapeHtml(web.digitalWallets?.[1]?.phone || '992 334 455')}">
            </div>
          </div>
        </div>

        <!-- Botón Guardar Todos los Cambios -->
        <div class="web-admin-submit-bar">
          <button type="submit" class="btn btn-primary btn-lg" id="btn-save-web-admin">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Guardar Todos los Cambios de la Web</span>
          </button>
        </div>
      </form>
    </div>
  `;
}

// -------------------------------------------------------------
// SUB-TAB 3: DISEÑADOR DEL MENSAJE WHATSAPP (MINIMALISTA CON LINK WEB)
// -------------------------------------------------------------
function renderDesignerSubTab(templates, currentTemplate, guests, settings) {
  const previewGuest = guests.find(g => g.id === previewGuestId) || guests[0] || {
    id: 'sample',
    name: 'Familia Mendoza Quispe',
    phone: '51987654321',
    passes: 3,
    token: 'ejemplo-demo-token'
  };

  const compiledMessage = compileInvitationMessage(currentTemplate.content, previewGuest, settings);
  const formattedHtml = formatWhatsAppTextToHtml(compiledMessage);
  const webUrl = getInvitationWebUrl(previewGuest.token);

  return `
    <div class="inv-designer-layout">
      <!-- Columna Izquierda: Editor de Plantilla -->
      <div class="inv-editor-panel">
        <div class="card-inner-header">
          <div>
            <h3 class="panel-section-title">Editor del Mensaje de WhatsApp</h3>
            <p class="panel-section-sub">Redacta el mensaje minimalista que invitará a tus familiares a abrir la web de tu boda</p>
          </div>
          <div class="template-selector-wrap">
            <select id="designer-template-select" class="template-picker-dropdown">
              ${templates.map(t => `<option value="${t.id}" ${t.id === currentTemplate.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}
            </select>
            <button class="btn btn-secondary btn-sm" id="btn-create-new-template" title="Crear nueva plantilla">+ Nueva</button>
          </div>
        </div>

        <form id="form-invitation-template" class="inv-template-form">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="tpl-name-input">Nombre del Modelo</label>
              <input type="text" id="tpl-name-input" class="form-input" value="${escapeHtml(currentTemplate.name || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="tpl-tagline-input">Descripción / Estilo</label>
              <input type="text" id="tpl-tagline-input" class="form-input" value="${escapeHtml(currentTemplate.tagline || '')}" placeholder="Ej. Minimalista con Web, Formal, etc.">
            </div>
          </div>

          <!-- Variable Helper Chips -->
          <div class="variable-chips-container">
            <span class="chips-label">Variables automáticas (haz clic para insertar en el texto):</span>
            <div class="chips-list">
              <button type="button" class="var-chip chip-highlight" data-var="{link_invitacion}" title="Enlace directo a la web interactiva de boda">{link_invitacion}</button>
              <button type="button" class="var-chip" data-var="{nombre}" title="Nombre del invitado">{nombre}</button>
              <button type="button" class="var-chip" data-var="{novio}" title="Nombre del novio">{novio}</button>
              <button type="button" class="var-chip" data-var="{novia}" title="Nombre de la novia">{novia}</button>
              <button type="button" class="var-chip" data-var="{fecha}" title="Fecha de la boda">{fecha}</button>
              <button type="button" class="var-chip" data-var="{hora}" title="Hora">{hora}</button>
              <button type="button" class="var-chip" data-var="{iglesia}" title="Parroquia">{iglesia}</button>
              <button type="button" class="var-chip" data-var="{recepcion}" title="Local">{recepcion}</button>
              <button type="button" class="var-chip" data-var="{pases}" title="Pases reservados">{pases}</button>
            </div>
          </div>

          <div class="form-group">
            <div class="textarea-header-row">
              <label class="form-label" for="tpl-content-textarea">Cuerpo del Mensaje de WhatsApp</label>
              <span class="formatting-hint">Usa *negrita*, _cursiva_, emojis y enlaces</span>
            </div>
            <textarea id="tpl-content-textarea" class="form-textarea inv-textarea-editor" rows="15" required>${escapeHtml(currentTemplate.content || '')}</textarea>
          </div>

          <div class="form-actions-bar">
            <button type="submit" class="btn btn-primary" id="btn-save-template">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>Guardar Cambios del Mensaje</span>
            </button>
            <button type="button" class="btn btn-secondary" id="btn-reset-default-tpl" title="Restablecer plantilla original">
              <span>Restaurar Predeterminada</span>
            </button>
            ${templates.length > 1 ? `
              <button type="button" class="btn btn-outline text-danger" id="btn-delete-template" title="Eliminar esta plantilla">
                <span>Eliminar</span>
              </button>
            ` : ''}
          </div>
        </form>
      </div>

      <!-- Columna Derecha: Vista Previa Simulador WhatsApp -->
      <div class="inv-preview-panel">
        <div class="preview-panel-header">
          <div class="preview-title-wrap">
            <span class="preview-badge">En Vivo</span>
            <h4 class="preview-header-title">Vista Previa Real en WhatsApp</h4>
          </div>
          <div class="preview-guest-picker">
            <label for="select-preview-guest">Ver como:</label>
            <select id="select-preview-guest" class="preview-guest-select">
              ${guests.map(g => `<option value="${g.id}" ${g.id === previewGuest.id ? 'selected' : ''}>${escapeHtml(g.name)} (${g.passes} pases)</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Dispositivo Móvil / Marco WhatsApp -->
        <div class="whatsapp-mockup-frame">
          <div class="phone-status-bar">
            <span>19:45</span>
            <div class="phone-status-icons">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 21l3.5-.92C9.33 20.64 10.63 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>
              <span>100%</span>
            </div>
          </div>

          <div class="wa-chat-header">
            <div class="wa-chat-header-left">
              <svg class="wa-back-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <div class="wa-avatar-ring">👰🤵</div>
              <div class="wa-contact-info">
                <span class="wa-contact-name">Boda &bull; ${escapeHtml(settings.groomName || 'Él')} & ${escapeHtml(settings.brideName || 'Ella')}</span>
                <span class="wa-contact-status">en línea</span>
              </div>
            </div>
            <div class="wa-chat-header-right">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </div>
          </div>

          <div class="wa-chat-body">
            <div class="wa-date-pill">HOY</div>

            <div class="wa-speech-bubble" id="live-wa-bubble">
              <div class="wa-message-text" id="live-wa-text">
                ${formattedHtml}
              </div>
              
              <!-- Botón simulado para abrir la web -->
              <div class="wa-interactive-button-preview">
                <a href="${webUrl}" target="_blank" class="wa-action-btn-simulate" id="btn-simulate-open-web" title="Haz clic para probar cómo se abre la web">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>Abrir Web de Invitación Interactiva</span>
                </a>
              </div>

              <div class="wa-message-meta">
                <span class="wa-timestamp">19:45</span>
                <span class="wa-double-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#53bdeb"><path d="M18 7l-7 7-3-3M22 7l-7 7-1.5-1.5"/></svg>
                </span>
              </div>
            </div>
          </div>

          <div class="wa-input-footer">
            <span class="wa-emoji-icon">😊</span>
            <div class="wa-fake-input">Escribe un mensaje aquí...</div>
            <span class="wa-mic-icon">🎙️</span>
          </div>
        </div>

        <div class="preview-quick-actions">
          <button class="btn btn-secondary btn-sm" id="btn-copy-live-message">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copiar Mensaje</span>
          </button>
          <button class="btn btn-primary btn-sm btn-action-wa" id="btn-test-send-wa">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.2-1.2l-.3-.2-3.1.9.9-3-.2-.3A8 8 0 1 1 12 20zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8.9-.3.1-.6 0a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4s0-.3 0-.4-.5-1.3-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8s2.2 3.4 5.3 4.7c.7.3 1.3.5 1.8.7.8.2 1.5.2 2.1.1.7-.1 2.1-.9 2.4-1.7s.3-1.5.2-1.7-.3-.2-.5-.3z"/></svg>
            <span>Probar en mi WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// SUB-TAB 4: DATOS DE LA BODA (IGLESIA, RECEPCIÓN, ETC.)
// -------------------------------------------------------------
function renderWeddingDetailsSubTab(settings) {
  return `
    <div class="inv-settings-panel">
      <div class="inv-settings-card">
        <div class="card-inner-header">
          <div>
            <h3 class="panel-section-title">Datos Maestros de la Boda Católica</h3>
            <p class="panel-section-sub">Estos datos se sincronizan automáticamente en tu web de invitación y en los mensajes</p>
          </div>
        </div>

        <form id="form-wedding-details" class="inv-settings-form">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="set-groom-name">Nombre del Novio</label>
              <input type="text" id="set-groom-name" class="form-input" value="${escapeHtml(settings.groomName || 'Él')}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="set-bride-name">Nombre de la Novia</label>
              <input type="text" id="set-bride-name" class="form-input" value="${escapeHtml(settings.brideName || 'Ella')}" required>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="set-wedding-date">Fecha de la Boda</label>
              <input type="date" id="set-wedding-date" class="form-input" value="${settings.weddingDate || '2027-02-14'}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="set-wedding-time">Hora de la Ceremonia</label>
              <input type="text" id="set-wedding-time" class="form-input" value="${escapeHtml(settings.weddingTime || '17:30 hrs')}" placeholder="Ej. 17:30 hrs">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="set-church-name">Parroquia / Templo de la Ceremonia Religiosa</label>
            <input type="text" id="set-church-name" class="form-input" value="${escapeHtml(settings.churchName || 'Parroquia San Francisco de Asís')}">
          </div>

          <div class="form-group">
            <label class="form-label" for="set-reception-venue">Local de Recepción / Brindis</label>
            <input type="text" id="set-reception-venue" class="form-input" value="${escapeHtml(settings.receptionVenue || 'Hacienda Villa Esperanza')}">
          </div>

          <div class="form-group">
            <label class="form-label" for="set-dress-code">Código de Vestimenta (Dress Code)</label>
            <input type="text" id="set-dress-code" class="form-input" value="${escapeHtml(settings.dressCode || 'Elegante / Traje Formal Oscuro')}">
          </div>

          <div class="form-actions-bar">
            <button type="submit" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>Actualizar Datos de la Boda</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// EVENT LISTENERS & ATTACHMENTS
// -------------------------------------------------------------
function setupInvitationsEventListeners() {}

function attachDynamicListeners() {
  const container = document.getElementById('invitations-view-container');
  if (!container) return;

  // Botón Abrir Web de Boda en Pantalla Completa
  const btnOpenWeb = document.getElementById('btn-open-wedding-web');
  if (btnOpenWeb) {
    btnOpenWeb.addEventListener('click', () => {
      window.open(createWeddingPreviewUrl(), '_blank', 'noopener,noreferrer');
    });
  }

  const btnAdminPreviewFull = document.getElementById('btn-admin-preview-full');
  if (btnAdminPreviewFull) {
    btnAdminPreviewFull.addEventListener('click', () => {
      window.open(createWeddingPreviewUrl(), '_blank', 'noopener,noreferrer');
    });
  }

  // Cambio de Sub-Pestaña
  container.querySelectorAll('.inv-subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subtab');
      if (target && target !== currentSubTab) {
        currentSubTab = target;
        renderInvitationsView();
      }
    });
  });

  // Filtros de la Tabla
  const searchInput = document.getElementById('inv-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.search = e.target.value;
      const selectionStart = searchInput.selectionStart;
      const selectionEnd = searchInput.selectionEnd;
      renderInvitationsView();
      const updatedSearchInput = document.getElementById('inv-search-input');
      updatedSearchInput?.focus({ preventScroll: true });
      updatedSearchInput?.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  const clearSearchBtn = document.getElementById('btn-clear-search');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      currentFilter.search = '';
      renderInvitationsView();
    });
  }

  const statusFilter = document.getElementById('inv-filter-status');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      currentFilter.status = e.target.value;
      renderInvitationsView();
    });
  }

  const tplFilter = document.getElementById('inv-filter-template');
  if (tplFilter) {
    tplFilter.addEventListener('change', (e) => {
      currentFilter.templateId = e.target.value;
      renderInvitationsView();
    });
  }

  // Botones Agregar Invitado
  document.getElementById('btn-add-guest')?.addEventListener('click', () => openGuestModal(null));
  document.getElementById('btn-empty-add-guest')?.addEventListener('click', () => openGuestModal(null));
  document.getElementById('btn-export-guests-csv')?.addEventListener('click', exportGuestsToCSV);

  // Acciones en la Tabla
  container.querySelectorAll('.btn-send-wa').forEach(btn => {
    btn.addEventListener('click', () => {
      const guestId = btn.getAttribute('data-guest-id');
      sendGuestWhatsApp(guestId);
    });
  });

  container.querySelectorAll('.btn-view-guest-web').forEach(btn => {
    btn.addEventListener('click', () => {
      const token = btn.getAttribute('data-token');
      window.open(createWeddingPreviewUrl(token), '_blank', 'noopener,noreferrer');
    });
  });

  container.querySelectorAll('.btn-copy-rsvp-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const guestId = btn.getAttribute('data-guest-id');
      copyGuestRsvpLink(guestId);
    });
  });

  container.querySelectorAll('.btn-preview-guest-inv').forEach(btn => {
    btn.addEventListener('click', () => {
      const guestId = btn.getAttribute('data-guest-id');
      openGuestPreviewModal(guestId);
    });
  });

  container.querySelectorAll('.btn-edit-guest').forEach(btn => {
    btn.addEventListener('click', () => {
      const guestId = btn.getAttribute('data-guest-id');
      openGuestModal(guestId);
    });
  });

  container.querySelectorAll('.btn-delete-guest').forEach(btn => {
    btn.addEventListener('click', () => {
      const guestId = btn.getAttribute('data-guest-id');
      deleteGuestConfirm(guestId);
    });
  });

  container.querySelectorAll('.btn-quick-status-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const guestId = btn.getAttribute('data-guest-id');
      openQuickStatusMenu(guestId, btn);
    });
  });

  // Copiar Enlace Público de la Web
  document.querySelectorAll('.btn-copy-public-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      navigator.clipboard.writeText(url).then(() => {
        showToast('Enlace general de la web copiado');
      });
    });
  });

  // Subida de Archivos desde el Equipo (Base64)
  container.querySelectorAll('.hidden-file-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const targetInputId = input.getAttribute('data-target-input');
      const targetPreviewId = input.getAttribute('data-target-preview');

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        if (targetInputId) {
          const targetEl = document.getElementById(targetInputId);
          if (targetEl) targetEl.value = base64Url;
        }
        if (targetPreviewId) {
          const previewEl = document.getElementById(targetPreviewId);
          if (previewEl) previewEl.src = base64Url;
        }
        showToast('Foto cargada exitosamente');
      };
      reader.readAsDataURL(file);
    });
  });

  document.getElementById('web-music-file')?.addEventListener('change', async event => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const status = document.getElementById('web-music-upload-status');
    const uploadLabel = input.closest('.btn-file-upload');
    const uploadText = uploadLabel?.querySelector('span');
    if (file.size > 20 * 1024 * 1024) {
      if (status) status.textContent = 'El archivo MP3 no puede superar los 20 MB.';
      input.value = '';
      return;
    }
    if (!/\.mp3$/i.test(file.name) || (file.type && file.type !== 'audio/mpeg')) {
      if (status) status.textContent = 'Selecciona un archivo en formato MP3.';
      input.value = '';
      return;
    }

    input.disabled = true;
    if (uploadText) uploadText.textContent = 'Subiendo canción...';
    if (status) status.textContent = 'Subiendo el MP3 a Supabase Storage...';
    try {
      const musicUrl = await uploadWeddingMusic(file);
      const musicUrlInput = document.getElementById('web-music-url');
      const preview = document.getElementById('web-music-preview');
      if (musicUrlInput) musicUrlInput.value = musicUrl;
      store.updateWeddingWeb({ musicUrl });
      if (preview) {
        preview.src = musicUrl;
        preview.hidden = false;
        preview.load();
      }
      if (status) status.textContent = 'Canción subida y asignada a la invitación. Sincronizando la configuración...';
    } catch (error) {
      console.error('No se pudo subir la canción de la invitación:', error);
      if (status) status.textContent = error.message;
    } finally {
      input.disabled = false;
      if (uploadText) uploadText.textContent = 'Subir canción MP3';
      input.value = '';
    }
  });

  // Guardar Formulario del Administrador Web
  const formWebAdmin = document.getElementById('form-wedding-web-admin');
  if (formWebAdmin) {
    formWebAdmin.addEventListener('submit', (e) => {
      e.preventDefault();
      saveWeddingWebSettings();
    });
  }

  // Galería: Eliminar foto
  container.querySelectorAll('.btn-remove-gallery-img').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      removeGalleryPhoto(idx);
    });
  });

  // Galería: Agregar foto por URL
  document.getElementById('btn-add-gallery-url')?.addEventListener('click', () => {
    const input = document.getElementById('web-new-gallery-url');
    if (input && input.value.trim()) {
      addGalleryPhoto(input.value.trim());
      input.value = '';
    }
  });

  // Galería: Agregar foto subiendo archivo
  document.getElementById('file-add-gallery')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      addGalleryPhoto(event.target.result);
    };
    reader.readAsDataURL(file);
  });

  // Diseñador: Selector de Plantilla
  document.getElementById('designer-template-select')?.addEventListener('change', (e) => {
    selectedTemplateId = e.target.value;
    renderInvitationsView();
  });

  document.getElementById('btn-create-new-template')?.addEventListener('click', createNewTemplatePrompt);
  document.getElementById('btn-delete-template')?.addEventListener('click', () => deleteTemplateConfirm(selectedTemplateId));
  document.getElementById('btn-reset-default-tpl')?.addEventListener('click', () => resetTemplateDefault(selectedTemplateId));

  // Diseñador: Chips de Variables
  container.querySelectorAll('.var-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      insertVariableIntoTextarea(chip.getAttribute('data-var'));
    });
  });

  // Diseñador: Input en tiempo real
  document.getElementById('tpl-content-textarea')?.addEventListener('input', updateLiveBubblePreview);

  // Diseñador: Guardar Plantilla
  document.getElementById('form-invitation-template')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCurrentTemplate();
  });

  // Diseñador: Selector de Invitado de Preview
  document.getElementById('select-preview-guest')?.addEventListener('change', (e) => {
    previewGuestId = e.target.value;
    renderInvitationsView();
  });

  // Diseñador: Copiar Mensaje
  document.getElementById('btn-copy-live-message')?.addEventListener('click', () => {
    const state = store.getState();
    const currentTemplate = (state.invitationTemplates || []).find(t => t.id === selectedTemplateId) || state.invitationTemplates[0];
    const previewGuest = (state.guests || []).find(g => g.id === previewGuestId) || state.guests[0] || { name: 'Invitado', passes: 2, token: 'demo' };
    const compiled = compileInvitationMessage(currentTemplate.content, previewGuest, state.settings);
    navigator.clipboard.writeText(compiled).then(() => showToast('Texto copiado al portapapeles'));
  });

  // Diseñador: Probar en WhatsApp
  document.getElementById('btn-test-send-wa')?.addEventListener('click', () => {
    const state = store.getState();
    const currentTemplate = (state.invitationTemplates || []).find(t => t.id === selectedTemplateId) || state.invitationTemplates[0];
    const previewGuest = (state.guests || []).find(g => g.id === previewGuestId) || state.guests[0] || { name: 'Invitado', passes: 2, token: 'demo' };
    const compiled = compileInvitationMessage(currentTemplate.content, previewGuest, state.settings);
    window.open(createWhatsAppUrl('', compiled), '_blank');
  });

  // Formulario de Datos Maestros
  document.getElementById('form-wedding-details')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateSettings({
      groomName: document.getElementById('set-groom-name').value.trim(),
      brideName: document.getElementById('set-bride-name').value.trim(),
      weddingDate: document.getElementById('set-wedding-date').value,
      weddingTime: document.getElementById('set-wedding-time').value.trim(),
      churchName: document.getElementById('set-church-name').value.trim(),
      receptionVenue: document.getElementById('set-reception-venue').value.trim(),
      dressCode: document.getElementById('set-dress-code').value.trim()
    });
    showToast('Datos de la boda actualizados');
  });
}

// -------------------------------------------------------------
// GUARDADO DEL ADMINISTRADOR DE LA WEB DE BODA
// -------------------------------------------------------------
function saveWeddingWebSettings() {
  const state = store.getState();
  const currentWeb = state.settings.weddingWeb || DEFAULT_WEDDING_WEB;

  const updatedWeb = {
    ...currentWeb,
    coverPhoto: document.getElementById('web-cover-photo')?.value.trim() || currentWeb.coverPhoto,
    couplePhoto: document.getElementById('web-couple-photo')?.value.trim() || currentWeb.couplePhoto,
    publicSiteUrl: document.getElementById('web-public-site-url')?.value.trim() || DEFAULT_WEDDING_WEB.publicSiteUrl,
    loveStory: document.getElementById('web-love-story')?.value.trim() || currentWeb.loveStory,
    musicUrl: document.getElementById('web-music-url')?.value.trim() || currentWeb.musicUrl,
    videoUrl: document.getElementById('web-video-url')?.value.trim() || '',
    churchAddress: document.getElementById('web-church-address')?.value.trim() || currentWeb.churchAddress,
    churchMapUrl: document.getElementById('web-church-map')?.value.trim() || currentWeb.churchMapUrl,
    churchPhoto: document.getElementById('web-church-photo')?.value.trim() || currentWeb.churchPhoto,
    receptionAddress: document.getElementById('web-reception-address')?.value.trim() || currentWeb.receptionAddress,
    receptionMapUrl: document.getElementById('web-reception-map')?.value.trim() || currentWeb.receptionMapUrl,
    receptionPhoto: document.getElementById('web-reception-photo')?.value.trim() || currentWeb.receptionPhoto,
    dressCodeTitle: document.getElementById('web-dresscode-title')?.value.trim() || currentWeb.dressCodeTitle,
    dressCodeNote: document.getElementById('web-dresscode-note')?.value.trim() || currentWeb.dressCodeNote,
    giftNote: document.getElementById('web-gift-note')?.value.trim() || currentWeb.giftNote,
    bankAccounts: [
      { bank: "BCP", type: "Ahorros Soles", number: document.getElementById('web-bank-bcp')?.value.trim() || '', holder: `${state.settings.groomName} & ${state.settings.brideName}` },
      { bank: "BBVA", type: "Ahorros Soles", number: document.getElementById('web-bank-bbva')?.value.trim() || '', holder: `${state.settings.groomName} & ${state.settings.brideName}` }
    ],
    digitalWallets: [
      { app: "Yape", phone: document.getElementById('web-wallet-yape')?.value.trim() || '', holder: state.settings.groomName || 'Él' },
      { app: "Plin", phone: document.getElementById('web-wallet-plin')?.value.trim() || '', holder: state.settings.brideName || 'Ella' }
    ]
  };

  // También sincronizar nombres de iglesia y recepción
  const updatedSettings = {
    churchName: document.getElementById('web-church-name')?.value.trim() || state.settings.churchName,
    receptionVenue: document.getElementById('web-reception-name')?.value.trim() || state.settings.receptionVenue,
    weddingWeb: updatedWeb
  };

  store.updateSettings(updatedSettings);
  showToast('¡Web de Invitación actualizada con éxito!');
  renderInvitationsView();
}

function removeGalleryPhoto(idx) {
  const state = store.getState();
  const currentWeb = state.settings.weddingWeb || DEFAULT_WEDDING_WEB;
  const gallery = [...(currentWeb.gallery || [])];
  gallery.splice(idx, 1);
  store.updateWeddingWeb({ gallery });
  showToast('Foto eliminada de la galería');
  renderInvitationsView();
}

function addGalleryPhoto(url) {
  const state = store.getState();
  const currentWeb = state.settings.weddingWeb || DEFAULT_WEDDING_WEB;
  const gallery = [...(currentWeb.gallery || []), url];
  store.updateWeddingWeb({ gallery });
  showToast('Foto agregada a la galería');
  renderInvitationsView();
}

// -------------------------------------------------------------
// OPERACIONES DEL DISEÑADOR DE MENSAJE
// -------------------------------------------------------------
function updateLiveBubblePreview() {
  const textarea = document.getElementById('tpl-content-textarea');
  const bubbleText = document.getElementById('live-wa-text');
  if (!textarea || !bubbleText) return;

  const state = store.getState();
  const previewGuest = (state.guests || []).find(g => g.id === previewGuestId) || state.guests[0] || {
    id: 'sample',
    name: 'Familia Mendoza Quispe',
    phone: '51987654321',
    passes: 3,
    token: 'ejemplo-demo-token'
  };

  const compiled = compileInvitationMessage(textarea.value, previewGuest, state.settings);
  bubbleText.innerHTML = formatWhatsAppTextToHtml(compiled);
}

function insertVariableIntoTextarea(variableText) {
  const textarea = document.getElementById('tpl-content-textarea');
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const original = textarea.value;

  textarea.value = original.substring(0, start) + variableText + original.substring(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + variableText.length;
  updateLiveBubblePreview();
}

function saveCurrentTemplate() {
  const nameInput = document.getElementById('tpl-name-input');
  const taglineInput = document.getElementById('tpl-tagline-input');
  const textarea = document.getElementById('tpl-content-textarea');

  if (!nameInput || !textarea) return;

  const updated = store.updateInvitationTemplate(selectedTemplateId, {
    name: nameInput.value.trim(),
    tagline: taglineInput ? taglineInput.value.trim() : '',
    content: textarea.value
  });

  if (updated) {
    showToast('Mensaje de plantilla guardado correctamente');
    renderInvitationsView();
  }
}

function createNewTemplatePrompt() {
  const name = prompt('Ingresa un nombre para el nuevo modelo:', 'Invitación Amigos Web');
  if (name && name.trim()) {
    const state = store.getState();
    const baseContent = state.invitationTemplates?.[0]?.content || '';
    const newTpl = store.addInvitationTemplate({
      name: name.trim(),
      tagline: 'Versión personalizada',
      content: baseContent
    });
    selectedTemplateId = newTpl.id;
    showToast('Nuevo modelo creado');
    renderInvitationsView();
  }
}

function deleteTemplateConfirm(templateId) {
  const state = store.getState();
  if (state.invitationTemplates.length <= 1) {
    alert('Debes mantener al menos una plantilla activa.');
    return;
  }
  if (confirm('¿Estás seguro de eliminar este modelo?')) {
    store.deleteInvitationTemplate(templateId);
    selectedTemplateId = store.getState().invitationTemplates[0].id;
    showToast('Modelo eliminado');
    renderInvitationsView();
  }
}

function resetTemplateDefault(templateId) {
  if (confirm('¿Deseas restaurar la redacción predeterminada de esta plantilla?')) {
    const defaultTemplate = DEFAULT_INVITATION_TEMPLATES.find(template => template.id === templateId);
    if (!defaultTemplate) return;

    store.updateInvitationTemplate(templateId, {
      content: defaultTemplate.content,
      headerTitle: defaultTemplate.headerTitle
    });
    showToast('Plantilla restaurada a los valores predeterminados');
    renderInvitationsView();
  }
}

// -------------------------------------------------------------
// ENVÍO DE WHATSAPP DIRECTO
// -------------------------------------------------------------
export function sendGuestWhatsApp(guestId) {
  const state = store.getState();
  const guest = state.guests.find(g => g.id === guestId);
  if (!guest) return;

  const template = state.invitationTemplates.find(t => t.id === guest.templateId) || state.invitationTemplates[0];
  const compiled = compileInvitationMessage(template.content, guest, state.settings);

  store.markGuestInvitationSent(guestId, template.id, compiled);

  const phone = cleanPhoneNumber(guest.phone);
  const waUrl = createWhatsAppUrl(phone, compiled);

  window.open(waUrl, '_blank');
  showToast(`Invitación enviada a ${guest.name}. Estado actualizado.`);
  renderInvitationsView();
}

function copyGuestRsvpLink(guestId) {
  const state = store.getState();
  const guest = state.guests.find(g => g.id === guestId);
  if (!guest) return;

  const url = getInvitationWebUrl(guest.token);
  navigator.clipboard.writeText(url).then(() => {
    showToast(`Enlace web copiado para ${guest.name}`);
  });
}

function deleteGuestConfirm(guestId) {
  const state = store.getState();
  const guest = state.guests.find(g => g.id === guestId);
  if (!guest) return;

  if (confirm(`¿Deseas eliminar a "${guest.name}" de la lista de invitados?`)) {
    store.deleteGuest(guestId);
    showToast('Invitado eliminado');
    renderInvitationsView();
  }
}

// -------------------------------------------------------------
// MODAL AGREGAR / EDITAR INVITADO
// -------------------------------------------------------------
export function openGuestModal(guestId = null) {
  const overlay = document.getElementById('global-modal-overlay');
  const body = document.getElementById('global-modal-body');
  if (!overlay || !body) return;

  const state = store.getState();
  const templates = state.invitationTemplates || [];
  const guest = guestId ? state.guests.find(g => g.id === guestId) : null;
  const isEditing = Boolean(guest);

  body.innerHTML = `
    <div class="modal-card">
      <div class="modal-card-header">
        <div class="modal-title-wrap">
          <div class="modal-badge-icon" style="background:#EFF6FF; color:#2563EB;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          </div>
          <div>
            <h3 class="modal-title">${isEditing ? 'Editar Datos del Invitado' : 'Registrar Nuevo Invitado'}</h3>
            <p class="modal-sub">Asigna pases y número de WhatsApp para su enlace personalizado</p>
          </div>
        </div>
        <button class="modal-close-btn" id="btn-close-guest-modal">&times;</button>
      </div>

      <form id="form-guest-modal" class="modal-form-content">
        <div class="form-group">
          <label class="form-label" for="g-name">Nombre del Invitado o Familia *</label>
          <input type="text" id="g-name" class="form-input" placeholder="Ej. Familia Rodríguez Solís o Carlos Gómez" value="${isEditing ? escapeHtml(guest.name) : ''}" required>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="g-phone">WhatsApp (con código país)</label>
            <input type="tel" id="g-phone" class="form-input" placeholder="Ej. 51987654321" value="${isEditing ? escapeHtml(guest.phone) : ''}">
            <span class="form-hint">Para Perú: 51 seguido de 9 dígitos</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="g-passes">Pases Reservados *</label>
            <input type="number" id="g-passes" class="form-input" min="1" max="20" value="${isEditing ? guest.passes : 2}" required>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="g-template">Modelo de Invitación</label>
            <select id="g-template" class="form-select">
              ${templates.map(t => `<option value="${t.id}" ${isEditing && guest.templateId === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="g-status">Estado de Asistencia</label>
            <select id="g-status" class="form-select">
              <option value="Sin enviar" ${isEditing && guest.status === 'Sin enviar' ? 'selected' : ''}>⚪ Sin enviar</option>
              <option value="Pendiente" ${isEditing && guest.status === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente de respuesta</option>
              <option value="Confirmado" ${isEditing && guest.status === 'Confirmado' ? 'selected' : ''}>✅ Confirmado</option>
              <option value="Declinado" ${isEditing && guest.status === 'Declinado' ? 'selected' : ''}>❌ Declinado (No asiste)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="g-notes">Notas / Parentesco / Mesa</label>
          <input type="text" id="g-notes" class="form-input" placeholder="Ej. Padrino de aros, Mesa 4" value="${isEditing ? escapeHtml(guest.notes || '') : ''}">
        </div>

        <div class="modal-form-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel-guest-modal">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            <span>${isEditing ? 'Guardar Cambios' : 'Registrar Invitado'}</span>
          </button>
        </div>
      </form>
    </div>
  `;

  overlay.classList.add('active');

  const closeModal = () => overlay.classList.remove('active');
  document.getElementById('btn-close-guest-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel-guest-modal')?.addEventListener('click', closeModal);

  document.getElementById('form-guest-modal')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const guestData = {
      name: document.getElementById('g-name').value.trim(),
      phone: document.getElementById('g-phone').value.trim(),
      passes: parseInt(document.getElementById('g-passes').value, 10) || 1,
      templateId: document.getElementById('g-template').value,
      status: document.getElementById('g-status').value,
      notes: document.getElementById('g-notes').value.trim()
    };

    if (isEditing) {
      store.updateGuest(guest.id, guestData);
      showToast('Invitado actualizado con éxito');
    } else {
      store.addGuest(guestData);
      showToast('Invitado agregado a la lista');
    }

    closeModal();
    renderInvitationsView();
  });
}

// -------------------------------------------------------------
// MODAL VISTA PREVIA DEL MENSAJE PERSONALIZADO
// -------------------------------------------------------------
function openGuestPreviewModal(guestId) {
  const overlay = document.getElementById('global-modal-overlay');
  const body = document.getElementById('global-modal-body');
  if (!overlay || !body) return;

  const state = store.getState();
  const guest = state.guests.find(g => g.id === guestId);
  if (!guest) return;

  const template = state.invitationTemplates.find(t => t.id === guest.templateId) || state.invitationTemplates[0];
  const compiled = compileInvitationMessage(template.content, guest, state.settings);
  const formattedHtml = formatWhatsAppTextToHtml(compiled);
  const webUrl = getInvitationWebUrl(guest.token);

  body.innerHTML = `
    <div class="modal-card modal-card-wide">
      <div class="modal-card-header">
        <div class="modal-title-wrap">
          <div class="modal-badge-icon" style="background:#ECFDF5; color:#059669;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.2-1.2l-.3-.2-3.1.9.9-3-.2-.3A8 8 0 1 1 12 20zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8.9-.3.1-.6 0a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4s0-.3 0-.4-.5-1.3-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8s2.2 3.4 5.3 4.7c.7.3 1.3.5 1.8.7.8.2 1.5.2 2.1.1.7-.1 2.1-.9 2.4-1.7s.3-1.5.2-1.7-.3-.2-.5-.3z"/></svg>
          </div>
          <div>
            <h3 class="modal-title">Mensaje para: ${escapeHtml(guest.name)}</h3>
            <p class="modal-sub">Plantilla: <strong>${escapeHtml(template.name)}</strong> &bull; ${guest.passes} pases reservados</p>
          </div>
        </div>
        <button class="modal-close-btn" id="btn-close-preview-modal">&times;</button>
      </div>

      <div class="modal-preview-body">
        <div class="preview-bubble-container">
          <div class="wa-speech-bubble-preview">
            <div class="wa-message-text">
              ${formattedHtml}
            </div>
            <div class="wa-interactive-button-preview">
              <a href="${webUrl}" target="_blank" class="wa-action-btn-simulate">
                <span>🌐 Abrir Web de Invitación Interactiva</span>
              </a>
            </div>
            <div class="wa-message-meta">
              <span class="wa-timestamp">Ahora</span>
              <span class="wa-double-check">✓✓</span>
            </div>
          </div>
        </div>

        <div class="preview-meta-details">
          <div class="detail-row">
            <span class="detail-label">Enlace Web de Boda:</span>
            <input type="text" class="form-input form-input-sm" readonly value="${webUrl}" id="modal-web-url-input">
          </div>
        </div>
      </div>

      <div class="modal-form-actions">
        <button type="button" class="btn btn-secondary" id="btn-modal-copy-text">
          <span>Copiar Mensaje</span>
        </button>
        <button type="button" class="btn btn-outline" id="btn-modal-open-web" style="border-color:#C5A059; color:#C5A059;">
          <span>Ver su Web</span>
        </button>
        <button type="button" class="btn btn-primary btn-action-wa" id="btn-modal-send-wa">
          <span>Enviar por WhatsApp</span>
        </button>
      </div>
    </div>
  `;

  overlay.classList.add('active');

  const closeModal = () => overlay.classList.remove('active');
  document.getElementById('btn-close-preview-modal')?.addEventListener('click', closeModal);

  document.getElementById('btn-modal-copy-text')?.addEventListener('click', () => {
    navigator.clipboard.writeText(compiled).then(() => showToast('Mensaje copiado'));
  });

  document.getElementById('btn-modal-open-web')?.addEventListener('click', () => {
    closeModal();
    window.open(createWeddingPreviewUrl(guest.token), '_blank', 'noopener,noreferrer');
  });

  document.getElementById('btn-modal-send-wa')?.addEventListener('click', () => {
    closeModal();
    sendGuestWhatsApp(guest.id);
  });
}

function openQuickStatusMenu(guestId, triggerBtn) {
  const state = store.getState();
  const guest = state.guests.find(g => g.id === guestId);
  if (!guest) return;

  const current = guest.status;
  const options = ['Confirmado', 'Pendiente', 'Actualizada enviada', 'Sin enviar', 'Declinado'];
  const newStatus = prompt(`Cambiar estado de ${guest.name}:\nOpciones: ${options.join(', ')}`, current);
  
  if (newStatus && options.includes(newStatus.trim())) {
    const statusVal = newStatus.trim();
    store.updateGuest(guestId, {
      status: statusVal,
      confirmedPasses: statusVal === 'Confirmado' ? (guest.confirmedPasses || guest.passes) : 0,
      confirmedAt: statusVal === 'Confirmado' ? new Date().toISOString() : guest.confirmedAt
    });
    showToast(`Estado actualizado a ${statusVal}`);
    renderInvitationsView();
  }
}

// -------------------------------------------------------------
// COMPILADOR Y GENERADOR DE ENLACES WEB
// -------------------------------------------------------------
export function compileInvitationMessage(templateContent, guest, settings) {
  if (!templateContent) return '';

  const passesText = guest.passes > 1 ? `${guest.passes} pases` : '1 pase individual';
  const invitationWebUrl = getInvitationWebUrl(guest.token);
  const confirmationUrl = `${invitationWebUrl}#section-rsvp`;

  return templateContent
    .replace(/{nombre}/g, guest.name || 'Apreciado Invitado')
    .replace(/{novio}/g, settings.groomName || 'Él')
    .replace(/{novia}/g, settings.brideName || 'Ella')
    .replace(/{fecha}/g, formatFullDate(settings.weddingDate))
    .replace(/{hora}/g, settings.weddingTime || '17:30 hrs')
    .replace(/{iglesia}/g, settings.churchName || 'Parroquia San Francisco')
    .replace(/{recepcion}/g, settings.receptionVenue || 'Salón de Recepción')
    .replace(/{vestimenta}/g, settings.dressCode || 'Elegante / Formal')
    .replace(/{pases}/g, passesText)
    .replace(/{link_invitacion}/g, invitationWebUrl)
    .replace(/{link_confirmacion}/g, confirmationUrl)
    .replace(/\uFFFD/g, '✦');
}

function createWhatsAppUrl(phone, message) {
  const url = new URL(phone ? `https://wa.me/${phone}` : 'https://wa.me/');
  url.searchParams.set('text', message);
  return url.toString();
}

function getInvitationWebUrl(token) {
  const state = store.getState();
  const configuredUrl = state.settings?.weddingWeb?.publicSiteUrl || DEFAULT_WEDDING_WEB.publicSiteUrl;
  const publicUrl = new URL(configuredUrl);
  const basePath = publicUrl.pathname.replace(/invitacion\/?$/i, '').replace(/\/?$/, '/');
  publicUrl.pathname = `${basePath}invitacion/`;
  publicUrl.search = '';
  publicUrl.hash = '';
  if (token) publicUrl.searchParams.set('invitacion', token);
  return publicUrl.toString();
}

function createWeddingPreviewUrl(token = null) {
  const previewUrl = new URL('invitacion/', window.location.href);
  previewUrl.search = '';
  previewUrl.hash = '';
  if (token) previewUrl.searchParams.set('invitacion', token);
  previewUrl.searchParams.set('preview', '1');
  return previewUrl.toString();
}

export function formatWhatsAppTextToHtml(text) {
  if (!text) return '';

  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/_([^_]+)_/g, '<em>$1</em>');
  escaped = escaped.replace(/~([^~]+)~/g, '<del>$1</del>');
  escaped = escaped.replace(/\n/g, '<br>');

  return escaped;
}

function getStatusBadgeHtml(status, confirmedPasses, totalPasses) {
  switch (status) {
    case 'Confirmado':
      return `<span class="badge-rsvp badge-confirmed" title="${confirmedPasses || totalPasses} de ${totalPasses} pases confirmados">✓ Confirmado (${confirmedPasses || totalPasses})</span>`;
    case 'Pendiente':
      return `<span class="badge-rsvp badge-pending">⏳ Pendiente</span>`;
    case 'Actualizada enviada':
      return `<span class="badge-rsvp badge-updated" title="Se le reenvió una versión modificada">🔄 Actualizada enviada</span>`;
    case 'Declinado':
      return `<span class="badge-rsvp badge-declined">✕ Declinado</span>`;
    case 'Sin enviar':
    default:
      return `<span class="badge-rsvp badge-unsend">⚪ Sin enviar</span>`;
  }
}

function cleanPhoneNumber(phone) {
  return (phone || '').replace(/[^0-9]/g, '');
}

function formatFullDate(dateStr) {
  if (!dateStr) return 'Fecha por definir';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${day} de ${months[month]} del ${year}`;
  }
  return dateStr;
}

function formatShortDate(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} ${hours}:${mins}`;
  } catch {
    return isoStr;
  }
}

function exportGuestsToCSV() {
  const state = store.getState();
  const guests = state.guests || [];
  const templates = state.invitationTemplates || [];
  const templateMap = {};
  templates.forEach(t => { templateMap[t.id] = t.name; });

  const headers = ['#', 'Nombre Invitado', 'Telefono', 'Pases Reservados', 'Pases Confirmados', 'Estado RSVP', 'Plantilla', 'Fecha Envio', 'Fecha Confirmacion', 'Notas'];
  const rows = guests.map((g, i) => [
    i + 1,
    `"${(g.name || '').replace(/"/g, '""')}"`,
    `"${(g.phone || '')}"`,
    g.passes || 1,
    g.confirmedPasses || 0,
    `"${g.status}"`,
    `"${(templateMap[g.templateId] || 'Minimalista Web').replace(/"/g, '""')}"`,
    `"${g.sentAt ? formatShortDate(g.sentAt) : 'No enviado'}"`,
    `"${g.confirmedAt ? formatShortDate(g.confirmedAt) : 'Pendiente'}"`,
    `"${(g.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lista_Invitados_Boda_RSVP_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Lista de invitados descargada en CSV');
}

export function handleRsvpLanding(token) {
  renderWeddingWebPage(token);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message) {
  const toast = document.getElementById('global-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}
