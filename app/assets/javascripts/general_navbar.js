function update_coordinates(){
  window.location.href="/";
}

function geocode(address){
  window.location.href="/?q="+address.replace(/ /g,"+");
  return;
}

$(document).ready(function() {
  $('.btn-current-location').on('click', update_coordinates);
  $("#q").on("keypress", function(e) { if (e.which == 13) geocode($("#q").val()); });
  $("#qsub").click(function() { geocode($("#q").val()); });
});
