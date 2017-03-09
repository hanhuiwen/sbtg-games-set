
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
  if (id=="to_tick") {
    window.location.href += "tick-tack-toe.html";
  } else if (id=="set_english") {
    say("ok", function () { setLanguage("English"); });
  } else if (id=="set_japanese") {
    say("ok", function () { setLanguage("Japanese"); });
  }
}

function say (sentence, callback) {
  $.getService("ALAnimatedSpeech", function(tts) {
    tts.say(sentence).done(callback)
  });
}

function setLanguage(language) {
  $.getService("ALTextToSpeech", function(tts) {
    tts.setLanguage(language).done(function () {
      if (language=="English") {
        say("I am now talking in English", function() {$("#back_to_main").click()});
      } else {
        say("今から日本語をしゃべります。", function() {$("#back_to_main").click()});
      }
    });
  });
  $.getService("ALSpeechRecognition", function(asr) {
    asr.setLanguage(language);
  });
  $.getService("ALDialog", function(dialog) {
    dialog.setLanguage(language);
  });
}

$(function () {
  $("body").on("click", ".btn", onButtonClick);
  $("#openFrame").addClass("hidden");
  $("#main_menu").removeClass("hidden");
});