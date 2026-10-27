/**
 * router.js
 * Hash-based client-side router for single-page view navigation.
 * Handles hash changes, view switching, active navigation styling, and instant scroll-to-top.
 * 
 * Depends on: reveal.js (window.resetRevealAnimations), drawer.js (window.isDrawerOpen, window.closeDrawer)
 */
(function () {
  var ROUTES = ['about', 'team', 'what-we-do', 'our-work', 'behind-the-scenes', 'join-collective'];
  var DEFAULT_ROUTE = 'about';
  var activeClasses = ['text-on-surface', 'border-b-2', 'border-primary-container'];
  var inactiveClasses = ['text-text-muted'];
  var currentRoute = '';

  function getRouteFromHash() {
    var rawHash = location.hash.replace(/^#\/?/, '').toLowerCase().trim();

    // Redirect legacy #/community bookmarks to #/team
    if (rawHash === 'community') {
      if (history.replaceState) {
        history.replaceState(null, '', '#/team');
      } else {
        location.hash = '#/team';
      }
      return 'team';
    }

    // Redirect legacy #/stories bookmarks to #/behind-the-scenes
    if (rawHash === 'stories') {
      if (history.replaceState) {
        history.replaceState(null, '', '#/behind-the-scenes');
      } else {
        location.hash = '#/behind-the-scenes';
      }
      return 'behind-the-scenes';
    }

    return ROUTES.indexOf(rawHash) !== -1 ? rawHash : DEFAULT_ROUTE;
  }

  function navigate(route) {
    if (route === 'community') {
      route = 'team';
      if (history.replaceState) {
        history.replaceState(null, '', '#/team');
      } else {
        location.hash = '#/team';
      }
    }

    if (route === 'stories') {
      route = 'behind-the-scenes';
      if (history.replaceState) {
        history.replaceState(null, '', '#/behind-the-scenes');
      } else {
        location.hash = '#/behind-the-scenes';
      }
    }

    if (route === currentRoute) return;
    currentRoute = route;

    // Show/hide page views
    var views = document.querySelectorAll('[data-page]');
    views.forEach(function (v) {
      if (v.dataset.page === route) {
        v.removeAttribute('hidden');
        v.classList.remove('hidden');
      } else {
        v.setAttribute('hidden', '');
        v.classList.add('hidden');
      }
    });

    // Scroll to top instantly
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Update nav active state (desktop navigation bar)
    document.querySelectorAll('[data-path]').forEach(function (link) {
      if (link.closest('#mobile-drawer')) return;
      var isActive = link.dataset.path === route;
      if (isActive) {
        link.setAttribute('aria-current', 'page');
        activeClasses.forEach(function (c) { link.classList.add(c); });
        inactiveClasses.forEach(function (c) { link.classList.remove(c); });
      } else {
        link.removeAttribute('aria-current');
        activeClasses.forEach(function (c) { link.classList.remove(c); });
        if (link.closest('nav[data-active-classes]')) {
          inactiveClasses.forEach(function (c) { link.classList.add(c); });
        }
      }
    });

    // Update mobile drawer nav active state
    document.querySelectorAll('#mobile-drawer .drawer-link').forEach(function (link) {
      if (link.dataset.path === route) {
        link.classList.add('text-on-surface');
        link.classList.remove('text-text-muted');
      } else {
        link.classList.remove('text-on-surface');
        link.classList.add('text-text-muted');
      }
    });

    // Re-trigger cinematic reveal entrance animations
    if (typeof window.resetRevealAnimations === 'function') {
      window.resetRevealAnimations(route);
    }
  }

  function initRouter() {
    var desktopNav = document.querySelector('nav[data-active-classes]');
    if (desktopNav && desktopNav.dataset.activeClasses) {
      activeClasses = desktopNav.dataset.activeClasses.split(' ');
    }

    // Wire all [data-path] navigation links
    document.querySelectorAll('[data-path]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var route = link.dataset.path;
        var drawerOpen = typeof window.isDrawerOpen === 'function' ? window.isDrawerOpen() : false;
        if (drawerOpen && typeof window.closeDrawer === 'function') {
          window.closeDrawer();
          setTimeout(function () { location.hash = '#/' + route; }, 80);
        } else {
          location.hash = '#/' + route;
        }
      });
    });

    window.addEventListener('hashchange', function () {
      navigate(getRouteFromHash());
    });

    // Initial navigation based on current URL hash or default route
    navigate(getRouteFromHash());
  }

  window.ROUTES = ROUTES;
  window.getRouteFromHash = getRouteFromHash;
  window.navigate = navigate;
  window.getCurrentRoute = function () { return currentRoute; };
  window.initRouter = initRouter;
})();
