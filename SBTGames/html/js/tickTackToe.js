
// 0 is empty, 1 is circle, 2 is cross
var gameGrid = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
];

// default score grid
var scoreGrid = [
    [1,0,1],
    [0,2,0],
    [1,0,1]
];

var texts = {
    "youStart": "You start!",
    "naoStart": "Nao starts!",
    "yourTurn": "Your turn",
    "naoTurn": "Nao's turn"
}

// Tick Tack Toe code

var whoseTurn = "user";
var started = false;

// difficulty is the change of a non-random move
// 0 means Nao plays at random
// 1 means Nao always follow the best move (not perfect though)
var difficulty = 0.9;

function getLine(index) {
    return gameGrid[index];
}

function getColumn(index) {
    return [gameGrid[0][index], gameGrid[1][index], gameGrid[2][index]];
}

function getDiagonal(index) {
    if (index==0) {
        return [gameGrid[0][0], gameGrid[1][1], gameGrid[2][2]];
    } else {
        return [gameGrid[2][0], gameGrid[1][1], gameGrid[0][2]];
    }
}

Array.prototype.allValuesSame = function() {

    for(var i = 1; i < this.length; i++)
    {
        if(this[i] !== this[0])
            return false;
    }

    return true;
}

function randRange(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function checkWin() {
    for (var i=0; i<3; i++) {
        if (getLine(i).allValuesSame() && getLine(i)[0] !=0 ) {
            return ["line", i];
        } else if (getColumn(i).allValuesSame() && getColumn(i)[0] != 0) {
            return ["column", i];
        } else if (i<2 && (getDiagonal(i).allValuesSame() && getDiagonal(i)[0] != 0)) {
            return ["diagonal", i];
        }
    }
}

function checkFull() {
    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            if (gameGrid[i][j] == 0) {
                return false;
            }
        }
    }
    return true;
}

function nextTurn() {
    if (started) {
        if (checkWin() != undefined) {
            if (whoseTurn == "user") {
                playReaction("lose");
            } else {
                playReaction("win");
            }
            // TODO: css animation!
            console.log(checkWin());
            started = false;
            return;
        } else if (checkFull()) {
            playReaction("draw");
            started = false;
            return;
        }
        whoseTurn = (whoseTurn == "user" ? "nao" : "user");
    }
    if (whoseTurn == "user") {
        if (!started) {
            $("h1").text(texts["youStart"]);
            started = true;
        } else {
            $("h1").text(texts["yourTurn"]);
        }
    } else {
        if (!started) {
            $("h1").text(texts["naoStart"]);
            started = true;
        } else {
            $("h1").text(texts["naoTurn"]);
        }
        if (Math.random() < probabilities.thinking) {
            playReaction("thinking", naoMove);
        } else {
            setTimeout(naoMove, 2000);
        }
    }
}

function naoMove() {
    var possibleMoves = [];
    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            if (gameGrid[i][j] == 0) {
                var score = scoreMove(i, j);
                possibleMoves.push([[i,j], score]);
            }
        }
    }
    possibleMoves.sort(function sortByScore (a, b) {
        return b[1] - a[1];
    });

    if (Math.random() < difficulty) {
        var move = possibleMoves[0];
    } else {
        var move = possibleMoves[randRange(0, possibleMoves.length)];
    }

    if (Math.random() < probabilities.preplay) {
        playReaction("preplay", function () {doMove(move);});
    } else {
        doMove(move);
    }
}

function doMove(move) {
    gameGrid[move[0][0]][move[0][1]] = 2;
    var id = "#" + move[0].join("");
    $(id).html('<img src="img/cross.png" />');
    nextTurn();
}

function scoreMove (i, j) {
    var score = scoreGrid[i][j];
    score += lineScore(getLine(i));
    score += lineScore(getColumn(j));
    if (i == j) {
        score += lineScore(getDiagonal(0));
    }
    if (i+j == 2) {
        score += lineScore(getDiagonal(1));
    }
    return score;
}

function lineScore (line) {
    var circles = 0;
    var crosses = 0;
    for (var i=0; i<3; i++) {
        if (line[i] == 1) {
            circles++;
        } else if (line[i] == 2) {
            crosses++;
        }
    }
    if (crosses == 2) {
        return 200;
    } else if (circles == 2) {
        return 30;
    } else if (crosses == 1 && circles == 0) {
        return 5;
    } else {
        return 0;
    }
}

function userClick (evt) {
    if (!started || whoseTurn != "user") {
        return;
    }
    var $target = $(evt.target).closest(".cell");
    var id = $target.attr("id");
    var i = parseInt(id[0]);
    var j = parseInt(id[1]);
    if (gameGrid[i][j]==0) {
        gameGrid[i][j] = 1;
        $target.empty();
        $target.html('<img src="img/circle.png" />');
        if (Math.random() < probabilities.postplay) {
            playReaction("postplay", nextTurn);
        } else {
            nextTurn();
        }
    }
}

// Nao code

var reactions = {
    "thinking": [ // 8
        "^start(animations/Stand/Waiting/Think_2) \\rspd=80\\ \\vct=90\\ hmmm. \\vct=110\\ Let me think ^wait(animations/Stand/Waiting/Think_2)",
        "^start(animations/Stand/Waiting/Think_3) \\rspd=80\\ \\vct=100\\ Maybe if I do this. \\pau=800\\ \\rspd=100\\ or perhaps that? ^wait(animations/Stand/Waiting/Think_3)"
    ],
    "postplay": [ // 6
        "I see. Nicely done!",
        "hmmm. That was unexpected!"
    ],
    "preplay": [ // 5
        "Aha! What do you say to that!",
        "\\rspd=50\\ \\vct=90\\ I choose, \\pau=700\\ \\rspd=130\\ \\vct=100\\ this one!"
    ],
    "win": [ // 5
        "I win! ^run(animations/Stand/Emotions/Positive/Winner_1)",
        "Yes! I win! ^run(animations/Stand/Emotions/Positive/Winner_2)"
    ],
    "lose": [ // 4
        "wow! ^start(animations/Stand/Emotions/Positive/Excited_1) Congratulations! ^wait(animations/Stand/Emotions/Positive/Excited_1)"
    ],
    "draw": [ // 2
        "we should try again to see who wins"
    ]
}

probabilities = {
    "thinking": 0.8,
    "postplay": 0.5,
    "preplay": 0.4
}

function playReaction (type, callback) {
    var reactionList = reactions[type];
    var reaction = reactionList[randRange(0, reactionList.length)];
    $.getService("ALAnimatedSpeech", function (tts) {
        tts.say(reaction).done(callback);
    });
}


$(function () {
    $("#grid").on("click", ".cell", userClick);
});