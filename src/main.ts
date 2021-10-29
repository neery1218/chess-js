import { Board, GameStatus, MoveStatus } from "./board";

var prompt_sync = require('prompt-sync')();

var b = new Board()
var game_status = GameStatus.UNFINISHED

while (game_status == GameStatus.UNFINISHED) {
    console.log(b.toString())

    var color = b.white_turn ? "white" : "black"
    var move = prompt_sync(color + " to move:")
    var status = b.move(move)
    if (status != MoveStatus.OK) {
        console.log("Invalid move! try again")
    }
    game_status = b.eval_game()
}