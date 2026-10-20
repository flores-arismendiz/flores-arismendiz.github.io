// Archivo Principal de Inicialización y Enrutador con Sidebar Layout
import { store } from './store.js';
import { initDashboardModule, renderDashboardView } from './modules/dashboard.js';
import { initTasksModule, renderTasksView, openTaskModal } from './modules/tasks.js';
import { initSavingsModule, renderSavingsView } from './modules/savings.js';
import { initBudgetModule, renderBudgetView, openExpenseModal } from './modules/budget.js';
import { initInvitationsModule, renderInvitationsView, handleRsvpLanding } from './modules/invitations.js';
import { renderWeddingWebPage } from './modules/wedding_web.js';
import { initExportModule, renderExportView } from './modules/export.js';
import { setupCloudAccount } from './cloud-account.js';
import { getPublicWeddingGuest } from './supabase.js';

let activeTab = 'dashboard';

const TAB_TITLES = {
  dashboard: 'Dashboard Analítico',
  tasks: 'Gestión de Pendientes & Trámites',
  savings: 'Fondo de Ahorro & Metas en Pareja',
  budget: 'Control Presupuestario & Proveedores',
  invitations: 'Invitaciones WhatsApp & Web Nupcial',
  export: 'Reportes, Excel & Respaldo'
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  setupNavigation();
  setupSidebarDrawer();
  setupTopbarQuickActions();
  setupGlobalModals();
  setupCountdown();
  setupCloudAccount();

  // Exponer apertura de la web de boda globalmente
  window.openWeddingWeb = (token = null) => renderWeddingWebPage(token);

  // Inicializar módulos
  initDashboardModule();
  initTasksModule();
  initSavingsModule();
  initBudgetModule();
  initInvitationsModule();
  initExportModule();

  // Verificar si viene con enlace a la Web de Invitación (?invitacion=token, ?boda=token, ?rsvp=token)
  const urlParams = new URLSearchParams(window.location.search);
  const webToken = urlParams.get('invitacion') || urlParams.get('boda') || urlParams.get('rsvp') || urlParams.get('confirm');
  if (webToken) {
    getPublicWeddingGuest(webToken)
      .then(guest => renderWeddingWebPage(webToken, guest))
      .catch(error => {
        console.error('No se pudo cargar la invitación pública de Supabase:', error);
        renderWeddingWebPage(webToken);
      });
  } else {
    // Mostrar pestaña inicial
    navigateToTab('dashboard');
  }

  // Suscribirse para actualizar contadores en el header y sidebar
  store.subscribe(updateHeaderBadges);
  updateHeaderBadges();
}

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-tab-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      if (target) {
        navigateToTab(target);
        // En móvil, cerrar el drawer lateral al hacer clic
        closeMobileSidebar();
      }
    });
  });

  // Exponer navegación global para llamadas cruzadas
  window.navigateToTab = (tabId) => {
    activeTab = tabId;

    // Actualizar botones de navegación en sidebar
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Actualizar título en el Topbar
    const titleEl = document.getElementById('topbar-section-title');
    if (titleEl && TAB_TITLES[tabId]) {
      titleEl.textContent = TAB_TITLES[tabId];
    }

    // Actualizar contenedores de vista
    const tabViews = {
      dashboard: document.getElementById('dashboard-view-container'),
      tasks: document.getElementById('tasks-view-container'),
      savings: document.getElementById('savings-view-container'),
      budget: document.getElementById('budget-view-container'),
      invitations: document.getElementById('invitations-view-container'),
      export: document.getElementById('export-view-container')
    };

    Object.keys(tabViews).forEach(key => {
      if (tabViews[key]) {
        if (key === tabId) {
          tabViews[key].style.display = 'block';
          tabViews[key].classList.add('fade-in');
        } else {
          tabViews[key].style.display = 'none';
          tabViews[key].classList.remove('fade-in');
        }
      }
    });

    // Forzar re-renderizado / actualización de gráficos según pestaña
    if (tabId === 'dashboard') {
      renderDashboardView();
    } else if (tabId === 'tasks') {
      renderTasksView();
    } else if (tabId === 'savings') {
      renderSavingsView();
    } else if (tabId === 'budget') {
      renderBudgetView();
    } else if (tabId === 'invitations') {
      renderInvitationsView();
    } else if (tabId === 'export') {
      renderExportView();
    }

    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

function setupSidebarDrawer() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggleBtn = document.getElementById('btn-mobile-sidebar-toggle');
  const closeBtn = document.getElementById('btn-sidebar-close');

  if (toggleBtn && sidebar && backdrop) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.add('sidebar-open');
      backdrop.classList.add('active');
    });
  }

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('sidebar-open');
    if (backdrop) backdrop.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  window.closeMobileSidebar = closeSidebar;
}

function setupTopbarQuickActions() {
  // Botón rápido en topbar: + Tarea
  const btnTask = document.getElementById('topbar-btn-new-task');
  if (btnTask) {
    btnTask.addEventListener('click', () => {
      openTaskModal(null);
    });
  }

  // Botón rápido en topbar: + Gasto
  const btnExpense = document.getElementById('topbar-btn-new-expense');
  if (btnExpense) {
    btnExpense.addEventListener('click', () => {
      openExpenseModal(null);
    });
  }
}

function setupGlobalModals() {
  const overlay = document.getElementById('global-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  }

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
    }
  });
}

function setupCountdown() {
  const countdownNumberEl = document.getElementById('sidebar-countdown-number');
  if (!countdownNumberEl) return;

  const state = store.getState();
  const targetDateStr = state.settings.weddingDate || '2027-02-14';
  const targetDate = new Date(targetDateStr + 'T00:00:00');
  const now = new Date();

  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    countdownNumberEl.textContent = diffDays;
  } else if (diffDays === 0) {
    countdownNumberEl.textContent = '¡Hoy!';
  } else {
    countdownNumberEl.textContent = '✓';
  }
}

function updateHeaderBadges() {
  const metrics = store.getMetrics();
  
  // Badge de tareas pendientes en sidebar
  const pendingBadge = document.getElementById('nav-pending-badge');
  if (pendingBadge) {
    pendingBadge.textContent = metrics.pendingTasks;
    pendingBadge.style.display = metrics.pendingTasks > 0 ? 'inline-flex' : 'none';
  }

  // Badge de confirmaciones RSVP en sidebar
  const invBadge = document.getElementById('nav-invitations-badge');
  if (invBadge && metrics.invitations) {
    invBadge.textContent = `${metrics.invitations.confirmedCount}/${metrics.invitations.totalGuests}`;
    invBadge.title = `${metrics.invitations.confirmedCount} confirmados de ${metrics.invitations.totalGuests} invitados`;
    invBadge.style.display = metrics.invitations.totalGuests > 0 ? 'inline-flex' : 'none';
  }

  // Resumen rápido en Topbar
  const topTotalSaved = document.getElementById('top-bar-saved');
  if (topTotalSaved) {
    topTotalSaved.textContent = `${metrics.currency} ${metrics.totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const topGoal = document.getElementById('top-bar-goal');
  if (topGoal) {
    topGoal.textContent = `Meta ${metrics.currency} ${metrics.savingsGoal.toLocaleString()}`;
  }

  // Resumen en Footer de Sidebar
  const sidebarSavedAmount = document.getElementById('sidebar-savings-amount');
  if (sidebarSavedAmount) {
    sidebarSavedAmount.textContent = `${metrics.currency} ${metrics.totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }

  const sidebarSavedPct = document.getElementById('sidebar-savings-pct');
  if (sidebarSavedPct) {
    sidebarSavedPct.textContent = `${metrics.savingsProgressPct.toFixed(0)}%`;
  }

  const sidebarProgressFill = document.getElementById('sidebar-progress-fill');
  if (sidebarProgressFill) {
    sidebarProgressFill.style.width = `${metrics.savingsProgressPct}%`;
  }
}
