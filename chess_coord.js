const { Pawn, Knight, Bishop, Rook, Queen, King } = require("./piece");
const { Position } = require("./position");
const { assert } = require("./utils")

const MOVE_KINGSIDE_CASTLE = 0;
const MOVE_QUEENSIDE_CASTLE = 1;
const MOVE_REGULAR = 2;
const MOVE_PAWN_PROMOTION = 3;

function process_chess_coord(chess_coord) {
  // e.g "Ne4" OR "Nxe4" => {move_type: Regular, type: Knight, from_col: null, pos: new Position(4, 3)}
  //     "O-O" => {move_type: Castle, castle_type: King}
  //     "Nbd4" => {move_type: Regular, type: Knight, from_col: null, pos: ....}
  //     "e8=Q" => {move_type: Promotion, type:Pawn, promote: Queen}
  // return null if chess_coord is invalid
  console.log("chess_coord.js: Process chess move " + chess_coord)

  // special cases
  // castling
  if (chess_coord == "O-O") {
    return { move_type: MOVE_KINGSIDE_CASTLE };
  }
  if (chess_coord == "O-O-O") {
    return { move_type: MOVE_QUEENSIDE_CASTLE };
  }

  var processed = { 
    move_type: MOVE_REGULAR,
    type: null,
    disambiguation: null,
    position: null,
    promote: null,
  };

  // promotion
  if (chess_coord.indexOf("=") != -1) {
    var piece = letter_to_piece(chess_coord[chess_coord.length - 1])
    processed.move_type = MOVE_PAWN_PROMOTION
    processed.promote = piece
    chess_coord = chess_coord.substring(0, chess_coord.length - 2)
  }

  // filter out 'x' Nxe4 => Ne4. All coords should be 3 or 4 letters long
  chess_coord = chess_coord
    .split("")
    .filter((c) => c != "x")
    .join("");

  if (chess_coord.length < 2) {
    return null
  }

  // d4 => Pawn. Ne4 => Knight
  var piece = ["N", "B", "Q", "R", "K"].includes(chess_coord[0])
    ? letter_to_piece(chess_coord[0])
    : Pawn;
  processed.type = piece

  if (piece == null) {
    return null;
  }

  var disambiguation = null;

  // Ne4 => e4. e4 => e4
  if (piece != Pawn) {
    chess_coord = chess_coord.substring(1);
  }

  if (chess_coord.length > 2) {
    disambiguation = process_disambiguation(chess_coord.substring(0, chess_coord.length - 2)); // c, 1, c1
    processed.disambiguation = disambiguation

    chess_coord = chess_coord.substring(chess_coord.length - 2);
  }

  var pos = coord_to_position(chess_coord);
  processed.position = pos
  if (pos == null) {
    return null;
  }

  return processed
}

function process_disambiguation(dis) {
  console.debug("Process dis: " + dis)
  // 1 => Point(null, 0)
  // c => Point(2, null)
  // c1 => Point(2, 0)
  if (/^[1-8]$/.test(dis)) {
    var row = parseInt(dis) - 1
    return new Position(null, row)
  }
  else if (/^[a-h]$/.test(dis)) {
    var x = letter_to_x(dis)
    return new Position(x, null)
  }
  else if (/^[a-h][1-8]$/.test(dis)) {
    var x = letter_to_x(dis[0])
    var y = parseInt(dis[1]) - 1
    return new Position(x, y)
  }

  assert(false) // should never get here!
}

function coord_to_position(coord) {
  assert(coord.length == 2);

  var x = letter_to_x(coord[0]);
  var y = parseInt(coord[1]) - 1;

  assert(y >= 0 && y < 8, y);
  assert(x >= 0 && x < 8, x);

  return new Position(x, y);
}

function letter_to_x(letter) {
  assert(letter.length == 1);
  switch (letter) {
    case "a":
      return 0;
    case "b":
      return 1;
    case "c":
      return 2;
    case "d":
      return 3;
    case "e":
      return 4;
    case "f":
      return 5;
    case "g":
      return 6;
    case "h":
      return 7;
  }
}

function letter_to_piece(letter) {
  assert(letter.length == 1);
  switch (letter) {
    case "R":
      return Rook;
    case "N":
      return Knight;
    case "B":
      return Bishop;
    case "Q":
      return Queen;
    case "K":
      return King;
    default:
      return null;
  }
}

module.exports.process_chess_coord = process_chess_coord;
module.exports.MOVE_KINGSIDE_CASTLE = MOVE_KINGSIDE_CASTLE;
module.exports.MOVE_QUEENSIDE_CASTLE = MOVE_QUEENSIDE_CASTLE;
module.exports.MOVE_REGULAR = MOVE_REGULAR;