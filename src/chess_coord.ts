import { Piece, Pawn, Knight, Bishop, Rook, Queen, King } from "./piece"
import { Position } from "./position"
import { assert } from "./utils"

export type QueenSideCastle = {
  move_type: "QueenSideCastle"
}
export type KingSideCastle = {
  move_type: "KingSideCastle"
}

export type RegularMove = {
  move_type: "RegularMove",
  moved_piece: (typeof Piece),
  disambiguation: Column | Row | Point | null,
  position: Position,
}

export type Promotion = {
  move_type: "Promotion"
  moved_piece: (typeof Piece),
  disambiguation: Column | Row | Point | null,
  position: Position, 
  promote: (typeof Piece)
}

export type ProcessedMove = RegularMove | KingSideCastle | QueenSideCastle | Promotion

export type Column = {
  type: "column",
  val: number
}

export type Row = {
  type: "row",
  val: number,
}

export type Point = {
  type: "point",
  col: number,
  row: number
}

export function process_chess_coord(chess_coord: string): ProcessedMove | null {
  // e.g "Ne4" OR "Nxe4" => {move_type: Regular, type: Knight, from_col: null, pos: new Position(4, 3)}
  //     "O-O" => {move_type: Castle, castle_type: King}
  //     "Nbd4" => {move_type: Regular, type: Knight, from_col: null, pos: ....}
  //     "e8=Q" => {move_type: Promotion, type:Pawn, promote: Queen}
  // return null if chess_coord is invalid
  console.log("chess_coord.js: Process chess move " + chess_coord);

  // special cases
  // castling
  if (chess_coord == "O-O") {
    return { move_type: "KingSideCastle" };
  }
  if (chess_coord == "O-O-O") {
    return { move_type: "QueenSideCastle" };
  }

  var promote = null
  // promotion
  if (chess_coord.indexOf("=") != -1) {
    var piece = letter_to_piece(chess_coord[chess_coord.length - 1]);
    promote = piece;
    chess_coord = chess_coord.substring(0, chess_coord.length - 2);
  }

  // filter out 'x' Nxe4 => Ne4. All coords should be 3 or 4 letters long
  chess_coord = chess_coord
    .split("")
    .filter((c) => c != "x")
    .join("");

  if (chess_coord.length < 2) {
    return null;
  }

  // d4 => Pawn. Ne4 => Knight
  var moved_piece = ["N", "B", "Q", "R", "K"].includes(chess_coord[0])
    ? letter_to_piece(chess_coord[0])
    : Pawn;

  if (moved_piece == null) {
    return null;
  }


  // Ne4 => e4. e4 => e4
  if (moved_piece != Pawn) {
    chess_coord = chess_coord.substring(1);
  }

  var disambiguation = null;
  if (chess_coord.length > 2) {
    disambiguation = process_disambiguation(chess_coord.substring(0, chess_coord.length - 2)); // c, 1, c1
    chess_coord = chess_coord.substring(chess_coord.length - 2);
  }

  var position = coord_to_position(chess_coord);
  if (position == null) {
    return null;
  }

  if (promote) {
    return {
      move_type: "Promotion",
      moved_piece: moved_piece,
      disambiguation: disambiguation,
      position: position,
      promote: promote
    }
  }

  return {
    move_type: "RegularMove",
    moved_piece: moved_piece,
    disambiguation: disambiguation,
    position: position,
  }
}

function process_disambiguation(dis: string): Column | Row | Point | null {
  console.debug("Process dis: " + dis);
  // 1 => Point(null, 0)
  // c => Point(2, null)
  // c1 => Point(2, 0)
  if (/^[1-8]$/.test(dis)) {
    var row = parseInt(dis) - 1;
    return { type: "row", val: row } 
  } else if (/^[a-h]$/.test(dis)) {
    var x = letter_to_x(dis);
    return { type: "column", val: x } 
  } else if (/^[a-h][1-8]$/.test(dis)) {
    var x = letter_to_x(dis[0]);
    var y = parseInt(dis[1]) - 1;
    return { type: "point", row: y, col: x } 
  }

  return null
}

function coord_to_position(coord: string): Position {
  assert(coord.length == 2, "Coord " + coord + " is not of length two!");

  var x = letter_to_x(coord[0]);
  var y = parseInt(coord[1]) - 1;

  assert(y >= 0 && y < 8, y.toString());
  assert(x >= 0 && x < 8, x.toString());

  return new Position(x, y);
}

function letter_to_x(letter: string): number {
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
    default:
      return -1
  }
}

function letter_to_piece(letter: string): (typeof Piece) {
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
      assert(false, "Should never get here!");
      return Piece;
  }
}