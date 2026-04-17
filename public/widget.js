(function () {
  'use strict';

  var scriptTag = document.currentScript;
  if (!scriptTag) return;

  var slug = scriptTag.getAttribute('data-widget-slug');
  if (!slug) {
    console.error('ProofEngine: Missing data-widget-slug attribute');
    return;
  }

  var baseUrl = scriptTag.src.replace(/\/widget\.js.*$/, '');

  var container = document.getElementById('proofengine-widget');
  if (!container) {
    container = document.createElement('div');
    container.id = 'proofengine-widget';
    scriptTag.parentNode.insertBefore(container, scriptTag);
  }

  var styleId = 'proofengine-styles';
  if (!document.getElementById(styleId)) {
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = '\n' +
      '#proofengine-widget {\n' +
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n' +
      '  position: relative;\n' +
      '  overflow: hidden;\n' +
      '}\n' +
      '.pk-track {\n' +
      '  display: flex;\n' +
      '  gap: 16px;\n' +
      '  overflow-x: auto;\n' +
      '  scroll-behavior: smooth;\n' +
      '  scrollbar-width: none;\n' +
      '  -ms-overflow-style: none;\n' +
      '  padding: 8px 0;\n' +
      '}\n' +
      '.pk-track::-webkit-scrollbar { display: none; }\n' +
      '.pk-card {\n' +
      '  flex: 0 0 320px;\n' +
      '  background: #ffffff;\n' +
      '  border: 1px solid #e2e8f0;\n' +
      '  border-radius: 16px;\n' +
      '  padding: 24px;\n' +
      '  box-shadow: 0 1px 3px rgba(0,0,0,0.08);\n' +
      '  transition: box-shadow 0.2s, transform 0.2s;\n' +
      '}\n' +
      '.pk-card:hover {\n' +
      '  box-shadow: 0 8px 25px rgba(0,0,0,0.1);\n' +
      '  transform: translateY(-2px);\n' +
      '}\n' +
      '.pk-dark .pk-card {\n' +
      '  background: #1e293b;\n' +
      '  border-color: #334155;\n' +
      '  color: #f1f5f9;\n' +
      '}\n' +
      '.pk-header {\n' +
      '  display: flex;\n' +
      '  align-items: center;\n' +
      '  gap: 12px;\n' +
      '  margin-bottom: 12px;\n' +
      '}\n' +
      '.pk-avatar {\n' +
      '  width: 40px;\n' +
      '  height: 40px;\n' +
      '  border-radius: 50%;\n' +
      '  background: linear-gradient(135deg, #8b5cf6, #6366f1);\n' +
      '  display: flex;\n' +
      '  align-items: center;\n' +
      '  justify-content: center;\n' +
      '  color: #fff;\n' +
      '  font-weight: 700;\n' +
      '  font-size: 14px;\n' +
      '  flex-shrink: 0;\n' +
      '}\n' +
      '.pk-avatar img {\n' +
      '  width: 100%;\n' +
      '  height: 100%;\n' +
      '  border-radius: 50%;\n' +
      '  object-fit: cover;\n' +
      '}\n' +
      '.pk-name {\n' +
      '  font-weight: 600;\n' +
      '  font-size: 14px;\n' +
      '  color: #1e293b;\n' +
      '  margin: 0;\n' +
      '}\n' +
      '.pk-dark .pk-name { color: #f1f5f9; }\n' +
      '.pk-role {\n' +
      '  font-size: 12px;\n' +
      '  color: #64748b;\n' +
      '  margin: 0;\n' +
      '}\n' +
      '.pk-dark .pk-role { color: #94a3b8; }\n' +
      '.pk-stars {\n' +
      '  display: flex;\n' +
      '  gap: 2px;\n' +
      '  margin-bottom: 8px;\n' +
      '}\n' +
      '.pk-star {\n' +
      '  width: 16px;\n' +
      '  height: 16px;\n' +
      '}\n' +
      '.pk-star-filled { color: #f59e0b; }\n' +
      '.pk-star-empty { color: #cbd5e1; }\n' +
      '.pk-dark .pk-star-empty { color: #475569; }\n' +
      '.pk-body {\n' +
      '  font-size: 14px;\n' +
      '  line-height: 1.6;\n' +
      '  color: #334155;\n' +
      '  margin: 0;\n' +
      '}\n' +
      '.pk-dark .pk-body { color: #cbd5e1; }\n' +
      '.pk-badge {\n' +
      '  text-align: right;\n' +
      '  margin-top: 12px;\n' +
      '  padding-top: 8px;\n' +
      '}\n' +
      '.pk-badge a {\n' +
      '  font-size: 11px;\n' +
      '  color: #94a3b8;\n' +
      '  text-decoration: none;\n' +
      '  transition: color 0.2s;\n' +
      '}\n' +
      '.pk-badge a:hover { color: #8b5cf6; }\n' +
      '.pk-empty {\n' +
      '  text-align: center;\n' +
      '  padding: 32px;\n' +
      '  color: #94a3b8;\n' +
      '  font-size: 14px;\n' +
      '}\n';
    document.head.appendChild(style);
  }

  var starSvg = '<svg viewBox="0 0 20 20" fill="currentColor" class="pk-star"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';

  function renderStars(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<span class="' + (i <= rating ? 'pk-star-filled' : 'pk-star-empty') + '">' + starSvg + '</span>';
    }
    return html;
  }

  function renderCard(t) {
    var initials = t.author_name.charAt(0).toUpperCase();
    var avatarContent = t.author_avatar_url
      ? '<img src="' + t.author_avatar_url + '" alt="' + t.author_name + '">'
      : initials;

    var roleText = '';
    if (t.author_role) {
      roleText = t.author_role;
      if (t.author_company) roleText += ' at ' + t.author_company;
    } else if (t.author_company) {
      roleText = t.author_company;
    }

    return '<div class="pk-card">' +
      '<div class="pk-header">' +
        '<div class="pk-avatar">' + avatarContent + '</div>' +
        '<div>' +
          '<p class="pk-name">' + t.author_name + '</p>' +
          (roleText ? '<p class="pk-role">' + roleText + '</p>' : '') +
        '</div>' +
      '</div>' +
      '<div class="pk-stars">' + renderStars(t.rating) + '</div>' +
      '<p class="pk-body">' + t.body + '</p>' +
    '</div>';
  }

  fetch(baseUrl + '/api/embed/' + slug + '/testimonials')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var testimonials = data.testimonials || [];
      var widget = data.widget || {};

      if (testimonials.length === 0) {
        container.innerHTML = '<div class="pk-empty">No testimonials yet</div>';
        return;
      }

      if (widget.theme === 'dark') {
        container.classList.add('pk-dark');
      }

      var trackHtml = '<div class="pk-track">';
      for (var i = 0; i < testimonials.length; i++) {
        trackHtml += renderCard(testimonials[i]);
      }
      trackHtml += '</div>';

      if (widget.show_badge) {
        trackHtml += '<div class="pk-badge"><a href="https://proofengine.io" target="_blank" rel="noopener">Powered by ProofEngine</a></div>';
      }

      container.innerHTML = trackHtml;

      // Auto-scroll
      var track = container.querySelector('.pk-track');
      if (!track || testimonials.length <= 1) return;

      var paused = false;
      track.addEventListener('mouseenter', function () { paused = true; });
      track.addEventListener('mouseleave', function () { paused = false; });

      setInterval(function () {
        if (paused) return;
        var maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 10) {
          track.scrollLeft = 0;
        } else {
          track.scrollLeft += 340;
        }
      }, 4000);
    })
    .catch(function (err) {
      console.error('ProofEngine: Failed to load testimonials', err);
    });
})();
