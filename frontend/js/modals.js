/**
 * modals.js
 * Controls all modal dialogues and lightboxes:
 * - Collective Member Dossier Lightbox (#member-dossier-modal)
 * - Wire Photo Lightbox (#wire-photo-modal)
 * - Showreel Video Viewer (#reel-modal)
 * - Crew Application Sheet (#apply-modal)
 * - Story Pitch Sheet (#pitch-modal)
 * - Keyboard listeners (Escape to dismiss, Arrow keys for lightbox pagination)
 * - CSP-compliant event delegation for all data-action triggers
 * 
 * Depends on: api.js (window.collectiveMembers, window.wirePhotos), drawer.js (window.isDrawerOpen, window.closeDrawer)
 */
(function () {
  var currentDossierIndex = 0;
  var currentWireIndex = 0;

  /* ========================================================
   * 1. MEMBER DOSSIER MODAL
   * ======================================================== */
  window.openMemberDossier = function (indexOrId) {
    var members = window.collectiveMembers || [];
    if (!members.length) return;

    var targetIndex = -1;
    if (typeof indexOrId === 'number' && !isNaN(indexOrId)) {
      targetIndex = ((indexOrId % members.length) + members.length) % members.length;
    } else if (typeof indexOrId === 'string' && !isNaN(parseInt(indexOrId, 10))) {
      var parsed = parseInt(indexOrId, 10);
      targetIndex = members.findIndex(function (m) { return m.id === parsed; });
      if (targetIndex === -1 && parsed >= 0 && parsed < members.length) {
        targetIndex = parsed;
      }
    } else {
      targetIndex = members.findIndex(function (m) { return m.id === indexOrId; });
    }

    if (targetIndex === -1) {
      targetIndex = 0;
    }

    currentDossierIndex = ((targetIndex % members.length) + members.length) % members.length;
    var member = members[currentDossierIndex];
    if (!member) return;

    var idxEl = document.getElementById('dossier-index');
    if (idxEl) idxEl.textContent = String(currentDossierIndex + 1).padStart(2, '0');
    var imgEl = document.getElementById('dossier-image');
    if (imgEl) {
      imgEl.src = member.photoUrl || member.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
      imgEl.alt = member.name || 'Member';
    }
    var roleEl = document.getElementById('dossier-role');
    if (roleEl) roleEl.textContent = member.role || '';
    var nameEl = document.getElementById('dossier-name');
    if (nameEl) nameEl.textContent = member.name || '';
    var quoteEl = document.getElementById('dossier-quote');
    if (quoteEl) quoteEl.textContent = member.quote ? (member.quote.startsWith('"') ? member.quote : '"' + member.quote + '"') : '';
    var deptEl = document.getElementById('dossier-dept');
    if (deptEl) deptEl.textContent = member.department || member.dept || '';
    var handleEl = document.getElementById('dossier-handle');
    if (handleEl) handleEl.textContent = member.instagramHandle || member.handle || '';
    var socialEl = document.getElementById('dossier-social-link');
    if (socialEl) {
      var handle = member.instagramHandle || member.handle || '';
      socialEl.href = handle ? ('https://www.instagram.com/' + handle.replace('@', '')) : (member.socialUrl || 'https://www.instagram.com/the.mediamovers');
    }
    var bioEl = document.getElementById('dossier-bio');
    if (bioEl) bioEl.textContent = member.bio || '';
    var camEl = document.getElementById('dossier-cam-tag');
    if (camEl) camEl.textContent = member.camTag || ('MEMBER // ' + String(currentDossierIndex + 1).padStart(2, '0'));

    var modal = document.getElementById('member-dossier-modal');
    var container = document.getElementById('dossier-container');
    if (modal && container) {
      modal.classList.remove('hidden');
      requestAnimationFrame(function () {
        modal.classList.remove('opacity-0');
        container.classList.remove('scale-95');
        container.classList.add('scale-100');
      });
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeMemberDossier = function () {
    var modal = document.getElementById('member-dossier-modal');
    var container = document.getElementById('dossier-container');
    if (modal && container) {
      modal.classList.add('opacity-0');
      container.classList.remove('scale-100');
      container.classList.add('scale-95');
      setTimeout(function () {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }, 250);
    }
  };

  window.navigateDossier = function (direction) {
    var members = window.collectiveMembers || [];
    if (!members.length) return;
    var newIdx = ((currentDossierIndex + direction) % members.length + members.length) % members.length;
    window.openMemberDossier(newIdx);
  };

  /* ========================================================
   * 2. WIRE PHOTO MODAL
   * ======================================================== */
  window.openWirePhoto = function (index) {
    var photos = window.wirePhotos || [];
    if (!photos.length) return;
    currentWireIndex = ((index % photos.length) + photos.length) % photos.length;
    var photo = photos[currentWireIndex];
    if (!photo) return;

    var tagEl = document.getElementById('wire-tag');
    if (tagEl) tagEl.textContent = photo.tag || '// ON THE WIRE • ARCHIVE';
    var reelEl = document.getElementById('wire-reel-id');
    if (reelEl) reelEl.textContent = photo.reelId || ('[ REEL #' + String(currentWireIndex + 104) + ' ]');
    var titleEl = document.getElementById('wire-title');
    if (titleEl) titleEl.textContent = photo.title || '';
    var descEl = document.getElementById('wire-desc');
    if (descEl) descEl.textContent = photo.desc || '';
    var imgEl = document.getElementById('wire-image');
    if (imgEl) imgEl.src = photo.image || photo.imageUrl || '';

    var modal = document.getElementById('wire-photo-modal');
    var container = document.getElementById('wire-container');
    if (modal && container) {
      modal.classList.remove('hidden');
      requestAnimationFrame(function () {
        modal.classList.remove('opacity-0');
        container.classList.remove('scale-95');
        container.classList.add('scale-100');
      });
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeWirePhoto = function () {
    var modal = document.getElementById('wire-photo-modal');
    var container = document.getElementById('wire-container');
    if (modal && container) {
      modal.classList.add('opacity-0');
      container.classList.remove('scale-100');
      container.classList.add('scale-95');
      setTimeout(function () {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }, 250);
    }
  };

  window.navigateWire = function (direction) {
    var photos = window.wirePhotos || [];
    if (!photos.length) return;
    var nextIdx = ((currentWireIndex + direction) % photos.length + photos.length) % photos.length;
    window.openWirePhoto(nextIdx);
  };

  /* ========================================================
   * 3. SHOWREEL VIDEO MODAL
   * ======================================================== */
  window.openReelModal = function () {
    var modal = document.getElementById('reel-modal');
    var video = document.getElementById('reel-video');
    var errBox = document.getElementById('reel-video-error');
    if (!modal) return;

    if (errBox) errBox.classList.add('hidden');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (video) {
      // Ensure error listener attached once
      if (!video.__errorBound) {
        video.__errorBound = true;
        video.addEventListener('error', function () {
          console.warn('[Video] Playback error on #reel-video');
          if (errBox) errBox.classList.remove('hidden');
        });
      }

      video.currentTime = 0;
      var playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function (err) {
          console.warn('[Video] Autoplay policy prevented playback:', err.message);
        });
      }
    }
  };

  window.closeReelModal = function () {
    var modal = document.getElementById('reel-modal');
    var video = document.getElementById('reel-video');
    if (video) {
      try { video.pause(); } catch (_) {}
    }
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  /* ========================================================
   * 4. CREW APPLICATION & STORY PITCH MODALS
   * ======================================================== */
  var originalApplyModalCardHtml = null;
  var originalPitchModalCardHtml = null;

  window.openApplyModal = function () {
    var modal = document.getElementById('apply-modal');
    if (!modal) return;
    var isOpen = (typeof JOIN_OPEN !== 'undefined') ? JOIN_OPEN : (window.JOIN_OPEN !== undefined ? window.JOIN_OPEN : true);
    var card = modal.querySelector('.relative.w-full.max-w-xl');

    if (!isOpen) {
      if (card) {
        if (!originalApplyModalCardHtml) {
          originalApplyModalCardHtml = card.innerHTML;
        }
        card.innerHTML =
          '<div class="flex items-center justify-between pb-4 border-b border-border-hairline mb-6">' +
          '  <div>' +
          '    <span class="font-label-mono-sm text-label-mono-sm text-primary uppercase">// CALLBOARD STATUS</span>' +
          '    <h3 class="font-headline-md text-headline-md uppercase text-on-surface">APPLICATIONS CLOSED</h3>' +
          '  </div>' +
          '  <button class="text-text-muted hover:text-on-surface transition-colors cursor-pointer" data-action="close-apply" aria-label="Close Application">' +
          '    <span class="material-symbols-outlined text-[24px]">close</span>' +
          '  </button>' +
          '</div>' +
          '<div class="py-6 text-center flex flex-col items-center">' +
          '  <p class="font-body-lg text-body-lg text-text-muted max-w-md leading-relaxed mb-8">' +
          '    Applications are currently closed. Please check back soon.' +
          '  </p>' +
          '  <button type="button" data-action="close-apply" class="px-8 py-3 bg-primary-container text-on-surface font-label-mono-lg uppercase font-medium hover:bg-accent-hover transition-all cursor-pointer">' +
          '    CLOSE' +
          '  </button>' +
          '</div>';
      }
    } else {
      if (card && originalApplyModalCardHtml) {
        card.innerHTML = originalApplyModalCardHtml;
      }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.closeApplyModal = function () {
    var modal = document.getElementById('apply-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  window.openPitchModal = function () {
    var modal = document.getElementById('pitch-modal');
    if (!modal) return;
    var isOpen = (typeof JOIN_OPEN !== 'undefined') ? JOIN_OPEN : (window.JOIN_OPEN !== undefined ? window.JOIN_OPEN : true);
    var card = modal.querySelector('.relative.w-full.max-w-xl');

    if (!isOpen) {
      if (card) {
        if (!originalPitchModalCardHtml) {
          originalPitchModalCardHtml = card.innerHTML;
        }
        card.innerHTML =
          '<div class="flex items-center justify-between pb-4 border-b border-border-hairline mb-6">' +
          '  <div>' +
          '    <span class="font-label-mono-sm text-label-mono-sm text-primary uppercase">// EDITORIAL STATUS</span>' +
          '    <h3 class="font-headline-md text-headline-md uppercase text-on-surface">SUBMISSIONS CLOSED</h3>' +
          '  </div>' +
          '  <button class="text-text-muted hover:text-on-surface transition-colors cursor-pointer" data-action="close-pitch" aria-label="Close Pitch Modal">' +
          '    <span class="material-symbols-outlined text-[24px]">close</span>' +
          '  </button>' +
          '</div>' +
          '<div class="py-6 text-center flex flex-col items-center">' +
          '  <p class="font-body-lg text-body-lg text-text-muted max-w-md leading-relaxed mb-8">' +
          '    Applications are currently closed. Please check back soon.' +
          '  </p>' +
          '  <button type="button" data-action="close-pitch" class="px-8 py-3 bg-primary-container text-on-surface font-label-mono-lg uppercase font-medium hover:bg-accent-hover transition-all cursor-pointer">' +
          '    CLOSE' +
          '  </button>' +
          '</div>';
      }
    } else {
      if (card && originalPitchModalCardHtml) {
        card.innerHTML = originalPitchModalCardHtml;
      }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.closePitchModal = function () {
    var modal = document.getElementById('pitch-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  /* ========================================================
   * 5. CENTRAL EVENT DELEGATION (CSP Compliant — No Inline JS)
   * ======================================================== */
  document.addEventListener('click', function (e) {
    // 1. Check for data-action on target or closest ancestor
    var actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      var action = actionEl.getAttribute('data-action');

      if (action === 'open-reel') {
        e.preventDefault();
        window.openReelModal();
        return;
      }
      if (action === 'close-reel') {
        e.preventDefault();
        window.closeReelModal();
        return;
      }
      if (action === 'close-reel-backdrop') {
        if (e.target.id === 'reel-modal') {
          e.preventDefault();
          window.closeReelModal();
        }
        return;
      }
      if (action === 'close-member') {
        e.preventDefault();
        window.closeMemberDossier();
        return;
      }
      if (action === 'close-member-backdrop') {
        if (e.target.id === 'member-dossier-modal') {
          e.preventDefault();
          window.closeMemberDossier();
        }
        return;
      }
      if (action === 'prev-member') {
        e.preventDefault();
        window.navigateDossier(-1);
        return;
      }
      if (action === 'next-member') {
        e.preventDefault();
        window.navigateDossier(1);
        return;
      }
      if (action === 'open-member') {
        e.preventDefault();
        var memberIdx = actionEl.getAttribute('data-member-index');
        var memberId = actionEl.getAttribute('data-id');
        if (memberIdx !== null) {
          window.openMemberDossier(parseInt(memberIdx, 10));
        } else if (memberId !== null) {
          window.openMemberDossier(parseInt(memberId, 10));
        }
        return;
      }
      if (action === 'close-wire') {
        e.preventDefault();
        window.closeWirePhoto();
        return;
      }
      if (action === 'close-wire-backdrop') {
        if (e.target.id === 'wire-photo-modal') {
          e.preventDefault();
          window.closeWirePhoto();
        }
        return;
      }
      if (action === 'prev-wire') {
        e.preventDefault();
        window.navigateWire(-1);
        return;
      }
      if (action === 'next-wire') {
        e.preventDefault();
        window.navigateWire(1);
        return;
      }
      if (action === 'open-wire') {
        e.preventDefault();
        var wireIdx = actionEl.getAttribute('data-wire-index');
        if (wireIdx !== null) {
          window.openWirePhoto(parseInt(wireIdx, 10));
        }
        return;
      }
      if (action === 'open-apply') {
        e.preventDefault();
        window.openApplyModal();
        return;
      }
      if (action === 'close-apply') {
        e.preventDefault();
        window.closeApplyModal();
        return;
      }
      if (action === 'close-apply-backdrop') {
        if (e.target.id === 'apply-modal') {
          e.preventDefault();
          window.closeApplyModal();
        }
        return;
      }
      if (action === 'open-pitch') {
        e.preventDefault();
        window.openPitchModal();
        return;
      }
      if (action === 'close-pitch') {
        e.preventDefault();
        window.closePitchModal();
        return;
      }
      if (action === 'close-pitch-backdrop') {
        if (e.target.id === 'pitch-modal') {
          e.preventDefault();
          window.closePitchModal();
        }
        return;
      }
    }
  });

  // Story pitch form submission
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'pitch-story-form') {
      e.preventDefault();
      alert('Story pitch transmitted to the Editor-in-Chief.');
      window.closePitchModal();
    }
  });

  /* ========================================================
   * 6. KEYBOARD NAVIGATION & DISMISSAL (Escape & Arrows)
   * ======================================================== */
  window.addEventListener('keydown', function (e) {
    var memberModal = document.getElementById('member-dossier-modal');
    if (memberModal && !memberModal.classList.contains('hidden')) {
      if (e.key === 'Escape') { window.closeMemberDossier(); return; }
      if (e.key === 'ArrowRight') { window.navigateDossier(1); return; }
      if (e.key === 'ArrowLeft') { window.navigateDossier(-1); return; }
    }
    var wireModal = document.getElementById('wire-photo-modal');
    if (wireModal && !wireModal.classList.contains('hidden')) {
      if (e.key === 'Escape') { window.closeWirePhoto(); return; }
      if (e.key === 'ArrowRight') { window.navigateWire(1); return; }
      if (e.key === 'ArrowLeft') { window.navigateWire(-1); return; }
    }
    var reelModal = document.getElementById('reel-modal');
    if (reelModal && !reelModal.classList.contains('hidden')) {
      if (e.key === 'Escape') { window.closeReelModal(); return; }
    }
    var applyModal = document.getElementById('apply-modal');
    if (applyModal && !applyModal.classList.contains('hidden')) {
      if (e.key === 'Escape') { window.closeApplyModal(); return; }
    }
    var pitchModal = document.getElementById('pitch-modal');
    if (pitchModal && !pitchModal.classList.contains('hidden')) {
      if (e.key === 'Escape') { window.closePitchModal(); return; }
    }
    if (e.key === 'Escape' && typeof window.isDrawerOpen === 'function' && window.isDrawerOpen()) {
      if (typeof window.closeDrawer === 'function') {
        window.closeDrawer();
      }
      return;
    }
  });
})();
