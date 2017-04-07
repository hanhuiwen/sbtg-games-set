var userChoice = null;
var started = false;
var naoChoice = null;
var quitting = false;
var is_draw = false;

var choices = ["jk_rock", "jk_scissors", "jk_paper"];

var reactions = {
    "intro": [ //1
        "Let's play Janken! \\pau=800\\ You can choose your move on the tablet when I am saying \\pau=300\\ jan ken pow. \\pau=800\\ I promise I will not look at your choice. \\pau=800\\ If it's a draw, we will repeat until someone wins. \\pau=800\\ Let's start!"
    ],
    "janken": [ // 1
        "^start(sbt-games/animations/janken) \\rspd=80\\ sigh showa goo \\pau=800\\ jan \\pau=800\\ ken \\pau=800\\ \\vct=120\\ pow! ^wait(sbt-games/animations/janken)"
    ],
    "aiko": [ // 1
        "^start(sbt-games/animations/janken_repeat) \\rspd=70\\ I \\pau=500\\ coal \\pau=500\\ de \\pau=500\\ sho ^wait(sbt-games/animations/janken_repeat)"
    ],
    "win": [ // 5
        "\\style=joyful\\ I win! ^run(animations/Stand/Emotions/Positive/Winner_1) \\style=neutral\\",
        "\\style=joyful\\ Yes! I win! ^run(animations/Stand/Emotions/Positive/Winner_2) \\style=neutral\\",
        "\\style=joyful\\ I win! Better luck next time! ^run(animations/Stand/Emotions/Positive/Happy_2) \\style=neutral\\",
        "\\style=joyful\\ oh yeah! I win ^run(animations/Stand/Emotions/Positive/Winner_1) \\style=neutral\\",
        "\\style=joyful\\ I am the winner! ^run(animations/Stand/Emotions/Positive/Happy_2) \\style=neutral\\"
    ],
    "lose": [ // 4
        "\\style=joyful\\ wow! ^start(animations/Stand/Emotions/Positive/Excited_1) Congratulations! You win! ^wait(animations/Stand/Emotions/Positive/Excited_1) \\style=neutral\\",
        "\\style=joyful\\ you win, champion! ^run(animations/Stand/Emotions/Positive/Happy_1) \\style=neutral\\",
        "\\style=joyful\\ you win! ^start(animations/Stand/Emotions/Positive/Excited_1) you are the best! ^wait(animations/Stand/Emotions/Positive/Excited_1) \\style=neutral\\",
        "\\style=joyful\\ ^start(animations/Stand/Emotions/Positive/Excited_1) you win! \\pau=600\\ you are really good at this! ^wait(animations/Stand/Emotions/Positive/Excited_1) \\style=neutral\\"
    ],
    "draw": [ // 1
        "It's a draw! Again!"
    ],
    "quit": [ // 1
        "that was fun! let's play again sometimes."
    ],
    "again": [ // 1
        "Ok, let's start again! Ready?"
    ],
    "play_again_question": [ // 1
        "do you want to play again?"
    ],
    "timeout": [ // 2?
        "you have to choose before I finish my saying jan ken pow."
    ],
    "jk_rock": [
        "I chose rock!"
    ],
    "jk_scissors": [
        "I chose scissors!"
    ],
    "jk_paper": [
        "I chose paper!"
    ]
}


function randRange(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function userClick (evt) {
    if(started) {
        userChoice = evt.target.id;
        $(".jk_choice").removeClass("jk_selected");
        $(evt.target).addClass("jk_selected");
    }
}

function main () {
    $(".view").addClass("hidden");
    $("#jk_main").removeClass("hidden");
    $(".jk_choice").removeClass("jk_selected");
    userChoice = null;
    started = true;
    naoChoice = choices[randRange(0, 3)];
    $.getService("ALMemory", function (memory) {
        memory.insertData("SBTGames/Janken/NaoChoice", naoChoice);
    });
    if (is_draw) {
        playReaction("aiko", checkResult);
    } else {
        playReaction("janken", checkResult);
    }
}

function checkResult () {
    started = false;
    is_draw = false;
    if (userChoice==null) {
        playReaction("timeout", tryAgainQuestion);
    } else {
        showResults();
        playReaction(naoChoice, function () {
            if (userChoice == naoChoice) {
                is_draw = true;
                playReaction("draw", main);
            } else if (userWin(userChoice, naoChoice)) {
                $("#jk_user_win").show()
                playReaction("lose", tryAgainQuestion);
            } else {
                $("#jk_nao_win").show()
                playReaction("win", tryAgainQuestion);
            }
        });
    }
}

function userWin(user, nao) {
    // draw was checked before call to this function!
    if (user == "jk_rock" && nao == "jk_scissors") {
        return true;
    } else if (user == "jk_scissors" && nao == "jk_paper") {
        return true;
    } else if (user == "jk_paper" && nao == "jk_rock") {
        return true;
    } else {
        return false;
    }
}

function showResults() {
    $("#jk_main").animateCss('fadeOut', function () {
        $(".view").addClass("hidden");
        $("#jk_user_choice").attr("class", "jk_choice " + userChoice);
        $("#jk_nao_choice").attr("class", "jk_choice " + naoChoice);
        $("#jk_result").removeClass("hidden");
        $("#jk_result").animateCss('fadeIn');
    });
}

function playReaction (type, callback) {
    if (quitting && type != "quit") {
        return;
    }
    var reactionList = reactions[type];
    var reaction = reactionList[randRange(0, reactionList.length)];
    // reinitialize to default just in case
    reaction = "\\vct=100\\ \\rspd=100\\" + reaction;
    $.getService("ALAnimatedSpeech", function (tts) {
        tts.say(reaction).done(callback);
    });
}

function stopTalking (callback) {
    $.getService("ALTextToSpeech", function (tts) {
        tts.stopAll().done(callback);
    })
}

function backToMenu() {
    var href_arr = window.location.href.split("/");
    href_arr.pop();
    window.location.href = href_arr.join("/");
}

function tryAgainQuestion() {
    $("#jk_main").addClass("hidden");
    $("#ttt_play_again").removeClass("hidden");
    $(".fixed_image").hide();
    playReaction("play_again_question");
}

$.fn.extend({
    animateCss: function (animationName, callback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
            if (callback != null) {
                callback(this);
            }
        });
    }
});

$(function () {
    $("#jk_main").on("click", ".jk_choice", userClick);
    $(".btn").on("click", function (event) {
        var id = event.target.id;
        if (id == "exit_game" || id == "ttt_quit") {
            console.log("quitting");
            quitting = true;
            stopTalking(function () {
                playReaction("quit", backToMenu);
            });
        } else if (id == "ttt_again") {
            playReaction("again", main);
        }
    });
    playReaction("intro", main);
});