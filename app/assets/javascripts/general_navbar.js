function update_coordinates(){
  window.location.href="/";
}

function geocode(address){
  window.location.href="/?q="+encodeURIComponent(address);
  return;
}

$(document).ready(function() {
  var navbar_view = new NavbarView({ page: 'general_navbar' });
});
