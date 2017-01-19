
function onButtonClick (evt) {
  var $btn = $(evt.target);
  var id = $btn.attr("id");
  console.log(id);
  if (id=="back_to_main") {
    $btn.addClass("hidden");
    $(".view").addClass("hidden");
    $("#main_menu").removeClass("hidden");
  } else {
    $btn.parents(".view").addClass("hidden");
    $("#back_to_main").removeClass("hidden");
    if (id=="to_language") {
      $("#language_menu").removeClass("hidden");
    } else if (id=="to_games") {
      $("#games_menu").removeClass("hidden");
    }
  }
}

$(function () {
  $("body").on("click", ".btn", onButtonClick);
  $("#openFrame").addClass("hidden");
  $("#main_menu").removeClass("hidden");
});