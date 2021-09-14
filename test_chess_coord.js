const { process_chess_coord, MOVE_REGULAR } = require("./chess_coord.js");
const { Knight, Bishop, Rook, Queen, Pawn, Piece } = require("./piece");
const { Position } = require("./position.js");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

var coord = process_chess_coord("Ne4");
assert(coord.move_type == MOVE_REGULAR, coord);
assert(coord.type == Knight, coord);
assert(coord.position.x == 4 && coord.position.y == 4, JSON.stringify(coord));