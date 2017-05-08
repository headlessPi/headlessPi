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

  var closeLink = document.querySelector('#admin #header a');
  closeLink.addEventListener('click', function(e){
    document.querySelector('#admin iframe').src = '';
    document.querySelector('#admin').style.visibility = 'hidden';
    e.preventDefault();
    return false;
  });
}

document.addEventListener("DOMContentLoaded", setupLinks);