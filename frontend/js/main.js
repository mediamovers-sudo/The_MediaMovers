/**
 * main.js
 * Application bootstrap controller.
 * On DOMContentLoaded:
 * 1. Fetches all page partials from /pages/*.html and injects them into <main id="app">
 *    as <div data-page="NAME" class="hidden">...</div>
 * 2. Fetches /partials/modals.html and injects into #modal-root
 * 3. Renders initial dynamic data and begins background API data hydration
 * 4. Initialises mobile drawer, ambient UI interactions, and application form
 * 5. Initialises hash router and triggers entrance reveal animations
 * 
 * Depends on: api.js, reveal.js, modals.js, drawer.js, ui.js, router.js
 */
document.addEventListener('DOMContentLoaded', async function () {
  var ROUTES = ['about', 'team', 'what-we-do', 'our-work', 'behind-the-scenes', 'join-collective'];
  var appEl = document.getElementById('app');
  var modalRoot = document.getElementById('modal-root');

  try {
    // 1. Fetch modals markup and inject into #modal-root
    var modalsPromise = fetch('/partials/modals.html')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load /partials/modals.html: ' + res.status);
        return res.text();
      })
      .then(function (html) {
        if (modalRoot) {
          modalRoot.innerHTML = html;
        }
      });

    // 2. Fetch all route page partials and inject into <main id="app"> in exact sequential order
    var pagesPromises = ROUTES.map(function (route) {
      return fetch('/pages/' + route + '.html')
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to load /pages/' + route + '.html: ' + res.status);
          return res.text();
        })
        .then(function (html) {
          return { route: route, html: html };
        });
    });

    // Wait for all partials to be loaded and attached to DOM in exact order
    var results = await Promise.all([modalsPromise, ...pagesPromises]);
    var pagesLoaded = results.slice(1);
    pagesLoaded.forEach(function (p) {
      if (!p) return;
      var pageDiv = document.createElement('div');
      pageDiv.setAttribute('data-page', p.route);
      pageDiv.className = 'hidden';
      pageDiv.innerHTML = p.html;
      if (appEl) {
        appEl.appendChild(pageDiv);
      }
    });
  } catch (err) {
    console.error('[MediaMovers] Error loading partials:', err);
  }

  // 3. Render initial fallback data into injected templates
  if (typeof window.renderMembers === 'function') {
    window.renderMembers();
  }
  if (typeof window.renderWirePhotos === 'function') {
    window.renderWirePhotos();
  }

  // 4. Fetch dynamic data from REST API endpoints (/api/members, /api/work-items, /api/wire-photos)
  if (typeof window.fetchDynamicPublicData === 'function') {
    window.fetchDynamicPublicData();
  }

  // 5. Initialise application form handler
  if (typeof window.initApplicationForm === 'function') {
    window.initApplicationForm();
  }

  // 6. Initialise UI components (spotlight, timecode, clock) and mobile drawer
  if (typeof window.initUI === 'function') {
    window.initUI();
  }
  if (typeof window.initDrawer === 'function') {
    window.initDrawer();
  }

  // 7. Initialise hash router (shows active route, updates nav active styles, re-triggers reveal animations)
  if (typeof window.initRouter === 'function') {
    window.initRouter();
  }
});
