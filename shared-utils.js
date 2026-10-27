/**
 * Fabric8 Shared Utilities (shared-utils.js)
 * Centralized, battle-tested utilities for toast notifications, asset resolution,
 * and robust multi-step image fallback handling across Fabric8.
 */

(function(window) {
  'use strict';

  // 1. Toast Notification System
  window.showToast = function(message, type = 'success', duration = 6000) {
    if (typeof document === 'undefined') return;
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast-notice ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : type === 'info' ? 'toast-info' : ''}`;
    
    const msgEl = document.createElement('span');
    msgEl.style.whiteSpace = 'pre-line';
    msgEl.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close toast');
    closeBtn.onclick = function() {
      toast.style.opacity = '0';
      setTimeout(function() { toast.remove(); }, 300);
    };
    
    toast.appendChild(msgEl);
    toast.appendChild(closeBtn);
    container.appendChild(toast);
    
    if (duration > 0) {
      setTimeout(function() {
        if (toast && toast.parentElement) {
          toast.style.opacity = '0';
          setTimeout(function() { toast.remove(); }, 300);
        }
      }, duration);
    }
  };

  // 2. Asset URL Resolver
  window.resolveAssetUrl = function(url, defaultFallback) {
    const fallback = defaultFallback || '';
    if (!url) return fallback;
    let clean = String(url).trim().replace(/^["'&quot;]+|["'&quot;]+$/g, '').replace(/&quot;/g, '');
    if (!clean) return fallback;
    if (clean.indexOf('data:') === 0) return clean;

    // Remove repeated raw GitHub prefixes if present
    while (clean.indexOf('raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main/https://raw.githubusercontent.com') !== -1 ||
           clean.indexOf('raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main/http') !== -1) {
      clean = clean.replace(/https?:\/\/raw\.githubusercontent\.com\/lilyan-awsan\/Fabric8_website\/main\//g, '');
    }

    if (clean.indexOf('raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main/') !== -1) {
      return clean;
    }

    if (clean.indexOf('http://') === 0 || clean.indexOf('https://') === 0) {
      return clean;
    }

    clean = clean.replace(/^\/+/, '');
    return clean;
  };

  // 3. Robust Multi-Stage Image Fallback Handler
  window.handleImgError = function(img, fallbackSrc) {
    if (!img) return;

    const rawSrc = (img.getAttribute('src') || img.src || '').trim();
    if (!rawSrc || rawSrc.indexOf('data:') === 0 || rawSrc === window.location.href) {
      return;
    }

    // 3.1. Immediate backupSrc fallback
    if (img.dataset.backupSrc && img.src !== img.dataset.backupSrc) {
      img.src = img.dataset.backupSrc;
      img.style.visibility = 'visible';
      img.style.opacity = '1';
      return;
    }

    const retryCount = parseInt(img.dataset.retryCount || '0', 10);
    if (retryCount >= 3) {
      if (fallbackSrc && img.src !== fallbackSrc) {
        img.src = fallbackSrc;
        img.style.visibility = 'visible';
        img.style.opacity = '1';
      }
      return;
    }
    img.dataset.retryCount = (retryCount + 1).toString();

    let clean = rawSrc.replace(/^https?:\/\/[^\/]+\//, '');
    clean = clean.replace(/^(?:raw\.githubusercontent\.com\/)?(?:lilyan-awsan\/Fabric8_website\/main\/)+/, '');
    while (clean.indexOf('raw.githubusercontent.com') !== -1) {
      clean = clean.replace(/https?:\/\/raw\.githubusercontent\.com\/lilyan-awsan\/Fabric8_website\/main\//, '');
    }
    clean = clean.replace(/^\/+/, '');

    img.style.visibility = 'visible';
    img.style.opacity = '1';

    if (!clean || (clean.indexOf('assets/') !== 0 && clean.indexOf('site_images/') !== 0)) {
      if (fallbackSrc && img.src !== fallbackSrc) img.src = fallbackSrc;
      return;
    }

    const isLocal = typeof window !== 'undefined' &&
      (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const liveUrl = 'https://thefabric8.com/' + clean;
    const ghUrl = 'https://raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main/' + clean;

    if (retryCount === 0) {
      if (/\.png$/i.test(clean)) {
        img.src = clean.replace(/\.png$/i, '.webp');
        return;
      } else if (/\.webp$/i.test(clean)) {
        img.src = clean.replace(/\.webp$/i, '.png');
        return;
      }
      img.src = isLocal ? liveUrl : ghUrl;
    } else if (retryCount === 1) {
      if (img.src !== ghUrl && img.src.indexOf('raw.githubusercontent.com') === -1) {
        img.src = ghUrl;
      } else if (img.src !== liveUrl && img.src.indexOf('thefabric8.com') === -1) {
        img.src = liveUrl;
      } else if (fallbackSrc) {
        img.src = fallbackSrc;
      }
    } else if (fallbackSrc && img.src !== fallbackSrc) {
      img.src = fallbackSrc;
    }
  };

  // 4. Global Image Error Capture Listener
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('error', function(e) {
      if (e && e.target && e.target.tagName === 'IMG') {
        window.handleImgError(e.target);
      }
    }, true);
  }

})(window);
