// Módulo 4: Reportes y Dashboard Analítico (Estilo Power BI)
import { store } from '../store.js';

let categoryDonutChart = null;
let comparisonBarChart = null;
let savingsTimelineChart = null;

export function initDashboardModule() {
  renderDashboardView();
  setupDashboardEventListeners();
}

export function renderDashboardView() {
  const container = document.getElementById('dashboard-view-container');
  if (!container) return;

  const state = store.getState();
  const metrics = store.getMetrics();
  const currency = metrics.currency;

  container.innerHTML = `
    <!-- Encabezado del Dashboard -->
    <div class="dashboard-header-banner">
      <div class="banner-content">
        <span class="badge-gold-pill">Centro de Inteligencia Nupcial</span>
        <h2 class="banner-title">Dashboard Analítico & Control Financiero</h2>
        <p class="banner-desc">Visión ejecutiva de presupuesto, evolución de ahorro y cronograma de trámites para la Boda Católica</p>
      </div>
      <div class="banner-actions">
        <div class="date-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>Fecha Objetivo: <strong>14 de Febrero 2027</strong></span>
        </div>
      </div>
    </div>

    <!-- SEMÁFORO DE DESVIACIÓN FINANCIERA (Alerta de Salud Financiera) -->
    <div class="traffic-light-card status-${metrics.trafficLightStatus}">
      <div class="traffic-light-signal">
        <span class="light-bulb light-red ${metrics.trafficLightStatus === 'red' ? 'active' : ''}"></span>
        <span class="light-bulb light-yellow ${metrics.trafficLightStatus === 'yellow' ? 'active' : ''}"></span>
        <span class="light-bulb light-green ${metrics.trafficLightStatus === 'green' ? 'active' : ''}"></span>
      </div>
      <div class="traffic-light-body">
        <div class="traffic-light-title">
          ${metrics.trafficLightStatus === 'green' ? '✓ Semáforo en Verde: Capacidad Financiera Óptima' :
            metrics.trafficLightStatus === 'yellow' ? '⚠ Semáforo en Amarillo: Cobertura Parcial Activa' :
            '⛔ Semáforo en Rojo: Alerta de Desviación Financiera'}
        </div>
        <div class="traffic-light-desc">${metrics.trafficLightMessage}</div>
      </div>
      <div class="traffic-light-summary">
        <div class="summary-mini">
          <span>Ahorro Disponible:</span>
          <strong>${currency} ${metrics.totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
        </div>
        <div class="summary-mini">
          <span>Total Contratado:</span>
          <strong>${currency} ${metrics.totalActualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>
    </div>

    <div class="kpi-cards-grid">
      <!-- KPI 1: Presupuesto General -->
      <div class="card kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-title">Presupuesto General</span>
          <div class="kpi-icon-wrap icon-purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
        </div>
        <div class="kpi-value text-gold">${currency} ${metrics.totalActualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div class="kpi-subtext">Total Contratado / Real</div>
        <div class="kpi-comparison-row">
          <div>Estimado: <strong>${currency} ${metrics.totalEstimatedBudget.toLocaleString()}</strong></div>
          <div>Pagado: <strong class="text-success">${currency} ${metrics.totalAdvancePaid.toLocaleString()}</strong></div>
        </div>
        <div class="kpi-meter-bar">
          <div class="kpi-meter-fill bg-success" style="width: ${metrics.totalActualCost > 0 ? Math.min(100, (metrics.totalAdvancePaid / metrics.totalActualCost) * 100) : 0}%"></div>
        </div>
        <div class="kpi-footer-note">
          ${metrics.totalActualCost > 0 ? ((metrics.totalAdvancePaid / metrics.totalActualCost) * 100).toFixed(1) : 0}% pagado | Saldo: ${currency} ${metrics.totalPendingBalance.toLocaleString()}
        </div>
      </div>

      <!-- KPI 1b: Desglose de Gastos Novio / Novia / Conjunto -->
      <div class="card kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-title">Gastos por Responsable</span>
          <div class="kpi-icon-wrap icon-rose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>
        <div class="kpi-scope-breakdown">
          <div class="kpi-scope-row">
            <span class="scope-dot scope-groom">🤵</span>
            <span class="scope-row-label">${state.settings.groomName || 'Novio'}</span>
            <span class="scope-row-amount">${currency} ${metrics.groomExpenseCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span class="scope-row-count">${metrics.groomExpenseCount} ítem(s)</span>
          </div>
          <div class="kpi-scope-progress">
            <div class="kpi-meter-bar mb-1">
              <div class="kpi-meter-fill bg-blue" style="width: ${metrics.groomExpenseCost > 0 ? Math.min(100, (metrics.groomExpensePaid / metrics.groomExpenseCost) * 100) : 0}%"></div>
            </div>
            <span class="scope-paid-label">Pagado: ${currency} ${metrics.groomExpensePaid.toLocaleString()}</span>
          </div>
          <div class="kpi-scope-row">
            <span class="scope-dot scope-bride">👰</span>
            <span class="scope-row-label">${state.settings.brideName || 'Novia'}</span>
            <span class="scope-row-amount">${currency} ${metrics.brideExpenseCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span class="scope-row-count">${metrics.brideExpenseCount} ítem(s)</span>
          </div>
          <div class="kpi-scope-progress">
            <div class="kpi-meter-bar mb-1">
              <div class="kpi-meter-fill bg-rose" style="width: ${metrics.brideExpenseCost > 0 ? Math.min(100, (metrics.brideExpensePaid / metrics.brideExpenseCost) * 100) : 0}%"></div>
            </div>
            <span class="scope-paid-label">Pagado: ${currency} ${metrics.brideExpensePaid.toLocaleString()}</span>
          </div>
          <div class="kpi-scope-row">
            <span class="scope-dot scope-joint">💑</span>
            <span class="scope-row-label">Conjunto</span>
            <span class="scope-row-amount">${currency} ${metrics.jointExpenseCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span class="scope-row-count">${metrics.jointExpenseCount} ítem(s)</span>
          </div>
          <div class="kpi-scope-progress">
            <div class="kpi-meter-bar mb-1">
              <div class="kpi-meter-fill bg-gold" style="width: ${metrics.jointExpenseCost > 0 ? Math.min(100, (metrics.jointExpensePaid / metrics.jointExpenseCost) * 100) : 0}%"></div>
            </div>
            <span class="scope-paid-label">Pagado: ${currency} ${metrics.jointExpensePaid.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- KPI 2: Meta de Ahorro -->
      <div class="card kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-title">Meta de Ahorro Conjunto</span>
          <div class="kpi-icon-wrap icon-gold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
          </div>
        </div>
        <div class="kpi-value">${currency} ${metrics.totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div class="kpi-subtext">Meta Objetivo: ${currency} ${metrics.savingsGoal.toLocaleString()}</div>
        <div class="kpi-comparison-row">
          <div>Él: <strong>${currency} ${metrics.totalGroomSaved.toLocaleString()}</strong></div>
          <div>Ella: <strong>${currency} ${metrics.totalBrideSaved.toLocaleString()}</strong></div>
        </div>
        <div class="kpi-meter-bar">
          <div class="kpi-meter-fill bg-gold" style="width: ${metrics.savingsProgressPct}%"></div>
        </div>
        <div class="kpi-footer-note">
          <span class="text-gold font-bold">${metrics.savingsProgressPct.toFixed(1)}% de meta alcanzada</span> | Falta: ${currency} ${metrics.remainingToGoal.toLocaleString()}
        </div>
      </div>

      <!-- KPI 3: Avance de Tareas y Trámites -->
      <div class="card kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-title">Avance de la Boda</span>
          <div class="kpi-icon-wrap icon-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
        </div>
        <div class="kpi-value text-blue">${metrics.tasksProgressPct}%</div>
        <div class="kpi-subtext">${metrics.completedTasks} de ${metrics.totalTasks} tareas y trámites concluidos</div>
        <div class="kpi-comparison-row">
          <div>En Proceso: <strong>${metrics.inProgressTasks}</strong></div>
          <div>Pendientes: <strong>${metrics.pendingTasks}</strong></div>
        </div>
        <div class="kpi-meter-bar">
          <div class="kpi-meter-fill bg-blue" style="width: ${metrics.tasksProgressPct}%"></div>
        </div>
        <div class="kpi-footer-note">
          ${metrics.pendingTasks > 0 ? `${metrics.pendingTasks} pendientes requieren atención` : '¡Todos los pendientes concluidos!'}
        </div>
      </div>

      <!-- KPI 4: Invitaciones & RSVP WhatsApp -->
      <div class="card kpi-card" style="cursor: pointer;" onclick="window.navigateToTab('invitations')" title="Haz clic para ir al módulo de Invitaciones">
        <div class="kpi-card-header">
          <span class="kpi-title">Invitaciones & RSVP WhatsApp</span>
          <div class="kpi-icon-wrap" style="background: #ECFDF5; color: #059669;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
        </div>
        <div class="kpi-value text-success">${metrics.invitations ? metrics.invitations.confirmedCount : 0} <span style="font-size: 1rem; font-weight: normal; color: #64748B;">/ ${metrics.invitations ? metrics.invitations.totalGuests : 0}</span></div>
        <div class="kpi-subtext">${metrics.invitations ? metrics.invitations.totalPassesConfirmed : 0} pases confirmados de ${metrics.invitations ? metrics.invitations.totalPassesReserved : 0} reservados</div>
        <div class="kpi-comparison-row">
          <div>Pendientes: <strong>${metrics.invitations ? metrics.invitations.pendingCount : 0}</strong></div>
          <div>Declinados: <strong>${metrics.invitations ? metrics.invitations.declinedCount : 0}</strong></div>
        </div>
        <div class="kpi-meter-bar">
          <div class="kpi-meter-fill bg-success" style="width: ${metrics.invitations ? metrics.invitations.attendanceRatePct : 0}%"></div>
        </div>
        <div class="kpi-footer-note">
          <span class="text-success font-bold">${metrics.invitations ? metrics.invitations.attendanceRatePct : 0}% de asistencia confirmada</span> &bull; Ver módulo &rarr;
        </div>
      </div>
    </div>

    <!-- SECCIÓN GRÁFICOS INTERACTIVOS (POWER BI STYLE) -->
    <div class="charts-grid-primary">
      <!-- Gráfico 1: Dona - Distribución de Gasto Real por Categoría -->
      <div class="card chart-card">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-card-title">Distribución del Gasto por Categoría</h3>
            <span class="chart-card-subtitle">Participación porcentual de los costos contratados</span>
          </div>
          <span class="badge badge-light">Costo Real</span>
        </div>
        <div class="chart-canvas-wrapper donut-wrapper">
          <canvas id="chart-donut-categories"></canvas>
        </div>
      </div>

      <!-- Gráfico 2: Barras - Estimado vs Real por Categoría -->
      <div class="card chart-card">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-card-title">Presupuesto Estimado vs. Gasto Real</h3>
            <span class="chart-card-subtitle">Detección inmediata de sobrecostos y ahorros por rubro</span>
          </div>
          <span class="badge badge-light">Comparativa</span>
        </div>
        <div class="chart-canvas-wrapper bar-wrapper">
          <canvas id="chart-bars-comparison"></canvas>
        </div>
      </div>
    </div>

    <!-- Gráfico 3: Línea/Área - Evolución del Ahorro Acumulado -->
    <div class="card chart-card-full">
      <div class="chart-card-header">
        <div>
          <h3 class="chart-card-title">Evolución Histórica del Ahorro de la Pareja</h3>
          <span class="chart-card-subtitle">Progresión mensual acumulada: Fondos individuales de Él, Ella y Fondo Conjunto</span>
        </div>
        <div class="chart-legend-custom">
          <span class="legend-item"><span class="legend-color-dot dot-groom"></span> Aporte Él</span>
          <span class="legend-item"><span class="legend-color-dot dot-bride"></span> Aporte Ella</span>
          <span class="legend-item"><span class="legend-color-dot dot-total"></span> Total Acumulado</span>
        </div>
      </div>
      <div class="chart-canvas-wrapper area-wrapper">
        <canvas id="chart-timeline-savings"></canvas>
      </div>
    </div>

    <!-- PRÓXIMOS HITOS Y TRÁMITES CRÍTICOS -->
    <div class="dashboard-footer-grid">
      <div class="card upcoming-tasks-card">
        <div class="card-header-clean">
          <span class="card-badge-pill">Próximos Vencimientos</span>
          <h4 class="card-clean-title">Trámites e Iglesia por Completar</h4>
        </div>
        <div class="upcoming-tasks-list">
          ${renderUpcomingTasksList(state.tasks)}
        </div>
      </div>

      <div class="card quick-actions-card">
        <div class="card-header-clean">
          <span class="card-badge-pill">Accesos Rápidos</span>
          <h4 class="card-clean-title">Gestión Inmediata</h4>
        </div>
        <div class="quick-action-buttons">
          <button class="btn btn-outline quick-btn" id="qa-add-task">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
            Nueva Tarea o Trámite
          </button>
          <button class="btn btn-outline quick-btn" id="qa-add-saving">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Registrar Aporte Mensual
          </button>
          <button class="btn btn-outline quick-btn" id="qa-add-expense">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Añadir Cotización / Gasto
          </button>
          <button class="btn btn-outline quick-btn" id="qa-export-report">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Exportar Resumen Excel/CSV
          </button>
        </div>
      </div>
    </div>
  `;

  initDashboardCharts();
  attachDashboardActionHandlers();
}

function renderUpcomingTasksList(tasks) {
  const pendingTasks = tasks
    .filter(t => t.status !== 'Completado')
    .sort((a, b) => (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1)
    .slice(0, 4);

  if (pendingTasks.length === 0) {
    return `<div class="p-3 text-muted">¡Felicidades! Todos los trámites y tareas están completados.</div>`;
  }

  return pendingTasks.map(t => `
    <div class="upcoming-item">
      <div class="upcoming-info">
        <span class="upcoming-title">${t.title}</span>
        <div class="upcoming-meta">
          <span class="badge badge-category">${t.category}</span>
          <span class="upcoming-assignee">${t.assignedTo === 'Él' ? '🤵 Él' : t.assignedTo === 'Ella' ? '👰 Ella' : '💑 Ambos'}</span>
        </div>
      </div>
      <div class="upcoming-date-box">
        <span class="upcoming-date">${t.dueDate ? formatDate(t.dueDate) : 'Sin fecha'}</span>
        <span class="badge ${t.priority === 'Alta' ? 'badge-danger' : t.priority === 'Media' ? 'badge-warning' : 'badge-light'}">${t.priority}</span>
      </div>
    </div>
  `).join('');
}

function initDashboardCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js no está cargado aún');
    return;
  }

  const state = store.getState();
  const metrics = store.getMetrics();
  const currency = metrics.currency;
  const categoryData = metrics.categoryBreakdown;

  // Destruir gráficos previos para evitar solapamientos
  if (categoryDonutChart) { categoryDonutChart.destroy(); categoryDonutChart = null; }
  if (comparisonBarChart) { comparisonBarChart.destroy(); comparisonBarChart = null; }
  if (savingsTimelineChart) { savingsTimelineChart.destroy(); savingsTimelineChart = null; }

  // 1. Gráfico de Anillo (Doughnut) - Distribución por Categoría
  const donutCanvas = document.getElementById('chart-donut-categories');
  if (donutCanvas) {
    const categoriesWithSpend = Object.values(categoryData).filter(c => c.actual > 0);
    const labels = categoriesWithSpend.map(c => c.category);
    const dataValues = categoriesWithSpend.map(c => c.actual);

    const palette = [
      '#C5A059', // Champagne Gold
      '#4F46E5', // Royal Indigo
      '#059669', // Emerald
      '#EC4899', // Blush Pink
      '#0284C7', // Sky Blue
      '#D97706', // Warm Amber
      '#8B5CF6', // Purple
      '#10B981', // Mint
      '#64748B'  // Slate
    ];

    categoryDonutChart = new Chart(donutCanvas, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['Sin Gastos'],
        datasets: [{
          data: dataValues.length ? dataValues : [1],
          backgroundColor: palette.slice(0, Math.max(1, labels.length)),
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              boxWidth: 14,
              padding: 12
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw || 0;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${currency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  // 2. Gráfico de Barras Comparativo - Estimado vs Real por Categoría
  const barCanvas = document.getElementById('chart-bars-comparison');
  if (barCanvas) {
    const categoriesList = Object.values(categoryData).filter(c => c.estimated > 0 || c.actual > 0);
    const labels = categoriesList.map(c => {
      // Acortar nombres largos si es necesario
      if (c.category.length > 18) return c.category.substring(0, 16) + '...';
      return c.category;
    });
    const estimatedData = categoriesList.map(c => c.estimated);
    const actualData = categoriesList.map(c => c.actual);

    comparisonBarChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Presupuesto Estimado',
            data: estimatedData,
            backgroundColor: 'rgba(203, 213, 225, 0.8)',
            borderColor: '#94A3B8',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Costo Real / Contratado',
            data: actualData,
            backgroundColor: 'rgba(197, 160, 89, 0.85)',
            borderColor: '#B89047',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              boxWidth: 14,
              padding: 14
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${currency} ${ctx.raw.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              callback: (val) => `${currency} ${val >= 1000 ? (val / 1000) + 'k' : val}`
            }
          }
        }
      }
    });
  }

  // 3. Gráfico de Área/Línea - Evolución del Ahorro Mensual Acumulado
  const timelineCanvas = document.getElementById('chart-timeline-savings');
  if (timelineCanvas) {
    const savings = [...state.savings].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = savings.map(s => s.monthYear);

    // Calcular acumulados mensuales
    let cumGroom = 0;
    let cumBride = 0;
    let cumTotal = 0;

    const dataCumGroom = [];
    const dataCumBride = [];
    const dataCumTotal = [];

    savings.forEach(s => {
      cumGroom += (s.amountGroom || 0);
      cumBride += (s.amountBride || 0);
      cumTotal += (s.amountGroom || 0) + (s.amountBride || 0);

      dataCumGroom.push(cumGroom);
      dataCumBride.push(cumBride);
      dataCumTotal.push(cumTotal);
    });

    savingsTimelineChart = new Chart(timelineCanvas, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['Inicio'],
        datasets: [
          {
            label: 'Total Acumulado Conjunto',
            data: dataCumTotal.length ? dataCumTotal : [0],
            borderColor: '#C5A059',
            backgroundColor: 'rgba(197, 160, 89, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#C5A059',
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Aporte Acumulado Él',
            data: dataCumGroom.length ? dataCumGroom : [0],
            borderColor: '#3B82F6',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.3,
            pointBackgroundColor: '#3B82F6',
            pointRadius: 3
          },
          {
            label: 'Aporte Acumulado Ella',
            data: dataCumBride.length ? dataCumBride : [0],
            borderColor: '#EC4899',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.3,
            pointBackgroundColor: '#EC4899',
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${currency} ${ctx.raw.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } }
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              callback: (val) => `${currency} ${val.toLocaleString()}`
            }
          }
        }
      }
    });
  }
}

function attachDashboardActionHandlers() {
  const btnTask = document.getElementById('qa-add-task');
  if (btnTask) {
    btnTask.onclick = () => {
      // Cambiar a pestaña tareas y abrir modal
      window.navigateToTab('tasks');
      setTimeout(() => {
        const btn = document.getElementById('btn-open-task-modal');
        if (btn) btn.click();
      }, 100);
    };
  }

  const btnSaving = document.getElementById('qa-add-saving');
  if (btnSaving) {
    btnSaving.onclick = () => {
      window.navigateToTab('savings');
      setTimeout(() => {
        const btn = document.getElementById('btn-open-saving-modal');
        if (btn) btn.click();
      }, 100);
    };
  }

  const btnExpense = document.getElementById('qa-add-expense');
  if (btnExpense) {
    btnExpense.onclick = () => {
      window.navigateToTab('budget');
      setTimeout(() => {
        const btn = document.getElementById('btn-open-expense-modal');
        if (btn) btn.click();
      }, 100);
    };
  }

  const btnExport = document.getElementById('qa-export-report');
  if (btnExport) {
    btnExport.onclick = () => {
      window.navigateToTab('export');
    };
  }
}

function setupDashboardEventListeners() {
  store.subscribe(() => {
    const container = document.getElementById('dashboard-view-container');
    if (container && container.offsetParent !== null) {
      renderDashboardView();
    }
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
