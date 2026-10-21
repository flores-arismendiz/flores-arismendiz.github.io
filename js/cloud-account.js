import { store } from './store.js';
import { getSupabaseClient, isSupabaseConfigured } from './supabase.js';

let client = null;
let activeUserId = null;
let connectingUserId = null;
let connectingPromise = null;
let onAuthenticated = () => {};
let onUnauthenticated = () => {};
let authRequired = false;
let authenticationRequired = true;

export async function setupCloudAccount(options = {}) {
  onAuthenticated = options.onAuthenticated || (() => {});
  onUnauthenticated = options.onUnauthenticated || (() => {});
  authenticationRequired = options.requireAuthentication !== false;
  const button = document.getElementById('topbar-btn-account');
  if (!button) return;

  button.addEventListener('click', () => openAccountModal());
  updateAccountButton(button);
  if (!isSupabaseConfigured()) {
    authRequired = authenticationRequired;
    setAuthenticationGate(authenticationRequired);
    if (authenticationRequired) openAccountModal();
    else onUnauthenticated();
    return;
  }

  try {
    client = await getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (data.session) await applySession(data.session);
    else {
      authRequired = authenticationRequired;
      setAuthenticationGate(authenticationRequired);
      if (authenticationRequired) openAccountModal();
      else onUnauthenticated();
    }

    client.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        applySession(session).catch(showCloudError);
      }, 0);
    });
  } catch (error) {
    authRequired = authenticationRequired;
    setAuthenticationGate(authenticationRequired);
    if (authenticationRequired) {
      renderAuthForm('signin', error.message);
      document.getElementById('global-modal-overlay')?.classList.add('active');
    } else {
      onUnauthenticated();
      showCloudError(error);
    }
  }
}

async function applySession(session) {
  if (session?.user) {
    if (activeUserId === session.user.id) return;
    if (connectingUserId === session.user.id) return connectingPromise;
    connectingUserId = session.user.id;
    connectingPromise = (async () => {
      await store.connectCloud(client, session.user);
      activeUserId = session.user.id;
      authRequired = false;
      setAuthenticationGate(false);
      closeAccountModal();
      updateAccountButton(document.getElementById('topbar-btn-account'));
      onAuthenticated();
    })();
    try {
      await connectingPromise;
    } finally {
      connectingUserId = null;
      connectingPromise = null;
    }
  } else if (activeUserId) {
    activeUserId = null;
    authRequired = authenticationRequired;
    setAuthenticationGate(authenticationRequired);
    store.disconnectCloud();
    onUnauthenticated();
    if (authenticationRequired) openAccountModal();
  }
  updateAccountButton(document.getElementById('topbar-btn-account'));
}

function updateAccountButton(button) {
  if (!button) return;
  button.textContent = activeUserId ? 'Supabase conectado' : 'Conectar Supabase';
  button.title = activeUserId
    ? 'Sincronización activa. La sesión se recuerda en este navegador.'
    : 'Inicia sesión una vez para sincronizar. Supabase recordará la sesión en este navegador.';
}

function openAccountModal() {
  const overlay = document.getElementById('global-modal-overlay');
  const body = document.getElementById('global-modal-body');
  if (!overlay || !body) return;

  if (!isSupabaseConfigured()) {
    authRequired = true;
    body.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">Conectar Supabase</h3>
          <button class="modal-close-btn" type="button" aria-label="Cerrar">&times;</button>
        </div>
        <div class="modal-form">
          <p>Primero crea el proyecto y ejecuta la migración indicada en el README. Después agrega la URL y la clave pública anon/publishable del proyecto en <code>js/supabase-config.js</code>.</p>
          <p>No uses una clave <code>service_role</code> ni una clave secreta en el navegador.</p>
          <button type="button" class="btn btn-primary" id="btn-cloud-setup-close">Entendido</button>
        </div>
      </div>`;
    body.querySelectorAll('.modal-close-btn, #btn-cloud-setup-close')
      .forEach(element => element.addEventListener('click', closeAccountModal));
    overlay.classList.add('active');
    return;
  }

  if (activeUserId) {
    body.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">Cuenta de Supabase</h3>
          <button class="modal-close-btn" type="button" aria-label="Cerrar">&times;</button>
        </div>
        <div class="modal-form">
          <p>La información de esta boda está sincronizada y protegida por tu cuenta.</p>
          <button type="button" class="btn btn-danger-outline" id="btn-cloud-sign-out">Cerrar sesión</button>
        </div>
      </div>`;
    body.querySelector('.modal-close-btn').addEventListener('click', closeAccountModal);
    body.querySelector('#btn-cloud-sign-out').addEventListener('click', signOut);
    overlay.classList.add('active');
    return;
  }

  renderAuthForm('signin');
  overlay.classList.add('active');
}

function renderAuthForm(mode, message = '') {
  const body = document.getElementById('global-modal-body');
  body.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">${mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}</h3>
        ${authRequired ? '' : '<button class="modal-close-btn" type="button" aria-label="Cerrar">&times;</button>'}
      </div>
      <form class="modal-form" id="form-cloud-auth">
        <p>Usa la misma cuenta en los dispositivos que compartirán la planificación.</p>
        <div class="form-group">
          <label class="form-label" for="cloud-email">Correo electrónico</label>
          <input class="form-control" id="cloud-email" type="email" autocomplete="email" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="cloud-password">Contraseña</label>
          <input class="form-control" id="cloud-password" type="password" minlength="8"
            autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" required>
        </div>
        <p id="cloud-auth-message" role="status">${escapeHtml(message)}</p>
        <button class="btn btn-primary" type="submit">${mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}</button>
        <button class="btn btn-outline" type="button" id="btn-cloud-auth-toggle">
          ${mode === 'signup' ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
        </button>
      </form>
    </div>`;
  body.querySelector('.modal-close-btn')?.addEventListener('click', closeAccountModal);
  body.querySelector('#btn-cloud-auth-toggle').addEventListener('click', () => {
    renderAuthForm(mode === 'signup' ? 'signin' : 'signup');
  });
  body.querySelector('#form-cloud-auth').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const submitButton = form.querySelector('[type="submit"]');
    const status = form.querySelector('#cloud-auth-message');
    submitButton.disabled = true;
    status.textContent = '';
    try {
      const email = form.querySelector('#cloud-email').value.trim();
      const password = form.querySelector('#cloud-password').value;
      const result = mode === 'signup'
        ? await client.auth.signUp({ email, password })
        : await client.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (!result.data.session) {
        status.textContent = 'Revisa tu correo para confirmar la cuenta y luego inicia sesión.';
        return;
      }
      await applySession(result.data.session);
      closeAccountModal();
      showCloudMessage('Conexión con Supabase establecida.');
    } catch (error) {
      status.textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });
}

async function signOut() {
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    await applySession(null);
    showCloudMessage('Sesión cerrada. Inicia sesión para volver a cargar los datos de Supabase.');
  } catch (error) {
    showCloudError(error);
  }
}

function closeAccountModal() {
  if (authRequired && !activeUserId) return;
  document.getElementById('global-modal-overlay')?.classList.remove('active');
}

function setAuthenticationGate(required) {
  const overlay = document.getElementById('global-modal-overlay');
  if (!overlay) return;
  if (required) overlay.dataset.authRequired = 'true';
  else delete overlay.dataset.authRequired;
}

function showCloudError(error) {
  console.error('Error de Supabase:', error);
  showCloudMessage(`Error de Supabase: ${error.message}`);
}

function showCloudMessage(message) {
  const toast = document.getElementById('global-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
