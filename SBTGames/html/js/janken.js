var userChoice = null;
var started = false;
var naoChoice = null;
var quitting = false;
var is_draw = false;

var choices = ["jk_stone", "jk_scissors", "jk_paper"];

var reactions = {
    "intro": [ //1
        "Let's play Janken! \\pau=800\\ You can choose your move on the tablet when I say \\pau=500\\ jan ken pow. \\pau=800\\ I promise I won't look at your choice. \\pau=800\\ If it's a draw, we will repeat until someone wins. \\pau=800\\ Let's start!"
    ],
    "janken": [ // 1
        "\\rspd=80\\ sigh showa goo \\pau=800\\ jan \\pau=800\\ ken \\pau=800\\ \\vct=120\\ po!"
    ],
    "aiko": [ // 1
        "\\rspd=80\\ I cow desho"
    ],
    "win": [ // 5
        "I win! ^run(animations/Stand/Emotions/Positive/Winner_1)",
        "Yes! I win! ^run(animations/Stand/Emotions/Positive/Winner_2)"
    ],
    "lose": [ // 4
        "wow! ^start(animations/Stand/Emotions/Positive/Excited_1) Congratulations! You win! ^wait(animations/Stand/Emotions/Positive/Excited_1)"
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
    $("#ttt_play_again").addClass("hidden");
    $("#jk_main").removeClass("hidden");
    $(".jk_choice").removeClass("jk_selected");
    userChoice = null;
    started = true;
    naoChoice = choices[randRange(0, 3)];
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
        console.log("too slow!");
        tryAgainQuestion();
    } else if (userChoice == naoChoice) {
        is_draw = true;
        playReaction("draw", main);
    } else if (userWin(userChoice, naoChoice)) {
        playReaction("lose", tryAgainQuestion);
    } else {
        playReaction("win", tryAgainQuestion);
    }
}

function userWin(user, nao) {
    // draw was checked before call to this function!
    if (user == "jk_stone" && nao == "jk_scissors") {
        return true;
    } else if (user == "jk_scissors" && nao == "jk_paper") {
        return true;
    } else if (user == "jk_paper" && nao == "jk_stone") {
        return true;
    } else {
        return false;
    }
}

function draw () {
    userChoice = null;
    naoChoice = choices[randRange(0, 3)];
    // anim: ai ko desho => back to check result
}

function win () {
    // say: you win!
    // then go to "again"
}

function lose () {
    // say: you lose!
    // then go to "again"
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
    playReaction("play_again_question");
}

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