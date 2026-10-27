/**
 * ui.js
 * Ambient dynamic UI effects and micro-interactions:
 * - Developer Credit & Contact Configuration
 * - Fluid ambient cursor spotlight (#mouse-spotlight)
 * - Hero simulated cinema timecode (#hero-timecode)
 * - Footer live IST timecode clock (#footer-ist-clock)
 * - Developer contact modal dialog (#devcredit-modal)
 * 
 * Depends on: drawer.js (window.isDrawerOpen, window.closeDrawer)
 */

/**
 * Site Social Media Configuration
 * Central spot for all social URLs across footer, drawer, and headers.
 * To update links, edit the URLs below:
 * - instagram: Official Instagram profile
 * - linkedin: Official LinkedIn company page
 * - facebook: Official Facebook page (replace placeholder below)
 * - youtube: Official YouTube channel (replace placeholder below)
 */
var SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/the.mediamovers",
  linkedin: "https://www.linkedin.com/company/the-mediamovers/",
  facebook: "https://www.facebook.com/share/1dSwG1qExq/",
  youtube: "https://youtube.com/@themediamovers?si=DGe6j4XrNwGvfbUf"
};

/**
 * Developer Credit & Contact Configuration
 * All details live in this single config object for easy editing.
 * If a value is empty or "#", that contact link row is automatically hidden.
 */
var DEVELOPER_CONFIG = {
  name: "Aniruddha Sahu",
  role: "Full Stack Developer",
  email: "aniruddhasahu2007@gmail.com",
  linkedin: "https://www.linkedin.com/in/aniruddha-sahu-976385375?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  github: "https://github.com/aniruddhasahu2007"
};

(function () {
  var lastFocusedDevCreditTrigger = null;

  function syncDeveloperConfig() {
    var name = (DEVELOPER_CONFIG && DEVELOPER_CONFIG.name) ? DEVELOPER_CONFIG.name : "Aniruddha Sahu";
    document.querySelectorAll('.devcredit-name').forEach(function (el) {
      el.textContent = name;
    });

    var titleEl = document.getElementById('devcredit-title');
    if (titleEl) titleEl.textContent = name;

    var initialsEl = document.getElementById('devcredit-initials');
    if (initialsEl) {
      var parts = name.trim().split(/\s+/);
      var initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]) : parts[0].slice(0, 2);
      initialsEl.textContent = initials.toUpperCase();
    }

    var roleEl = document.getElementById('devcredit-role');
    if (roleEl) {
      if (DEVELOPER_CONFIG && DEVELOPER_CONFIG.role) {
        roleEl.textContent = DEVELOPER_CONFIG.role;
        roleEl.classList.remove('hidden');
      } else {
        roleEl.classList.add('hidden');
      }
    }

    // Email link
    var emailLink = document.getElementById('devcredit-link-email');
    var emailVal = document.getElementById('devcredit-val-email');
    if (emailLink) {
      var email = DEVELOPER_CONFIG && DEVELOPER_CONFIG.email;
      if (email && email !== '#' && email.trim() !== '') {
        emailLink.href = 'mailto:' + email.trim();
        if (emailVal) emailVal.textContent = email.trim();
        emailLink.classList.remove('hidden');
      } else {
        emailLink.classList.add('hidden');
      }
    }

    // LinkedIn link
    var linkedinLink = document.getElementById('devcredit-link-linkedin');
    if (linkedinLink) {
      var linkedin = DEVELOPER_CONFIG && DEVELOPER_CONFIG.linkedin;
      if (linkedin && linkedin !== '#' && linkedin.trim() !== '') {
        linkedinLink.href = linkedin.trim();
        linkedinLink.classList.remove('hidden');
      } else {
        linkedinLink.classList.add('hidden');
      }
    }

    // GitHub link
    var githubLink = document.getElementById('devcredit-link-github');
    var githubVal = document.getElementById('devcredit-val-github');
    if (githubLink) {
      var github = DEVELOPER_CONFIG && DEVELOPER_CONFIG.github;
      if (github && github !== '#' && github.trim() !== '') {
        githubLink.href = github.trim();
        if (githubVal) {
          try {
            var parsed = new URL(github.trim());
            githubVal.textContent = (parsed.hostname + parsed.pathname).replace(/\/$/, '');
          } catch (_) {
            githubVal.textContent = github.trim();
          }
        }
        githubLink.classList.remove('hidden');
      } else {
        githubLink.classList.add('hidden');
      }
    }
  }

  function openDevCreditModal(triggerEl) {
    lastFocusedDevCreditTrigger = triggerEl || document.activeElement;
    var drawerWasOpen = false;
    if (typeof window.isDrawerOpen === 'function' && window.isDrawerOpen()) {
      drawerWasOpen = true;
      if (typeof window.closeDrawer === 'function') {
        window.closeDrawer();
      }
    }

    var showModal = function () {
      var modal = document.getElementById('devcredit-modal');
      var card = document.getElementById('devcredit-card');
      if (!modal || !card) return;

      syncDeveloperConfig();
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(function () {
        modal.classList.remove('opacity-0');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
      });

      var closeBtn = modal.querySelector('.devcredit-close-btn');
      if (closeBtn) {
        setTimeout(function () { closeBtn.focus(); }, 60);
      }
    };

    if (drawerWasOpen) {
      setTimeout(showModal, 220);
    } else {
      showModal();
    }
  }

  function closeDevCreditModal() {
    var modal = document.getElementById('devcredit-modal');
    var card = document.getElementById('devcredit-card');
    if (!modal || !card || modal.classList.contains('hidden')) return;

    modal.classList.add('opacity-0');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');

    setTimeout(function () {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      if (lastFocusedDevCreditTrigger && typeof lastFocusedDevCreditTrigger.focus === 'function') {
        try { lastFocusedDevCreditTrigger.focus(); } catch (_) {}
      }
    }, 250);
  }

  function initDevCredit() {
    syncDeveloperConfig();

    document.addEventListener('click', function (e) {
      var openBtn = e.target.closest('[data-action="open-dev-credit"]');
      if (openBtn) {
        e.preventDefault();
        openDevCreditModal(openBtn);
        return;
      }
      var closeBtn = e.target.closest('[data-action="close-devcredit"]');
      if (closeBtn) {
        e.preventDefault();
        closeDevCreditModal();
        return;
      }
      var backdrop = e.target.closest('[data-action="close-devcredit-backdrop"]');
      if (backdrop && e.target === backdrop) {
        e.preventDefault();
        closeDevCreditModal();
        return;
      }
    });

    // Escape listener: capture phase prioritizes closing this modal first
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var modal = document.getElementById('devcredit-modal');
        if (modal && !modal.classList.contains('hidden')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          closeDevCreditModal();
        }
      }
    }, true);

    // Focus trap inside devcredit-modal
    var modal = document.getElementById('devcredit-modal');
    if (modal) {
      modal.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var focusables = modal.querySelectorAll('a[href]:not(.hidden), button:not([disabled]):not(.hidden)');
        if (!focusables || !focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    }
  }

  function initSpotlight() {
    var spotlight = document.getElementById('mouse-spotlight');
    if (spotlight && window.matchMedia('(pointer: fine)').matches) {
      var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
      var curX = mouseX, curY = mouseY, isMoving = false;

      window.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isMoving) {
          spotlight.style.opacity = '1';
          isMoving = true;
        }
      });

      (function animate() {
        curX += (mouseX - curX) * 0.12;
        curY += (mouseY - curY) * 0.12;
        spotlight.style.transform = 'translate3d(' + curX + 'px, ' + curY + 'px, 0) translate(-50%, -50%)';
        requestAnimationFrame(animate);
      })();
    }
  }

  function initTimecode() {
    var timecodeEl = document.getElementById('hero-timecode');
    if (timecodeEl) {
      var frame = 4, sec = 18, min = 24;
      setInterval(function () {
        frame++;
        if (frame >= 24) {
          frame = 0;
          sec++;
          if (sec >= 60) {
            sec = 0;
            min = (min + 1) % 60;
          }
        }
        var pad = function (n) { return String(n).padStart(2, '0'); };
        timecodeEl.textContent = '00:' + pad(min) + ':' + pad(sec) + ':' + pad(frame);
      }, 1000 / 24);
    }
  }

  function initFooterClock() {
    var footerClock = document.getElementById('footer-ist-clock');
    if (footerClock) {
      var updateTime = function () {
        try {
          var now = new Date();
          var options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
          footerClock.textContent = new Intl.DateTimeFormat('en-GB', options).format(now);
        } catch (e) {
          footerClock.textContent = '20:41';
        }
      };
      updateTime();
      setInterval(updateTime, 10000);
    }
  }

  function syncSocialLinks() {
    var links = (typeof SOCIAL_LINKS !== 'undefined') ? SOCIAL_LINKS : (window.SOCIAL_LINKS || {});
    Object.keys(links).forEach(function (platform) {
      var rawUrl = links[platform];
      var isValid = typeof rawUrl === 'string' && rawUrl.trim() !== '' && rawUrl.trim() !== '#';
      var cleanUrl = isValid ? rawUrl.trim() : '';

      document.querySelectorAll('a[data-social="' + platform + '"]').forEach(function (link) {
        if (cleanUrl) {
          link.href = cleanUrl;
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
          link.classList.remove('hidden');
          link.style.display = '';
        } else {
          link.classList.add('hidden');
          link.style.display = 'none';
        }
      });
    });
  }

  function initUI() {
    syncSocialLinks();
    initDevCredit();
    initSpotlight();
    initTimecode();
    initFooterClock();
  }

  window.openDevCreditModal = openDevCreditModal;
  window.closeDevCreditModal = closeDevCreditModal;
  window.initUI = initUI;
})();
