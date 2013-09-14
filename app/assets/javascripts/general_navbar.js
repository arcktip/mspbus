function update_coordinates(){
  window.location.href="/";
}

function geocode(address){
  window.location.href="/?q="+encodeURIComponent(address);
  return;
}

var navbar_view;
$(document).ready(function() {
  navbar_view = new NavbarView({ page: 'general_navbar' });
});
