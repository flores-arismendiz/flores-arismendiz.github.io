// Módulo: Web de Invitación Nupcial Interactiva (Estilo ChungDoi de Alta Gama Romántica)
import { store } from '../store.js';

let countdownTimerId = null;
let isAudioPlaying = false;
let audioElement = null;
let carouselAutoSlideId = null;
let petalsActive = true;

export function renderWeddingWebPage(token = null) {
  const container = document.getElementById('wedding-web-invitation-container');
  const appLayout = document.getElementById('app-layout');
  if (!container) return;

  // Ocultar layout del panel de administración y mostrar la web de invitación a pantalla completa
  if (appLayout) appLayout.style.display = 'none';
  container.style.display = 'block';
  document.body.classList.add('wedding-web-active');

  const state = store.getState();
  const settings = state.settings || {};
  const web = settings.weddingWeb || {};
  const groomName = settings.groomName || 'Él';
  const brideName = settings.brideName || 'Ella';
  const weddingDateStr = settings.weddingDate || '2027-02-14';

  // Obtener invitado si viene por token
  const guest = token ? store.getGuestByToken(token) : null;

  // Limpiar timer anterior si existiera
  if (countdownTimerId) {
    clearInterval(countdownTimerId);
    countdownTimerId = null;
  }
  if (carouselAutoSlideId) {
    clearInterval(carouselAutoSlideId);
    carouselAutoSlideId = null;
  }

  // Galería de fotos (asegurar mínimo de fotos románticas de muestra)
  const galleryPhotos = (web.gallery && web.gallery.length > 0) ? web.gallery : [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80"
  ];

  container.innerHTML = `
    <!-- SOBRE NUPCIAL INTERACTIVO CON SELLO DE LACRE REALISTA (EXPERIENCIA ROMÁNTICA DE BIENVENIDA) -->
    <div id="wedding-envelope-overlay" class="wedding-envelope-overlay">
      <div class="envelope-modal-backdrop"></div>
      <div class="envelope-stage">
        <div class="envelope-card" id="envelope-card">
          <!-- Solapa Superior con Lacre -->
          <div class="envelope-flap" id="envelope-flap"></div>
          
          <!-- Botón de Sello de Lacre Realista -->
          <div class="envelope-wax-seal" id="envelope-seal-trigger" title="Haz clic en el sello para abrir tu invitación">
            <div class="wax-seal-body">
              <span class="wax-seal-cross">✝</span>
              <span class="wax-seal-monogram">${escapeHtml(groomName.charAt(0))}&amp;${escapeHtml(brideName.charAt(0))}</span>
            </div>
            <div class="wax-pulse-ring"></div>
          </div>

          <!-- Cara Frontal del Sobre con Invitado Personalizado -->
          <div class="envelope-front-content">
            <div class="envelope-sacred-rings">💍🕊️</div>
            <span class="envelope-subtitle">Nuestra Boda Católica</span>
            <h2 class="envelope-couple-script">${escapeHtml(groomName)} &amp; ${escapeHtml(brideName)}</h2>
            <div class="envelope-filigree-divider">✦ ❖ ✦</div>

            <div class="envelope-recipient-badge">
              <span class="recipient-label">Invitación de Honor para:</span>
              <h3 class="recipient-name">${guest ? escapeHtml(guest.name) : 'Apreciada Familia y Amigos'}</h3>
              ${guest ? `
                <div class="recipient-passes-tag">
                  🎟️ <strong>${guest.passes} Pase${guest.passes > 1 ? 's' : ''}</strong> Reservado${guest.passes > 1 ? 's' : ''}
                </div>
              ` : ''}
            </div>

            <p class="envelope-date-preview">${formatDateFullSpanish(weddingDateStr)} &bull; ${escapeHtml(settings.weddingTime || '17:30 hrs')}</p>

            <button type="button" class="btn-envelope-open" id="btn-open-envelope-action">
              <span>Abrir Invitación</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <span class="envelope-tap-instruction">Toca el sello o el botón para abrir</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LLUVIA DE PÉTALOS DE ROSA ROMÁNTICOS FLOTANTES -->
    <div class="romantic-petals-container" id="romantic-petals-container" aria-hidden="true">
      <span class="petal p1">🌸</span>
      <span class="petal p2">💮</span>
      <span class="petal p3">🌸</span>
      <span class="petal p4">✨</span>
      <span class="petal p5">🌸</span>
      <span class="petal p6">💮</span>
      <span class="petal p7">✨</span>
      <span class="petal p8">🌸</span>
      <span class="petal p9">🌸</span>
      <span class="petal p10">💮</span>
      <span class="petal p11">✨</span>
      <span class="petal p12">🌸</span>
      <span class="petal p13">💮</span>
      <span class="petal p14">✨</span>
      <span class="petal p15">🌸</span>
    </div>

    <!-- BARRA SUPERIOR DE NAVEGACIÓN NUPCIAL FLOTANTE -->
    <header class="web-nav-header">
      <div class="web-nav-inner">
        <div class="web-nav-brand">
          <span class="web-brand-monogram">✝</span>
          <span class="web-brand-names">${escapeHtml(groomName)} &amp; ${escapeHtml(brideName)}</span>
        </div>
        
        <div class="web-nav-actions">
          <!-- Botón Reabrir Sobre -->
          <button class="btn-reopen-envelope" id="btn-reopen-envelope" title="Ver de nuevo el sobre nupcial">
            <span>✉️</span>
            <span class="nav-action-label">Sobre</span>
          </button>

          <!-- Toggle de Pétalos -->
          <button class="btn-petals-toggle ${petalsActive ? 'active' : ''}" id="btn-toggle-petals" title="Activar/Desactivar lluvia de pétalos">
            <span class="petals-icon">🌸</span>
            <span class="nav-action-label">Pétalos</span>
          </button>

          <!-- Reproductor de Música Romántica de Fondo -->
          <button class="btn-music-toggle ${isAudioPlaying ? 'playing' : ''}" id="btn-toggle-music" title="${isAudioPlaying ? 'Pausar música' : 'Reproducir melodía nupcial'}">
            <span class="music-icon-disc">🎵</span>
            <span class="music-label">${isAudioPlaying ? 'Pausar' : 'Música'}</span>
          </button>

          <!-- Botón Volver al Panel de Bodas -->
          <button class="btn-back-to-panel" id="btn-back-to-admin">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span class="nav-action-label">Panel</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 1. HERO / PORTADA NUPCIAL ULTRA ROMÁNTICA -->
    <section class="web-hero-section" style="background-image: linear-gradient(180deg, rgba(18, 10, 24, 0.45) 0%, rgba(18, 10, 24, 0.8) 100%), url('${escapeHtml(web.coverPhoto || '')}');">
      <div class="web-hero-vignette"></div>
      <div class="web-hero-content fade-in-up">
        <div class="web-sacred-symbol">✝</div>
        <span class="web-hero-eyebrow">${escapeHtml(web.heroTitle || 'Nuestra Boda Católica')}</span>
        
        <h1 class="web-hero-names">
          <span class="hero-name-couple">${escapeHtml(groomName)}</span>
          <span class="hero-amp">&amp;</span>
          <span class="hero-name-couple">${escapeHtml(brideName)}</span>
        </h1>

        <div class="web-romantic-divider">
          <span class="divider-line"></span>
          <span class="divider-icon">💍</span>
          <span class="divider-line"></span>
        </div>

        <p class="web-hero-quote">${escapeHtml(web.heroSubtitle || '«Lo que Dios ha unido, que no lo separe el hombre»')}</p>

        <div class="web-hero-date-badge">
          <span class="badge-calendar-icon">📅</span>
          <span>${formatDateFullSpanish(weddingDateStr)} &bull; ${escapeHtml(settings.weddingTime || '17:30 hrs')}</span>
        </div>

        <!-- Contador Regresivo en Tiempo Real con Tarjetas de Cristal Dorado -->
        <div class="web-countdown-wrapper">
          <div class="countdown-unit-card">
            <span class="countdown-digit" id="cnt-days">00</span>
            <span class="countdown-label">DÍAS</span>
          </div>
          <div class="countdown-unit-card">
            <span class="countdown-digit" id="cnt-hours">00</span>
            <span class="countdown-label">HORAS</span>
          </div>
          <div class="countdown-unit-card">
            <span class="countdown-digit" id="cnt-minutes">00</span>
            <span class="countdown-label">MINUTOS</span>
          </div>
          <div class="countdown-unit-card">
            <span class="countdown-digit" id="cnt-seconds">00</span>
            <span class="countdown-label">SEGUNDOS</span>
          </div>
        </div>

        <div class="hero-actions-row">
          <a href="#section-rsvp" class="btn-hero-rsvp-scroll">
            <span>Confirmar Asistencia</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </a>
          <a href="#section-gallery" class="btn-hero-gallery-scroll">
            <span>Ver Fotos Preboda</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          </a>
        </div>
      </div>
    </section>

    <!-- 2. BIENVENIDA PERSONALIZADA AL INVITADO -->
    ${guest ? `
      <section class="web-guest-vip-section">
        <div class="web-container">
          <div class="web-guest-vip-card">
            <div class="vip-card-icon">💌</div>
            <div class="vip-card-info">
              <span class="vip-badge">Invitación Especial de Honor</span>
              <h2 class="vip-guest-name">¡Hola, ${escapeHtml(guest.name)}!</h2>
              <p class="vip-guest-text">
                Queremos que seas parte fundamental de este gran sacramento ante Dios y celebrar juntos nuestro amor.
              </p>
              <div class="vip-passes-pill">
                <span>🎟️ Pases reservados: <strong>${guest.passes} persona${guest.passes > 1 ? 's' : ''}</strong></span>
                <span class="vip-status-tag ${guest.status === 'Confirmado' ? 'confirmed' : ''}">
                  ${guest.status === 'Confirmado' ? '✅ Ya confirmaste tu asistencia' : '⏳ Pendiente de confirmación'}
                </span>
              </div>
            </div>
            <a href="#section-rsvp" class="btn btn-primary btn-sm vip-btn-confirm">
              ${guest.status === 'Confirmado' ? 'Ver mi confirmación' : 'Confirmar ahora'}
            </a>
          </div>
        </div>
      </section>
    ` : ''}

    <!-- 3. SAGRADA ESCRITURA & NUESTRA HISTORIA -->
    <section class="web-story-section">
      <div class="web-container">
        <div class="web-section-title-wrap">
          <span class="web-subtitle-gold">Bendición Sacramental</span>
          <h2 class="web-section-title">Nuestra Historia de Amor</h2>
          <div class="web-gold-divider">✦ ❖ ✦</div>
        </div>

        <div class="web-story-grid">
          <div class="web-story-photo-wrap">
            <div class="story-photo-arch">
              <img src="${escapeHtml(web.couplePhoto || web.coverPhoto || '')}" alt="${escapeHtml(groomName)} y ${escapeHtml(brideName)}" class="web-couple-img" loading="lazy">
              <div class="story-photo-glow"></div>
            </div>
          </div>
          <div class="web-story-text-wrap">
            <blockquote class="web-scripture-quote">
              <span class="quote-mark">“</span>
              ${escapeHtml(web.scriptureVerse || '')}
            </blockquote>
            <p class="web-story-paragraph">
              ${escapeHtml(web.loveStory || '')}
            </p>
            <div class="web-couple-signatures">
              <span class="signature-groom">${escapeHtml(groomName)}</span>
              <span class="signature-amp">&amp;</span>
              <span class="signature-bride">${escapeHtml(brideName)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. CEREMONIA RELIGIOSA & RECEPCIÓN CON GOOGLE MAPS -->
    <section class="web-locations-section">
      <div class="web-container">
        <div class="web-section-title-wrap">
          <span class="web-subtitle-gold">¿Dónde &amp; Cuándo?</span>
          <h2 class="web-section-title">Lugares de la Celebración</h2>
          <div class="web-gold-divider">✦ ❖ ✦</div>
        </div>

        <div class="web-locations-grid">
          <!-- Iglesia / Templo -->
          <div class="web-location-card">
            <div class="location-img-wrap">
              <img src="${escapeHtml(web.churchPhoto || '')}" alt="Ceremonia Religiosa" loading="lazy">
              <span class="location-badge">Ceremonia Religiosa ⛪</span>
            </div>
            <div class="location-card-body">
              <div class="location-time-tag">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>${escapeHtml(settings.weddingTime || '17:30 hrs')}</span>
              </div>
              <h3 class="location-name">${escapeHtml(settings.churchName || 'Parroquia San Francisco de Asís')}</h3>
              <p class="location-address">${escapeHtml(web.churchAddress || 'Centro Histórico de Lima')}</p>
              
              <div class="location-actions">
                <a href="${escapeHtml(web.churchMapUrl || `https://maps.google.com/?q=${encodeURIComponent(settings.churchName || '')}`)}" target="_blank" rel="noopener noreferrer" class="btn-location-map">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Cómo llegar (Google Maps)</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Recepción / Fiesta -->
          <div class="web-location-card">
            <div class="location-img-wrap">
              <img src="${escapeHtml(web.receptionPhoto || '')}" alt="Recepción y Brindis" loading="lazy">
              <span class="location-badge venue-badge">Fiesta &amp; Recepción 🥂</span>
            </div>
            <div class="location-card-body">
              <div class="location-time-tag venue-tag">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>19:30 hrs (Al concluir la misa)</span>
              </div>
              <h3 class="location-name">${escapeHtml(settings.receptionVenue || 'Hacienda Villa Esperanza')}</h3>
              <p class="location-address">${escapeHtml(web.receptionAddress || 'Valle Hermoso')}</p>
              
              <div class="location-actions">
                <a href="${escapeHtml(web.receptionMapUrl || `https://maps.google.com/?q=${encodeURIComponent(settings.receptionVenue || '')}`)}" target="_blank" rel="noopener noreferrer" class="btn-location-map">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Ver ubicación en Mapa</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. CRONOGRAMA & ITINERARIO -->
    <section class="web-itinerary-section">
      <div class="web-container">
        <div class="web-section-title-wrap">
          <span class="web-subtitle-gold">El Programa Nupcial</span>
          <h2 class="web-section-title">Itinerario del Gran Día</h2>
          <div class="web-gold-divider">✦ ❖ ✦</div>
        </div>

        <div class="web-timeline-list">
          ${(web.timeline || []).map((item, index) => `
            <div class="web-timeline-item">
              <div class="timeline-item-icon">${escapeHtml(item.icon || '✨')}</div>
              <div class="timeline-item-time">${escapeHtml(item.time || '')}</div>
              <div class="timeline-item-content">
                <h4 class="timeline-item-title">${escapeHtml(item.title || '')}</h4>
                <p class="timeline-item-desc">${escapeHtml(item.desc || '')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 6. CÓDIGO DE VESTIMENTA (DRESS CODE) -->
    <section class="web-dresscode-section">
      <div class="web-container web-container-narrow">
        <div class="web-dresscode-card">
          <div class="dresscode-icon-circle">👔👗</div>
          <span class="web-subtitle-gold">Código de Vestimenta</span>
          <h3 class="dresscode-title">${escapeHtml(web.dressCodeTitle || settings.dressCode || 'Elegante / Traje Formal')}</h3>
          <p class="dresscode-note">${escapeHtml(web.dressCodeNote || '')}</p>

          <div class="dresscode-palette-wrap">
            <span class="palette-label">Paleta sugerida de colores:</span>
            <div class="palette-swatches">
              ${(web.dressCodeColors || ['#1E293B', '#334155', '#C5A059', '#E2E8F0', '#BE185D']).map(color => `
                <div class="color-swatch-circle" style="background-color: ${escapeHtml(color)};" title="${escapeHtml(color)}"></div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. GALERÍA DE FOTOS PREBODA EN CARRUSEL ROMÁNTICO & VIDEO -->
    <section class="web-gallery-section" id="section-gallery">
      <div class="web-container">
        <div class="web-section-title-wrap">
          <span class="web-subtitle-gold">Nuestros Momentos Inolvidables</span>
          <h2 class="web-section-title">Galería de Fotos</h2>
          <div class="web-gold-divider">✦ ❖ ✦</div>
          <p class="gallery-lead-text">Desliza las fotos de nuestra sesión preboda para revivir nuestra historia</p>
        </div>

        <!-- CARRUSEL PRINCIPAL ULTRA ROMÁNTICO -->
        <div class="gallery-carousel-wrapper" id="gallery-carousel">
          <!-- Barra de Progreso de Auto-Slide -->
          <div class="gallery-progress-bar-wrap">
            <div class="gallery-progress-bar-fill" id="gallery-progress-fill"></div>
          </div>

          <!-- Marco con Passepartout Dorado y Sombra Profunda -->
          <div class="gallery-carousel-frame">
            <div class="gallery-carousel-track" id="gallery-track">
              ${galleryPhotos.map((photoUrl, i) => `
                <div class="gallery-carousel-slide" data-idx="${i}">
                  <div class="gallery-slide-inner">
                    <img src="${escapeHtml(photoUrl)}" alt="Momento romántico ${i + 1}" loading="lazy">
                    <div class="gallery-slide-overlay">
                      <span class="gallery-slide-caption">Momento ${i + 1} de ${galleryPhotos.length}</span>
                      <button type="button" class="btn-gallery-zoom" data-idx="${i}" title="Ampliar foto">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                        <span>Ver en Grande</span>
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Controles de Navegación Flechas Doradas -->
            <button type="button" class="gallery-nav-btn gallery-prev" id="gallery-prev" aria-label="Foto anterior">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button type="button" class="gallery-nav-btn gallery-next" id="gallery-next" aria-label="Foto siguiente">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Pie del Carrusel con Dots y Contador -->
          <div class="gallery-carousel-footer">
            <div class="gallery-dots" id="gallery-dots">
              ${galleryPhotos.map((_, i) => `
                <button type="button" class="gallery-dot ${i === 0 ? 'active' : ''}" data-dot="${i}" aria-label="Ir a foto ${i + 1}"></button>
              `).join('')}
            </div>

            <div class="gallery-counter" id="gallery-counter">
              <span class="gallery-counter-icon">📷</span>
              <span id="gallery-current">1</span> / <span>${galleryPhotos.length}</span>
            </div>
          </div>
        </div>

        <!-- Miniaturas Navegables -->
        <div class="gallery-thumbs-row" id="gallery-thumbs">
          ${galleryPhotos.map((photoUrl, i) => `
            <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-thumb="${i}">
              <img src="${escapeHtml(photoUrl)}" alt="Miniatura ${i + 1}" loading="lazy">
            </div>
          `).join('')}
        </div>

        ${web.videoUrl ? `
          <div class="web-video-container">
            <h4 class="web-video-title">🎥 Video Especial de Nuestra Historia</h4>
            <div class="video-responsive-wrap">
              ${renderVideoEmbedHtml(web.videoUrl)}
            </div>
          </div>
        ` : ''}
      </div>
    </section>

    <!-- LIGHTBOX OVERLAY PARA VER FOTO AMPLIADA -->
    <div class="gallery-lightbox" id="gallery-lightbox" style="display:none;">
      <button class="lightbox-close" id="lightbox-close" aria-label="Cerrar foto">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <button class="lightbox-prev" id="lightbox-prev" aria-label="Foto anterior">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="lightbox-img-wrap">
        <img src="" alt="Foto ampliada" id="lightbox-img">
      </div>
      <button class="lightbox-next" id="lightbox-next" aria-label="Foto siguiente">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="lightbox-counter" id="lightbox-counter">1 / ${galleryPhotos.length}</div>
    </div>

    <!-- 8. MESA DE REGALOS & CUENTAS BANCARIAS -->
    <section class="web-gifts-section">
      <div class="web-container web-container-narrow">
        <div class="web-section-title-wrap">
          <span class="web-subtitle-gold">Lluvia de Sobres</span>
          <h2 class="web-section-title">Mesa de Regalos</h2>
          <div class="web-gold-divider">✦ ❖ ✦</div>
        </div>

        <div class="web-gifts-card">
          <p class="gifts-intro-text">${escapeHtml(web.giftNote || '')}</p>

          <!-- Cuentas de Banco -->
          <div class="bank-accounts-list">
            ${(web.bankAccounts || []).map(b => `
              <div class="bank-item-box">
                <div class="bank-header-row">
                  <span class="bank-name-badge">${escapeHtml(b.bank)}</span>
                  <span class="bank-type">${escapeHtml(b.type)}</span>
                </div>
                <div class="bank-details-row">
                  <div class="bank-number-wrap">
                    <span class="bank-label">N° Cuenta:</span>
                    <strong class="bank-val">${escapeHtml(b.number)}</strong>
                  </div>
                  <button class="btn-copy-bank" data-copy="${escapeHtml(b.number)}" title="Copiar número de cuenta">Copiar</button>
                </div>
                ${b.cci ? `
                  <div class="bank-details-row">
                    <div class="bank-number-wrap">
                      <span class="bank-label">CCI:</span>
                      <span class="bank-val-cci">${escapeHtml(b.cci)}</span>
                    </div>
                    <button class="btn-copy-bank" data-copy="${escapeHtml(b.cci)}" title="Copiar CCI">Copiar</button>
                  </div>
                ` : ''}
                <div class="bank-holder-label">Titular: ${escapeHtml(b.holder)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Billeteras Digitales (Yape / Plin) -->
          ${(web.digitalWallets && web.digitalWallets.length > 0) ? `
            <div class="digital-wallets-row">
              ${web.digitalWallets.map(w => `
                <div class="wallet-pill-box">
                  <span class="wallet-app-tag">${escapeHtml(w.app)}</span>
                  <span class="wallet-phone">${escapeHtml(w.phone)}</span>
                  <button class="btn-copy-wallet" data-copy="${escapeHtml(w.phone)}">Copiar</button>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </section>

    <!-- 9. CONFIRMACIÓN DE ASISTENCIA INTERACTIVA (RSVP) -->
    <section class="web-rsvp-section" id="section-rsvp">
      <div class="web-container web-container-narrow">
        <div class="web-rsvp-card">
          <div class="rsvp-card-header">
            <span class="rsvp-cross">✝</span>
            <span class="web-subtitle-gold">Tu Presencia es Nuestro Mejor Regalo</span>
            <h2 class="web-section-title" style="margin-bottom: 0.5rem;">Confirmar Asistencia (RSVP)</h2>
            <p class="rsvp-lead">Por favor confirma tu asistencia antes del <strong>15 de Enero</strong> para tener todo preparado para ti con mucho cariño.</p>
          </div>

          <form id="form-web-rsvp" class="web-rsvp-form">
            <div class="form-group">
              <label class="form-label" for="web-rsvp-name">Nombre Completo o Familia *</label>
              <input type="text" id="web-rsvp-name" class="form-input" value="${guest ? escapeHtml(guest.name) : ''}" placeholder="Ej. Familia Rodríguez o Carlos Gómez" required>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="web-rsvp-passes">¿Cuántos integrantes asistirán? *</label>
                <select id="web-rsvp-passes" class="form-select">
                  ${Array.from({ length: guest ? guest.passes : 4 }, (_, i) => i + 1).map(n => `
                    <option value="${n}" ${guest && guest.confirmedPasses === n ? 'selected' : (n === (guest ? guest.passes : 2) ? 'selected' : '')}>
                      ${n} persona${n > 1 ? 's' : ''} ${guest && n === guest.passes ? '(Pases totales reservados)' : ''}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="web-rsvp-status">¿Nos acompañarás? *</label>
                <select id="web-rsvp-status" class="form-select">
                  <option value="Confirmado" ${guest && guest.status === 'Confirmado' ? 'selected' : ''}>✅ Sí, asistiré con alegría</option>
                  <option value="Declinado" ${guest && guest.status === 'Declinado' ? 'selected' : ''}>❌ Lamentablemente no podré</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="web-rsvp-message">Mensaje o bendición para los novios (Opcional)</label>
              <textarea id="web-rsvp-message" class="form-textarea" rows="3" placeholder="¡Muchas felicidades en este santo sacramento! Nos vemos en la iglesia."></textarea>
            </div>

            <div class="rsvp-submit-wrap">
              <button type="submit" class="btn btn-primary btn-lg btn-confirm-wedding">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Enviar mi Confirmación</span>
              </button>
            </div>
          </form>

          <!-- Caja de Éxito al Confirmar (Oculta inicialmente) -->
          <div class="web-rsvp-success-box" id="web-rsvp-success" style="display: none;">
            <div class="success-icon">🕊️💍✨</div>
            <h3 class="success-title">¡Muchas Gracias por tu Confirmación!</h3>
            <p class="success-desc" id="success-desc-text">
              Tu respuesta ha quedado registrada en el sistema de los novios. ¡Esperamos con emoción celebrar este día inolvidable juntos!
            </p>
            <div class="success-actions">
              <button class="btn btn-secondary btn-sm" id="btn-re-edit-rsvp">Modificar mi respuesta</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 10. PIE DE PÁGINA NUPCIAL ROMÁNTICO -->
    <footer class="web-wedding-footer">
      <div class="web-container">
        <div class="footer-sacred-cross">✝</div>
        <div class="footer-couple-names">${escapeHtml(groomName)} &amp; ${escapeHtml(brideName)}</div>
        <p class="footer-scripture">«El amor nunca deja de ser»</p>
        <div class="footer-copy">Nuestra Boda Católica &bull; 2026-2027 &bull; Con la Gracia y Bendición de Dios</div>
      </div>
    </footer>
  `;

  // Inicializar audio y eventos
  setupAudioPlayer(web.musicUrl);
  setupCountdownTimer(weddingDateStr);
  setupWebEventListeners(guest);
}

// -------------------------------------------------------------
// CONTROLADOR DE AUDIO DE FONDO
// -------------------------------------------------------------
function setupAudioPlayer(musicUrl) {
  if (!musicUrl) return;

  if (!audioElement) {
    audioElement = new Audio(musicUrl);
    audioElement.loop = true;
  } else {
    audioElement.src = musicUrl;
  }

  const btnToggle = document.getElementById('btn-toggle-music');
  if (btnToggle) {
    btnToggle.onclick = () => {
      toggleMusicPlayback();
    };
  }
}

function toggleMusicPlayback() {
  if (!audioElement) return;
  const btnToggle = document.getElementById('btn-toggle-music');

  if (isAudioPlaying) {
    audioElement.pause();
    isAudioPlaying = false;
    if (btnToggle) {
      btnToggle.classList.remove('playing');
      const label = btnToggle.querySelector('.music-label');
      if (label) label.textContent = 'Música';
    }
  } else {
    audioElement.play().then(() => {
      isAudioPlaying = true;
      if (btnToggle) {
        btnToggle.classList.add('playing');
        const label = btnToggle.querySelector('.music-label');
        if (label) label.textContent = 'Pausar';
      }
    }).catch(err => {
      console.log('Autoplay bloqueado por el navegador hasta interacción:', err);
    });
  }
}

// -------------------------------------------------------------
// CONTADOR REGRESIVO EN TIEMPO REAL
// -------------------------------------------------------------
function setupCountdownTimer(targetDateStr) {
  const targetDate = new Date(`${targetDateStr}T17:30:00`);

  function update() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      const elD = document.getElementById('cnt-days');
      const elH = document.getElementById('cnt-hours');
      const elM = document.getElementById('cnt-minutes');
      const elS = document.getElementById('cnt-seconds');
      if (elD) elD.textContent = '00';
      if (elH) elH.textContent = '00';
      if (elM) elM.textContent = '00';
      if (elS) elS.textContent = '00';
      if (countdownTimerId) clearInterval(countdownTimerId);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const elDays = document.getElementById('cnt-days');
    const elHours = document.getElementById('cnt-hours');
    const elMin = document.getElementById('cnt-minutes');
    const elSec = document.getElementById('cnt-seconds');

    if (elDays) elDays.textContent = days.toString().padStart(2, '0');
    if (elHours) elHours.textContent = hours.toString().padStart(2, '0');
    if (elMin) elMin.textContent = minutes.toString().padStart(2, '0');
    if (elSec) elSec.textContent = seconds.toString().padStart(2, '0');
  }

  update();
  countdownTimerId = setInterval(update, 1000);
}

// -------------------------------------------------------------
// EVENTOS, SOBRE NUPCIAL Y FORMULARIO RSVP
// -------------------------------------------------------------
function setupWebEventListeners(guest) {
  // Volver al Panel de Bodas
  const btnBack = document.getElementById('btn-back-to-admin');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      closeWeddingWeb();
    });
  }

  // ---- SOBRE NUPCIAL INTERACTIVO CON LACRE ----
  const envelopeOverlay = document.getElementById('wedding-envelope-overlay');
  const envelopeCard = document.getElementById('envelope-card');
  const sealTrigger = document.getElementById('envelope-seal-trigger');
  const btnOpenEnvelope = document.getElementById('btn-open-envelope-action');
  const btnReopen = document.getElementById('btn-reopen-envelope');

  function openEnvelope() {
    if (!envelopeCard || !envelopeOverlay) return;
    envelopeCard.classList.add('envelope-opening');

    // Reproducir música romántica automáticamente con la interacción
    if (audioElement && !isAudioPlaying) {
      audioElement.play().then(() => {
        isAudioPlaying = true;
        const btnToggle = document.getElementById('btn-toggle-music');
        if (btnToggle) {
          btnToggle.classList.add('playing');
          const label = btnToggle.querySelector('.music-label');
          if (label) label.textContent = 'Pausar';
        }
      }).catch(() => {});
    }

    // Desvanecer el sobre tras la animación de apertura de la solapa
    setTimeout(() => {
      envelopeOverlay.classList.add('envelope-dismissed');
    }, 700);
  }

  if (sealTrigger) sealTrigger.addEventListener('click', openEnvelope);
  if (btnOpenEnvelope) btnOpenEnvelope.addEventListener('click', openEnvelope);

  // Botón reabrir sobre en cualquier momento
  if (btnReopen) {
    btnReopen.addEventListener('click', () => {
      if (envelopeOverlay && envelopeCard) {
        envelopeCard.classList.remove('envelope-opening');
        envelopeOverlay.classList.remove('envelope-dismissed');
      }
    });
  }

  // ---- TOGGLE DE PÉTALOS FLOTANTES ----
  const petalsLayer = document.getElementById('romantic-petals-container');
  const btnTogglePetals = document.getElementById('btn-toggle-petals');
  if (btnTogglePetals && petalsLayer) {
    btnTogglePetals.addEventListener('click', () => {
      petalsActive = !petalsActive;
      if (petalsActive) {
        petalsLayer.classList.remove('petals-hidden');
        btnTogglePetals.classList.add('active');
      } else {
        petalsLayer.classList.add('petals-hidden');
        btnTogglePetals.classList.remove('active');
      }
    });
  }

  // ---- CARRUSEL ROMÁNTICO DE GALERÍA ----
  setupGalleryCarousel();

  // Copiar números de cuenta bancaria y billeteras
  document.querySelectorAll('.btn-copy-bank, .btn-copy-wallet').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = btn.textContent;
          btn.textContent = '¡Copiado!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
          }, 2000);
        });
      }
    });
  });

  // Enviar Formulario RSVP
  const formRsvp = document.getElementById('form-web-rsvp');
  const successBox = document.getElementById('web-rsvp-success');
  const successDesc = document.getElementById('success-desc-text');

  if (formRsvp) {
    formRsvp.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = document.getElementById('web-rsvp-name').value.trim();
      const passes = parseInt(document.getElementById('web-rsvp-passes').value, 10) || 1;
      const status = document.getElementById('web-rsvp-status').value;
      const message = document.getElementById('web-rsvp-message').value.trim();

      if (guest) {
        store.confirmGuestByToken(guest.token, status, passes, message);
      } else {
        store.addGuest({
          name: guestName,
          passes: passes,
          status: status,
          notes: message ? `RSVP Web: ${message}` : 'Confirmado desde web de invitación',
          confirmedPasses: status === 'Confirmado' ? passes : 0,
          confirmedAt: new Date().toISOString()
        });
      }

      formRsvp.style.display = 'none';
      if (successBox) {
        successBox.style.display = 'block';
        if (successDesc) {
          successDesc.innerHTML = status === 'Confirmado' 
            ? `Tu asistencia para <strong>${passes} persona${passes > 1 ? 's' : ''}</strong> a nombre de <strong>${escapeHtml(guestName)}</strong> ha quedado confirmada. ¡Nos vemos en el altar de Dios!`
            : `Hemos registrado tu respuesta a nombre de <strong>${escapeHtml(guestName)}</strong>. Agradecemos tus oraciones y cariño para con nosotros.`;
        }
      }
    });
  }

  // Modificar respuesta
  const btnReEdit = document.getElementById('btn-re-edit-rsvp');
  if (btnReEdit) {
    btnReEdit.addEventListener('click', () => {
      if (formRsvp && successBox) {
        formRsvp.style.display = 'block';
        successBox.style.display = 'none';
      }
    });
  }
}

// -------------------------------------------------------------
// CARRUSEL INTERACTIVO DE GALERÍA + LIGHTBOX ROMÁNTICO
// -------------------------------------------------------------
function setupGalleryCarousel() {
  const carouselWrapper = document.getElementById('gallery-carousel');
  const track = document.getElementById('gallery-track');
  const dotsContainer = document.getElementById('gallery-dots');
  const thumbsContainer = document.getElementById('gallery-thumbs');
  const currentEl = document.getElementById('gallery-current');
  const progressFill = document.getElementById('gallery-progress-fill');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCounter = document.getElementById('lightbox-counter');

  if (!track) return;

  const slides = track.querySelectorAll('.gallery-carousel-slide');
  const dots = dotsContainer ? dotsContainer.querySelectorAll('.gallery-dot') : [];
  const thumbs = thumbsContainer ? thumbsContainer.querySelectorAll('.gallery-thumb') : [];
  const total = slides.length;
  if (total === 0) return;

  let current = 0;
  const slideDuration = 4500;
  let startX = 0;

  function resetProgressBar() {
    if (!progressFill) return;
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    setTimeout(() => {
      progressFill.style.transition = `width ${slideDuration}ms linear`;
      progressFill.style.width = '100%';
    }, 40);
  }

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    thumbs.forEach((t, i) => {
      const isActive = i === current;
      t.classList.toggle('active', isActive);
      // Desplazamiento suave EXCLUSIVAMENTE horizontal dentro de la fila de miniaturas,
      // evitando scrollIntoView que fuerza el scroll de la ventana principal y roba el foco
      if (isActive && thumbsContainer) {
        const containerWidth = thumbsContainer.clientWidth;
        const thumbLeft = t.offsetLeft;
        const thumbWidth = t.offsetWidth;
        const targetScroll = thumbLeft - (containerWidth / 2) + (thumbWidth / 2);
        thumbsContainer.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      }
    });
    if (currentEl) currentEl.textContent = current + 1;
    resetProgressBar();
  }

  function startAutoSlide() {
    stopAutoSlide();
    resetProgressBar();
    carouselAutoSlideId = setInterval(() => {
      goTo(current + 1);
    }, slideDuration);
  }

  function stopAutoSlide() {
    if (carouselAutoSlideId) {
      clearInterval(carouselAutoSlideId);
      carouselAutoSlideId = null;
    }
    if (progressFill) {
      progressFill.style.transition = 'none';
      progressFill.style.width = '0%';
    }
  }

  // Pausar auto-slide al pasar el cursor por el carrusel
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoSlide);
    carouselWrapper.addEventListener('mouseleave', startAutoSlide);
  }

  // Botones Prev / Next
  const btnPrev = document.getElementById('gallery-prev');
  const btnNext = document.getElementById('gallery-next');
  if (btnPrev) btnPrev.addEventListener('click', () => { stopAutoSlide(); goTo(current - 1); startAutoSlide(); });
  if (btnNext) btnNext.addEventListener('click', () => { stopAutoSlide(); goTo(current + 1); startAutoSlide(); });

  // Puntos de paginación
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAutoSlide();
      goTo(parseInt(dot.dataset.dot, 10));
      startAutoSlide();
    });
  });

  // Miniaturas
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      stopAutoSlide();
      goTo(parseInt(thumb.dataset.thumb, 10));
      startAutoSlide();
    });
  });

  // Soporte táctil / swipe fluido
  track.addEventListener('touchstart', (e) => { 
    startX = e.touches[0].clientX; 
    stopAutoSlide(); 
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
    startAutoSlide();
  });

  // Botón zoom / ampliación
  track.querySelectorAll('.btn-gallery-zoom').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(parseInt(btn.dataset.idx, 10));
    });
  });

  // Clic en la foto del slide para ampliar
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => openLightbox(i));
  });

  // Lógica del Lightbox
  let lbCurrent = 0;
  const galleryUrls = Array.from(slides).map(s => s.querySelector('img')?.src || '');

  function openLightbox(idx) {
    lbCurrent = idx;
    if (lightboxImg) lightboxImg.src = galleryUrls[lbCurrent];
    if (lightboxCounter) lightboxCounter.textContent = `${lbCurrent + 1} / ${total}`;
    if (lightbox) {
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    stopAutoSlide();
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
    startAutoSlide();
  }

  const btnLbClose = document.getElementById('lightbox-close');
  const btnLbPrev = document.getElementById('lightbox-prev');
  const btnLbNext = document.getElementById('lightbox-next');

  if (btnLbClose) btnLbClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  if (btnLbPrev) btnLbPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    lbCurrent = (lbCurrent - 1 + total) % total;
    if (lightboxImg) lightboxImg.src = galleryUrls[lbCurrent];
    if (lightboxCounter) lightboxCounter.textContent = `${lbCurrent + 1} / ${total}`;
  });
  if (btnLbNext) btnLbNext.addEventListener('click', (e) => {
    e.stopPropagation();
    lbCurrent = (lbCurrent + 1) % total;
    if (lightboxImg) lightboxImg.src = galleryUrls[lbCurrent];
    if (lightboxCounter) lightboxCounter.textContent = `${lbCurrent + 1} / ${total}`;
  });

  // Navegación por teclado en lightbox
  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.style.display !== 'none') {
      if (e.key === 'ArrowLeft') btnLbPrev?.click();
      if (e.key === 'ArrowRight') btnLbNext?.click();
      if (e.key === 'Escape') closeLightbox();
    }
  });

  // Iniciar carrusel en la primera foto
  goTo(0);
  startAutoSlide();
}

export function closeWeddingWeb() {
  const container = document.getElementById('wedding-web-invitation-container');
  const appLayout = document.getElementById('app-layout');
  if (container) container.style.display = 'none';
  if (appLayout) appLayout.style.display = 'block';
  document.body.classList.remove('wedding-web-active');

  if (countdownTimerId) {
    clearInterval(countdownTimerId);
    countdownTimerId = null;
  }
  if (carouselAutoSlideId) {
    clearInterval(carouselAutoSlideId);
    carouselAutoSlideId = null;
  }
  if (audioElement && isAudioPlaying) {
    audioElement.pause();
    isAudioPlaying = false;
  }

  // Limpiar URL param si se regresa al panel
  if (window.history.pushState) {
    window.history.pushState({}, document.title, window.location.pathname);
  }

  if (window.navigateToTab) {
    window.navigateToTab('invitations');
  }
}

// Auxiliar para video embebido (YouTube / Vimeo / MP4)
function renderVideoEmbedHtml(url) {
  if (!url) return '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }
  if (url.includes('vimeo.com')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `<iframe src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }
  return `<video controls src="${escapeHtml(url)}" style="width:100%; border-radius:12px;"></video>`;
}

function formatDateFullSpanish(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${day} de ${months[month]} de ${year}`;
  }
  return dateStr;
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
