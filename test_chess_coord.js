const { process_chess_coord, MOVE_REGULAR } = require("./chess_coord.js");
const { Knight, Bishop, Rook, Queen, Pawn, Piece } = require("./piece");
const { Position } = require("./position.js");
const { assert } = require("./utils.js");

var coord = process_chess_coord("Ne4");
assert(coord.move_type == MOVE_REGULAR, coord);
assert(coord.type == Knight, coord);
assert(coord.position.x == 4 && coord.position.y == 3, JSON.stringify(coord));

var coord = process_chess_coord("Nde4");
debugger;
assert(coord.move_type == MOVE_REGULAR, coord);
assert(coord.type == Knight, coord);
assert(coord.position.x == 4 && coord.position.y == 3, JSON.stringify(coord));
assert(coord.disambiguation.x == 3)

var coord = process_chess_coord("Nd2e4");
debugger;
assert(coord.move_type == MOVE_REGULAR, coord);
assert(coord.type == Knight, coord);
assert(coord.position.x == 4 && coord.position.y == 3, JSON.stringify(coord));
assert(coord.disambiguation.x == 3 && coord.disambiguation.y == 1)