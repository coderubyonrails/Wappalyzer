/**
 * Bookmarklet driver
 */

/** global: wappalyzer */
/** global: XMLHttpRequest */

(function() {
	const container = document.getElementById('wappalyzer-container');
	const domain = top.location.host;
	const url = top.location.href.replace(/#.*$/, '');
	const hasOwn = Object.prototype.hasOwnProperty;

  /**
   * Log messages to console
   */
  wappalyzer.driver.log = (message, source, type) => {
    console.log('[wappalyzer ' + type + ']', '[' + source + ']', message);
  };

  function getEnvironmentVars() {
    wappalyzer.log('func: getEnvironmentVars');

    var env = [];

    for ( let i in window ) {
      env.push(i);
    }

    wappalyzer.analyze(domain, url, {
      html: document.documentElement.innerHTML,
      env: env
    });
  }

	function getResponseHeaders() {
    wappalyzer.log('func: getResponseHeaders');

    var xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    xhr.onreadystatechange = () => {
      if ( xhr.readyState === 4 && xhr.status ) {
        var headers = xhr.getAllResponseHeaders().split("\n");

        if ( headers.length > 0 && headers[0] != '' ) {
          wappalyzer.log('responseHeaders: ' + xhr.getAllResponseHeaders());

          var responseHeaders = {};

          headers.forEach(line => {
            var name, value;

            if ( line ) {
              name  = line.substring(0, line.indexOf(': '));
              value = line.substring(line.indexOf(': ') + 2, line.length - 1);

              responseHeaders[name.toLowerCase()] = value;
            }
          });

          wappalyzer.analyze(domain, url, {
            headers: responseHeaders
          });
        }
      }
    }

    xhr.send();
  }

  /**
   * Display apps
   */
  wappalyzer.driver.displayApps = detected => {
    wappalyzer.log('func: diplayApps');

    var first = true;
    var app;
    var category;
    var html;

    html =
      '<a id="wappalyzer-close" href="javascript: document.body.removeChild(document.getElementById(\'wappalyzer-container\')); void(0);">' +
        'Close' +
      '</a>' +
      '<div id="wappalyzer-apps">';

    if ( detected != null && Object.keys(detected).length ) {
      for ( app in detected ) {
        if ( !hasOwn.call(detected, app) ) {
          continue;
        }

        html +=
          '<div class="wappalyzer-app' + ( first ? ' wappalyzer-first' : '' ) + '">' +
            '<a target="_blank" class="wappalyzer-application" href="' + wappalyzer.config.websiteURL + 'applications/' + app.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '') + '">' +
              '<strong>' +
                '<img src="' + wappalyzer.config.websiteURL + 'images/icons/' + (wappalyzer.apps[app].icon || 'default.svg') + '" width="16" height="16"/> ' + app +
              '</strong>' +
            '</a>';

        for ( let i in wappalyzer.apps[app].cats ) {
          if ( !hasOwn.call(wappalyzer.apps[app].cats, i) ) {
            continue;
          }

          category = wappalyzer.categories[wappalyzer.apps[app].cats[i]].name;

          html += '<a target="_blank" class="wappalyzer-category" href="' + wappalyzer.config.websiteURL + 'categories/' + slugify(category) + '">' + category + '</a>';
        }

        html += '</div>';

        first = false;
      }
    } else {
      html += '<div id="wappalyzer-empty">No applications detected</div>';
    }

    html += '</div>';

    container.innerHTML = html;
  },

  /**
   * Open a tab
   */
  function openTab(args) {
    open(args.url);
  }

  function slugify(string) {
    return string.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/(?:^-|-$)/, '');
  }

  getEnvironmentVars();
  getResponseHeaders();
})();
