// From https://github.com/neovov/Fullscreen-API-Polyfill
!function(a){"use strict";function b(b,c){var d=a.createEvent("Event");d.initEvent(b,!0,!1),c.dispatchEvent(d)}function c(c){a[i.enabled]=a[e.enabled],a[i.element]=a[e.element],b(i.events.change,c.target)}function d(a){b(i.events.error,a.target)}var e,f,g=!0,h={w3:{enabled:"fullscreenEnabled",element:"fullscreenElement",request:"requestFullscreen",exit:"exitFullscreen",events:{change:"fullscreenchange",error:"fullscreenerror"}},webkit:{enabled:"webkitIsFullScreen",element:"webkitCurrentFullScreenElement",request:"webkitRequestFullScreen",exit:"webkitCancelFullScreen",events:{change:"webkitfullscreenchange",error:"webkitfullscreenerror"}},moz:{enabled:"mozFullScreenEnabled",element:"mozFullScreenElement",request:"mozRequestFullScreen",exit:"mozCancelFullScreen",events:{change:"mozfullscreenchange",error:"mozfullscreenerror"}},ms:{enabled:"msFullscreenEnabled",element:"msFullscreenElement",request:"msRequestFullscreen",exit:"msExitFullscreen",events:{change:"MSFullscreenChange",error:"MSFullscreenError"}}},i=h.w3;for(f in h)if(h[f].enabled in a){e=h[f];break}return!g||i.enabled in a||!e||(a.addEventListener(e.events.change,c,!1),a.addEventListener(e.events.error,d,!1),a[i.enabled]=a[e.enabled],a[i.element]=a[e.element],a[i.exit]=a[e.exit],Element.prototype[i.request]=function(){return this[e.request].apply(this,arguments)}),e}(document);

function setupLinks(){
  var adminAppClickHandler = function(e){
    var path = e.target.pathname;
    document.querySelector('#admin iframe').src = '/a' + path;
    e.preventDefault();
    return false;
  }

  var adminLinks = document.querySelectorAll('#adminAppList a');
  for(var i=0; i<adminLinks.length; i++){
    adminLinks[i].addEventListener('click', adminAppClickHandler);
  }

  var adminLink = document.getElementById('adminLink');
  adminLink.addEventListener('click', function(e){
    document.querySelector('#admin').style.visibility = 'visible';
    e.preventDefault();
    return false;
  });

  var fullscreenLink = document.getElementById('fullscreen');
  fullscreenLink.addEventListener('click', function(e){
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    e.preventDefault();
    return false;
  });

  var placeholderClickHandler = function(e){
    var link = (e.target.nodeName === 'DIV' ? e.target.querySelector('a') : e.target);
    if(link.hash){
      var app = link.hash.replace('#', '');
      document.querySelector('#admin').style.visibility = 'visible';
      document.querySelector('#admin iframe').src = '/a/' + app;
    }
    e.preventDefault();
    return false;
  }

  var placeholders = document.querySelectorAll('.placeholder.admin');
  for(var i=0; i<placeholders.length; i++){
    placeholders[i].addEventListener('click', placeholderClickHandler);
  }

  var closeLink = document.querySelector('#admin #header a');
  closeLink.addEventListener('click', function(e){
    document.querySelector('#admin iframe').src = '';
    document.querySelector('#admin').style.visibility = 'hidden';
    e.preventDefault();
    return false;
  });
}

document.addEventListener("DOMContentLoaded", setupLinks);
