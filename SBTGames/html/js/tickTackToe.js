
// 0 is empty, 1 is circle, 2 is cross
var gameGrid = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
];

var texts = {
    "youStart": "You start!",
    "naoStart": "Nao starts!",
    "yourTurn": "Your turn",
    "naoTurn": "Nao's turn"
}

var whoseTurn = "user";
var started = false;

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

function nextTurn() {
    if (started) {
        if (checkWin() != undefined) {
            console.log("someone won: " + whoseTurn);
            console.log(checkWin());
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
        setTimeout(naoMove, 2000);
    }
}

function naoMove() {
    var possibleMoves = [];
    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            if (gameGrid[i][j] == 0) {
                possibleMoves.push([i,j]);
            }
        }
    }
    // random accross available space
    var move = possibleMoves[randRange(0, possibleMoves.length)];
    gameGrid[move[0]][move[1]] = 2;
    var id = "#" + move.join("");
    $(id).html('<img src="img/cross.png" />');
    nextTurn();
}

function userClick (evt) {
    if (!started || whoseTurn != "user") {
        return;
    }
    var $target = $(evt.target).closest(".cell");
    var id = $target.attr("id");
    var i = parseInt(id[0]);
    var j = parseInt(id[1]);
    gameGrid[i][j]++;
    gameGrid[i][j] %= 3;
    if (gameGrid[i][j]==0) {
        $target.empty();
    } else if (gameGrid[i][j]==1) {
        $target.html('<img src="img/circle.png" />');
    } else if (gameGrid[i][j]==2) {
        $target.html('<img src="img/cross.png" />');
    }
    nextTurn();
}

$(function () {
    $("#grid").on("click", ".cell", userClick);
});