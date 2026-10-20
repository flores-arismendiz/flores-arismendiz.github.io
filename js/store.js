// Gestor de Estado Centralizado y Persistencia en LocalStorage
import { INITIAL_DATA, DEFAULT_CATEGORIES } from './data.js';

const STORAGE_KEY = 'boda_catolica_db_v1';

class Store {
  constructor() {
    this.subscribers = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Asegurar campos básicos si versiones anteriores difieren
        return {
          settings: {
            ...INITIAL_DATA.settings,
            ...(parsed.settings || {}),
            weddingWeb: (() => {
              const baseWeb = { ...(INITIAL_DATA.settings.weddingWeb || {}) };
              const savedWeb = (parsed.settings && parsed.settings.weddingWeb) ? parsed.settings.weddingWeb : {};
              const merged = { ...baseWeb, ...savedWeb };
              // Reparar fotos si tienen URLs que dieron 404
              if (!merged.churchPhoto || merged.churchPhoto.includes('1548625361-195fe21b66df')) {
                merged.churchPhoto = baseWeb.churchPhoto;
              }
              if (!merged.coverPhoto) merged.coverPhoto = baseWeb.coverPhoto;
              if (!merged.couplePhoto) merged.couplePhoto = baseWeb.couplePhoto;
              if (!merged.receptionPhoto) merged.receptionPhoto = baseWeb.receptionPhoto;
              if (merged.gallery && Array.isArray(merged.gallery)) {
                merged.gallery = merged.gallery.filter(url => !url.includes('1519225429980-715cb0215aed'));
                if (merged.gallery.length === 0) merged.gallery = [...baseWeb.gallery];
              }
              return merged;
            })()
          },
          categories: parsed.categories && parsed.categories.length ? parsed.categories : [...DEFAULT_CATEGORIES],
          tasks: parsed.tasks || [],
          savings: parsed.savings || [],
          expenses: parsed.expenses || [],
          invitationTemplates: (parsed.invitationTemplates && parsed.invitationTemplates.length) ? parsed.invitationTemplates : [...(INITIAL_DATA.invitationTemplates || [])],
          guests: (parsed.guests && parsed.guests.length) ? parsed.guests : [...(INITIAL_DATA.guests || [])]
        };
      }
    } catch (e) {
      console.error('Error al cargar datos de LocalStorage:', e);
    }
    // Si no hay datos guardados, clonar los iniciales
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error('Error al guardar en LocalStorage:', e);
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.state);
      } catch (err) {
        console.error('Error en suscriptor del Store:', err);
      }
    });
  }

  getState() {
    return this.state;
  }

  // --- CONFIGURACIÓN ---
  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.saveState();
  }

  updateWeddingWeb(newWebFields) {
    if (!this.state.settings.weddingWeb) {
      this.state.settings.weddingWeb = { ...(INITIAL_DATA.settings.weddingWeb || {}) };
    }
    this.state.settings.weddingWeb = {
      ...this.state.settings.weddingWeb,
      ...newWebFields
    };
    this.saveState();
  }

  // --- CATEGORÍAS ---
  addCategory(categoryName) {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;
    if (!this.state.categories.includes(trimmed)) {
      this.state.categories.push(trimmed);
      this.saveState();
      return true;
    }
    return false;
  }

  // --- TAREAS (TODO / KANBAN) ---
  addTask(taskData) {
    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: taskData.title.trim(),
      category: taskData.category || this.state.categories[0],
      assignedTo: taskData.assignedTo || 'Ambos',
      dueDate: taskData.dueDate || '',
      status: taskData.status || 'Pendiente',
      priority: taskData.priority || 'Media',
      notes: taskData.notes || '',
      createdAt: new Date().toISOString()
    };
    this.state.tasks.unshift(newTask);
    this.saveState();
    return newTask;
  }

  updateTask(id, updatedFields) {
    const index = this.state.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.state.tasks[index] = { ...this.state.tasks[index], ...updatedFields };
      this.saveState();
      return this.state.tasks[index];
    }
    return null;
  }

  deleteTask(id) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.saveState();
  }

  toggleTaskStatus(id) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      // Ciclo: Pendiente -> En Proceso -> Completado -> Pendiente
      if (task.status === 'Pendiente') task.status = 'En Proceso';
      else if (task.status === 'En Proceso') task.status = 'Completado';
      else task.status = 'Pendiente';
      this.saveState();
    }
  }

  quickCompleteTask(id, isCompleted) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      task.status = isCompleted ? 'Completado' : 'Pendiente';
      this.saveState();
    }
  }

  // --- AHORRO Y METAS ---
  addSaving(savingData) {
    const newSaving = {
      id: 'sav-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      monthYear: savingData.monthYear.trim(),
      date: savingData.date || new Date().toISOString().split('T')[0],
      amountGroom: parseFloat(savingData.amountGroom) || 0,
      amountBride: parseFloat(savingData.amountBride) || 0,
      receipt: savingData.receipt || '',
      notes: savingData.notes || ''
    };
    this.state.savings.push(newSaving);
    // Ordenar cronológicamente si hay fechas
    this.state.savings.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.saveState();
    return newSaving;
  }

  updateSaving(id, updatedFields) {
    const index = this.state.savings.findIndex(s => s.id === id);
    if (index !== -1) {
      this.state.savings[index] = {
        ...this.state.savings[index],
        ...updatedFields,
        amountGroom: parseFloat(updatedFields.amountGroom !== undefined ? updatedFields.amountGroom : this.state.savings[index].amountGroom) || 0,
        amountBride: parseFloat(updatedFields.amountBride !== undefined ? updatedFields.amountBride : this.state.savings[index].amountBride) || 0
      };
      this.state.savings.sort((a, b) => new Date(a.date) - new Date(b.date));
      this.saveState();
      return this.state.savings[index];
    }
    return null;
  }

  deleteSaving(id) {
    this.state.savings = this.state.savings.filter(s => s.id !== id);
    this.saveState();
  }

  // --- PRESUPUESTO Y GASTOS ---
  addExpense(expenseData) {
    const newExpense = {
      id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      concept: expenseData.concept.trim(),
      category: expenseData.category || this.state.categories[0],
      scope: expenseData.scope || 'Conjunto', // 'Novio' | 'Novia' | 'Conjunto'
      supplier: expenseData.supplier || '',
      estimatedBudget: parseFloat(expenseData.estimatedBudget) || 0,
      actualCost: parseFloat(expenseData.actualCost) || 0,
      advancePaid: parseFloat(expenseData.advancePaid) || 0,
      paymentStatus: expenseData.paymentStatus || 'Pendiente',
      quoteUrl: expenseData.quoteUrl || '',
      notes: expenseData.notes || '',
      createdAt: new Date().toISOString()
    };
    this.state.expenses.unshift(newExpense);
    this.saveState();
    return newExpense;
  }

  updateExpense(id, updatedFields) {
    const index = this.state.expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      this.state.expenses[index] = {
        ...this.state.expenses[index],
        ...updatedFields,
        estimatedBudget: parseFloat(updatedFields.estimatedBudget !== undefined ? updatedFields.estimatedBudget : this.state.expenses[index].estimatedBudget) || 0,
        actualCost: parseFloat(updatedFields.actualCost !== undefined ? updatedFields.actualCost : this.state.expenses[index].actualCost) || 0,
        advancePaid: parseFloat(updatedFields.advancePaid !== undefined ? updatedFields.advancePaid : this.state.expenses[index].advancePaid) || 0
      };
      this.saveState();
      return this.state.expenses[index];
    }
    return null;
  }

  deleteExpense(id) {
    this.state.expenses = this.state.expenses.filter(e => e.id !== id);
    this.saveState();
  }

  // --- ACCIONES GLOBALES ---
  resetToSampleData() {
    this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveState();
  }

  clearAllData() {
    this.state = {
      settings: { ...INITIAL_DATA.settings, savingsGoal: 0 },
      categories: [...DEFAULT_CATEGORIES],
      tasks: [],
      savings: [],
      expenses: [],
      invitationTemplates: [...(INITIAL_DATA.invitationTemplates || [])],
      guests: []
    };
    this.saveState();
  }

  loadImportedData(data) {
    if (data && typeof data === 'object') {
      this.state = {
        settings: { ...INITIAL_DATA.settings, ...(data.settings || {}) },
        categories: data.categories || [...DEFAULT_CATEGORIES],
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        savings: Array.isArray(data.savings) ? data.savings : [],
        expenses: Array.isArray(data.expenses) ? data.expenses : [],
        invitationTemplates: Array.isArray(data.invitationTemplates) && data.invitationTemplates.length ? data.invitationTemplates : [...(INITIAL_DATA.invitationTemplates || [])],
        guests: Array.isArray(data.guests) ? data.guests : []
      };
      this.saveState();
      return true;
    }
    return false;
  }

  // --- INVITACIONES (PLANTILLAS / MODELOS) ---
  addInvitationTemplate(templateData) {
    const newTemplate = {
      id: 'tpl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: templateData.name ? templateData.name.trim() : 'Nueva Plantilla',
      tagline: templateData.tagline || '',
      headerTitle: templateData.headerTitle || '',
      content: templateData.content || '',
      updatedAt: new Date().toISOString()
    };
    if (!this.state.invitationTemplates) this.state.invitationTemplates = [];
    this.state.invitationTemplates.push(newTemplate);
    this.saveState();
    return newTemplate;
  }

  updateInvitationTemplate(id, updatedFields) {
    if (!this.state.invitationTemplates) this.state.invitationTemplates = [];
    const index = this.state.invitationTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.state.invitationTemplates[index] = {
        ...this.state.invitationTemplates[index],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      this.saveState();
      return this.state.invitationTemplates[index];
    }
    return null;
  }

  deleteInvitationTemplate(id) {
    if (!this.state.invitationTemplates) return false;
    const initialLen = this.state.invitationTemplates.length;
    this.state.invitationTemplates = this.state.invitationTemplates.filter(t => t.id !== id);
    if (this.state.invitationTemplates.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- INVITADOS Y CONFIRMACIONES (WHATSAPP RSVP) ---
  addGuest(guestData) {
    if (!this.state.guests) this.state.guests = [];
    const token = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 6);
    const newGuest = {
      id: 'gst-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: (guestData.name || '').trim(),
      phone: (guestData.phone || '').trim().replace(/[^0-9+]/g, ''),
      passes: parseInt(guestData.passes, 10) || 1,
      templateId: guestData.templateId || (this.state.invitationTemplates?.[0]?.id || 'tpl-1'),
      status: guestData.status || 'Sin enviar',
      sentAt: guestData.sentAt || null,
      confirmedAt: guestData.confirmedAt || null,
      confirmedPasses: guestData.status === 'Confirmado' ? (parseInt(guestData.passes, 10) || 1) : 0,
      notes: (guestData.notes || '').trim(),
      token: guestData.token || token,
      lastMessageSent: guestData.lastMessageSent || ''
    };
    this.state.guests.unshift(newGuest);
    this.saveState();
    return newGuest;
  }

  updateGuest(id, updatedFields) {
    if (!this.state.guests) this.state.guests = [];
    const index = this.state.guests.findIndex(g => g.id === id);
    if (index !== -1) {
      this.state.guests[index] = {
        ...this.state.guests[index],
        ...updatedFields
      };
      this.saveState();
      return this.state.guests[index];
    }
    return null;
  }

  deleteGuest(id) {
    if (!this.state.guests) return false;
    const initialLen = this.state.guests.length;
    this.state.guests = this.state.guests.filter(g => g.id !== id);
    if (this.state.guests.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  markGuestInvitationSent(guestId, templateId, messageContent = '') {
    if (!this.state.guests) return null;
    const index = this.state.guests.findIndex(g => g.id === guestId);
    if (index !== -1) {
      const g = this.state.guests[index];
      const isResend = Boolean(g.sentAt);
      this.state.guests[index] = {
        ...g,
        templateId: templateId || g.templateId,
        sentAt: new Date().toISOString(),
        lastMessageSent: messageContent,
        status: g.status === 'Confirmado' ? 'Confirmado' : (isResend ? 'Actualizada enviada' : 'Pendiente')
      };
      this.saveState();
      return this.state.guests[index];
    }
    return null;
  }

  confirmGuestByToken(token, status = 'Confirmado', confirmedPasses = null, comment = '') {
    if (!this.state.guests) return null;
    const guest = this.state.guests.find(g => g.token === token);
    if (guest) {
      const passes = confirmedPasses !== null ? parseInt(confirmedPasses, 10) : guest.passes;
      const updatedNotes = comment ? (guest.notes ? `${guest.notes} | RSVP: ${comment}` : comment) : guest.notes;
      guest.status = status;
      guest.confirmedAt = new Date().toISOString();
      guest.confirmedPasses = status === 'Confirmado' ? passes : 0;
      if (comment) guest.notes = updatedNotes;
      this.saveState();
      return guest;
    }
    return null;
  }

  getGuestByToken(token) {
    if (!this.state.guests) return null;
    return this.state.guests.find(g => g.token === token) || null;
  }

  getInvitationMetrics() {
    const guests = this.state.guests || [];
    const totalGuests = guests.length;
    const confirmedList = guests.filter(g => g.status === 'Confirmado');
    const pendingList = guests.filter(g => g.status === 'Pendiente' || g.status === 'Actualizada enviada');
    const declinedList = guests.filter(g => g.status === 'Declinado');
    const unsendList = guests.filter(g => g.status === 'Sin enviar');

    const totalPassesReserved = guests.reduce((acc, g) => acc + (parseInt(g.passes, 10) || 0), 0);
    const totalPassesConfirmed = confirmedList.reduce((acc, g) => acc + (parseInt(g.confirmedPasses !== undefined && g.confirmedPasses !== null ? g.confirmedPasses : g.passes, 10) || 0), 0);
    const totalPassesDeclined = declinedList.reduce((acc, g) => acc + (parseInt(g.passes, 10) || 0), 0);
    const totalPassesPending = guests.reduce((acc, g) => {
      if (g.status === 'Pendiente' || g.status === 'Actualizada enviada' || g.status === 'Sin enviar') {
        return acc + (parseInt(g.passes, 10) || 0);
      }
      return acc;
    }, 0);

    const attendanceRatePct = totalPassesReserved > 0 ? Math.round((totalPassesConfirmed / totalPassesReserved) * 100) : 0;

    return {
      totalGuests,
      confirmedCount: confirmedList.length,
      pendingCount: pendingList.length,
      declinedCount: declinedList.length,
      unsendCount: unsendList.length,
      totalPassesReserved,
      totalPassesConfirmed,
      totalPassesPending,
      totalPassesDeclined,
      attendanceRatePct
    };
  }

  // --- SELECTORES Y CÁLCULOS ANALÍTICOS ---
  getMetrics() {
    const { settings, tasks, savings, expenses, categories } = this.state;
    const currency = settings.currency || 'S/';
    const savingsGoal = settings.savingsGoal || 0;

    // Métricas de Ahorro
    const totalGroomSaved = savings.reduce((acc, s) => acc + (s.amountGroom || 0), 0);
    const totalBrideSaved = savings.reduce((acc, s) => acc + (s.amountBride || 0), 0);
    const totalSaved = totalGroomSaved + totalBrideSaved;
    const remainingToGoal = Math.max(0, savingsGoal - totalSaved);
    const savingsProgressPct = savingsGoal > 0 ? Math.min(100, (totalSaved / savingsGoal) * 100) : 0;

    const numberOfMonths = savings.length || 1;
    const monthlyAverageSavings = totalSaved / numberOfMonths;
    const projectedMonthsToGoal = (remainingToGoal > 0 && monthlyAverageSavings > 0)
      ? Math.ceil(remainingToGoal / monthlyAverageSavings)
      : 0;

    // Métricas de Presupuesto
    const totalEstimatedBudget = expenses.reduce((acc, e) => acc + (e.estimatedBudget || 0), 0);
    const totalActualCost = expenses.reduce((acc, e) => acc + (e.actualCost || 0), 0);
    const totalAdvancePaid = expenses.reduce((acc, e) => acc + (e.advancePaid || 0), 0);
    const totalPendingBalance = Math.max(0, totalActualCost - totalAdvancePaid);
    const totalDeviation = totalActualCost - totalEstimatedBudget; // >0 sobrecosto, <0 ahorro

    // Métricas de Presupuesto diferenciadas por responsable
    const groomExpenseCost = expenses.filter(e => e.scope === 'Novio').reduce((a, e) => a + (e.actualCost || 0), 0);
    const groomExpensePaid = expenses.filter(e => e.scope === 'Novio').reduce((a, e) => a + (e.advancePaid || 0), 0);
    const brideExpenseCost = expenses.filter(e => e.scope === 'Novia').reduce((a, e) => a + (e.actualCost || 0), 0);
    const brideExpensePaid = expenses.filter(e => e.scope === 'Novia').reduce((a, e) => a + (e.advancePaid || 0), 0);
    const jointExpenseCost = expenses.filter(e => e.scope === 'Conjunto' || !e.scope).reduce((a, e) => a + (e.actualCost || 0), 0);
    const jointExpensePaid = expenses.filter(e => e.scope === 'Conjunto' || !e.scope).reduce((a, e) => a + (e.advancePaid || 0), 0);
    const groomExpenseCount = expenses.filter(e => e.scope === 'Novio').length;
    const brideExpenseCount = expenses.filter(e => e.scope === 'Novia').length;
    const jointExpenseCount = expenses.filter(e => e.scope === 'Conjunto' || !e.scope).length;

    // Métricas de Tareas
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completado').length;
    const inProgressTasks = tasks.filter(t => t.status === 'En Proceso').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pendiente').length;
    const tasksProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Semáforo de Desviación Financiera
    // Compara el Ahorro acumulado contra los compromisos reales de la boda
    // Verde: Ahorro >= Costo Real Total (Cubierto totalmente)
    // Amarillo: Ahorro >= Pagos Adelantados pero Ahorro < Costo Real (En camino pero se requiere seguir ahorrando)
    // Rojo: Ahorro < Pagos Adelantados o Sobrecosto Crítico
    let trafficLightStatus = 'green';
    let trafficLightMessage = '';

    if (totalSaved >= totalActualCost && totalActualCost > 0) {
      trafficLightStatus = 'green';
      trafficLightMessage = `¡Excelente salud financiera! El ahorro acumulado (${currency} ${totalSaved.toLocaleString()}) cubre el 100% de los costos contratados (${currency} ${totalActualCost.toLocaleString()}).`;
    } else if (totalSaved >= totalAdvancePaid) {
      const pendingFund = totalActualCost - totalSaved;
      trafficLightStatus = 'yellow';
      trafficLightMessage = `Atención preventiva: El ahorro cubre los adelantos realizados (${currency} ${totalAdvancePaid.toLocaleString()}), pero faltan ${currency} ${pendingFund > 0 ? pendingFund.toLocaleString() : 0} para cubrir la totalidad pactada.`;
    } else {
      trafficLightStatus = 'red';
      trafficLightMessage = `¡Alerta de déficit! Los gastos comprometidos y pagos superan la capacidad de ahorro actual. Se recomienda renegociar con proveedores o ajustar partidas.`;
    }

    // Desglose por Categoría para Gráficos
    const categoryBreakdown = {};
    categories.forEach(cat => {
      categoryBreakdown[cat] = {
        category: cat,
        estimated: 0,
        actual: 0,
        paid: 0
      };
    });

    expenses.forEach(e => {
      const cat = e.category || 'Otros';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { category: cat, estimated: 0, actual: 0, paid: 0 };
      }
      categoryBreakdown[cat].estimated += (e.estimatedBudget || 0);
      categoryBreakdown[cat].actual += (e.actualCost || 0);
      categoryBreakdown[cat].paid += (e.advancePaid || 0);
    });

    return {
      currency,
      savingsGoal,
      totalGroomSaved,
      totalBrideSaved,
      totalSaved,
      remainingToGoal,
      savingsProgressPct,
      monthlyAverageSavings,
      projectedMonthsToGoal,
      totalEstimatedBudget,
      totalActualCost,
      totalAdvancePaid,
      totalPendingBalance,
      totalDeviation,
      // Por responsable
      groomExpenseCost,
      groomExpensePaid,
      groomExpenseCount,
      brideExpenseCost,
      brideExpensePaid,
      brideExpenseCount,
      jointExpenseCost,
      jointExpensePaid,
      jointExpenseCount,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      tasksProgressPct,
      trafficLightStatus,
      trafficLightMessage,
      categoryBreakdown,
      invitations: this.getInvitationMetrics()
    };
  }
}

export const store = new Store();
