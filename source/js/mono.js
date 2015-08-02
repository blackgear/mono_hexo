(function(document, location) {
  var $ua = navigator.userAgent,
      $isChromeForIOS = $ua.indexOf(' CriOS/') > -1,
      $hasTouch = 'createTouch' in document,
      $currentLocationWithoutHash,
      $urlToPreload,
      $preloadTimer,
      $lastTouchTimestamp,
      $history = {},
      $xhr,
      $url = false,
      $title = false,
      $mustRedirect = false,
      $body = false,
      $timing = {},
      $isPreloading = false,
      $isWaitingForCompletion = false,
      $delayBeforePreload;

  function removeHash(url) {
    var index = url.indexOf('#');
    if (index < 0) {
      return url;
    }
    return url.substr(0, index);
  }

  function getLinkTarget(target) {
    while (target && target.nodeName != 'A') {
      target = target.parentNode;
    }
    return target;
  }

  function isPreloadable(a) {
    var domain = location.protocol + '//' + location.host;

    if (
      a.target || a.hasAttribute('download') || a.href.indexOf(domain + '/') !== 0 ||
      (a.href.indexOf('#') > -1 && removeHash(a.href) == $currentLocationWithoutHash)
       ) {
      return false;
    }
    return true;
  }

  function changePage(title, body, newUrl, scrollY) {
    document.documentElement.replaceChild(body, document.body);
    if (newUrl) {
      history.pushState(null, null, newUrl);

      var hashIndex = newUrl.indexOf('#'),
          hashElem = hashIndex > -1 && document.getElementById(newUrl.substr(hashIndex + 1)),
          offset = 0;

      if (hashElem) {
        while (hashElem.offsetParent) {
          offset += hashElem.offsetTop;
          hashElem = hashElem.offsetParent;
        }
      }
      scrollTo(0, offset);

      $currentLocationWithoutHash = removeHash(newUrl);
    }
    else {
      scrollTo(0, scrollY);
    }

    if ($isChromeForIOS && document.title == title) {
      document.title = title + String.fromCharCode(160);
    }
    else {
      document.title = title;
    }

    instantanize();
  }

  function setPreloadingAsHalted() {
    $isPreloading = false;
    $isWaitingForCompletion = false;
  }

  function removeNoscriptTags(html) {
    return html.replace(/<noscript[\s\S]+<\/noscript>/gi, '');
  }

  function mousedown(e) {
    if ($lastTouchTimestamp > (+new Date() - 500)) {
      return;
    }

    var a = getLinkTarget(e.target);

    if (!a || !isPreloadable(a)) {
      return;
    }

    preload(a.href);
  }

  function mouseover(e) {
    if ($lastTouchTimestamp > (+new Date() - 500)) {
      return;
    }

    var a = getLinkTarget(e.target);

    if (!a || !isPreloadable(a)) {
      return;
    }

    a.addEventListener('mouseout', mouseout);

    $urlToPreload = a.href;
    $preloadTimer = setTimeout(preload, $delayBeforePreload);
  }

  function touchstart(e) {
    $lastTouchTimestamp = +new Date();

    var a = getLinkTarget(e.target);

    if (!a || !isPreloadable(a)) {
      return;
    }

    a.removeEventListener('mouseover', mouseover);
    preload(a.href);
  }

  function click(e) {
    var a = getLinkTarget(e.target);

    if (!a || !isPreloadable(a)) {
      return;
    }

    if (e.which > 1 || e.metaKey || e.ctrlKey) {
      return;
    }
    e.preventDefault();
    display(a.href);
  }

  function mouseout() {
    if ($preloadTimer) {
      clearTimeout($preloadTimer);
      $preloadTimer = false;
      return;
    }

    if (!$isPreloading || $isWaitingForCompletion) {
      return;
    }
    $xhr.abort();
    setPreloadingAsHalted();
  }

  function readystatechange() {
    if ($xhr.readyState < 4) {
      return;
    }
    if ($xhr.status === 0) {
      return;
    }

    $timing.ready = +new Date() - $timing.start;

    if ($xhr.getResponseHeader('Content-Type').match(/\/(x|ht|xht)ml/)) {
      var doc = document.implementation.createHTMLDocument('');
      doc.documentElement.innerHTML = removeNoscriptTags($xhr.responseText);
      $title = doc.title;
      $body = doc.body;

      var urlWithoutHash = removeHash($url);
      $history[urlWithoutHash] = {
        body: $body,
        title: $title,
        scrollY: urlWithoutHash in $history ? $history[urlWithoutHash].scrollY : 0
      };
    }
    else {
      $mustRedirect = true;
    }

    if ($isWaitingForCompletion) {
      $isWaitingForCompletion = false;
      display($url);
    }
  }

  function instantanize(isInitializing) {
    document.body.addEventListener('touchstart', touchstart, true);
    document.body.addEventListener('mouseover', mouseover, true);
    document.body.addEventListener('click', click, true);
  }

  function preload(url) {
    if ('display' in $timing && +new Date() - ($timing.start + $timing.display) < 100) {
      return;
    }
    if ($preloadTimer) {
      clearTimeout($preloadTimer);
      $preloadTimer = false;
    }

    if (!url) {
      url = $urlToPreload;
    }

    if ($isPreloading && (url == $url || $isWaitingForCompletion)) {
      return;
    }
    $isPreloading = true;
    $isWaitingForCompletion = false;

    $url = url;
    $body = false;
    $mustRedirect = false;
    $timing = {
      start: +new Date()
    };
    $xhr.open('GET', url);
    $xhr.send();
  }

  function display(url) {
    if (!('display' in $timing)) {
      $timing.display = +new Date() - $timing.start;
    }
    if ($preloadTimer || !$isPreloading) {
      if ($preloadTimer && $url && $url != url) {
        location.href = url;
        return;
      }

      preload(url);
      $isWaitingForCompletion = true;
      return;
    }
    if ($isWaitingForCompletion) {
      location.href = url;
      return;
    }
    if ($mustRedirect) {
      location.href = $url;
      return;
    }
    if (!$body) {
      $isWaitingForCompletion = true;
      return;
    }
    $history[$currentLocationWithoutHash].scrollY = pageYOffset;
    setPreloadingAsHalted();
    changePage($title, $body, $url);
  }

  var supported = 'pushState' in history && (!$ua.match('Android') || $ua.match('Chrome/')) && location.protocol != "file:";

  function init() {
    if ($currentLocationWithoutHash) {
      return;
    }
    if (!supported) {
      return;
    }
    $currentLocationWithoutHash = removeHash(location.href);
    $history[$currentLocationWithoutHash] = {
      body: document.body,
      title: document.title,
      scrollY: pageYOffset
    };

    $xhr = new XMLHttpRequest();
    $xhr.addEventListener('readystatechange', readystatechange);

    instantanize(true);

    addEventListener('popstate', function() {
      var loc = removeHash(location.href);
      if (loc == $currentLocationWithoutHash) {
        return;
      }

      if (!(loc in $history)) {
        location.href = location.href;
        return;
      }

      $history[$currentLocationWithoutHash].scrollY = pageYOffset;
      $currentLocationWithoutHash = loc;
      changePage($history[loc].title, $history[loc].body, false, $history[loc].scrollY);
    });
  }

  init();

})(document, location);
