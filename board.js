const { Pawn, Knight, Bishop, Rook, Queen, King } = require("./piece");
const { Position } = require("./position");
const {
  process_chess_coord,
  MOVE_REGULAR,
  MOVE_KINGSIDE_CASTLE,
  MOVE_QUEENSIDE_CASTLE,
} = require("./chess_coord.js");
const { assert } = require("./utils");

const STATUS_OK = 0;
const STATUS_INVALID_MOVE = 1;
const STATUS_CHECKMATE = 3;

class Board {
  constructor() {
    this.white_turn = true;
    this.moves = [];

    this.white_pieces = [];
    this.black_pieces = [];
    this.game_over = false;

    // initialize board with all pieces
    for (var i in [...Array(8).keys()]) {
      this.white_pieces.push(new Pawn(true, new Position(parseInt(i), 1)));
      this.black_pieces.push(new Pawn(false, new Position(parseInt(i), 6)));
    }

    this.white_pieces.push(new Rook(true, new Position(0, 0)));
    this.black_pieces.push(new Rook(false, new Position(0, 7)));

    this.white_pieces.push(new Knight(true, new Position(1, 0)));
    this.black_pieces.push(new Knight(false, new Position(1, 7)));

    this.white_pieces.push(new Bishop(true, new Position(2, 0)));
    this.black_pieces.push(new Bishop(false, new Position(2, 7)));

    this.white_pieces.push(new Queen(true, new Position(3, 0)));
    this.black_pieces.push(new Queen(false, new Position(3, 7)));

    this.white_pieces.push(new King(true, new Position(4, 0)));
    this.black_pieces.push(new King(false, new Position(4, 7)));

    this.white_pieces.push(new Bishop(true, new Position(5, 0)));
    this.black_pieces.push(new Bishop(false, new Position(5, 7)));

    this.white_pieces.push(new Knight(true, new Position(6, 0)));
    this.black_pieces.push(new Knight(false, new Position(6, 7)));

    this.white_pieces.push(new Rook(true, new Position(7, 0)));
    this.black_pieces.push(new Rook(false, new Position(7, 7)));
  }

  copy() {
    var b = new Board();
    b.white_turn = this.white_turn;
    b.game_over = this.game_over;

    // TODO check if this is a shallow copy
    // it is a shallow copy, but we don't modify moves in any way
    // so i think it's fine
    for (var m of this.moves) {
      b.moves.push(m);
    }

    b.white_pieces = [];
    for (var p of this.white_pieces) {
      b.white_pieces.push(p.copy());
    }

    b.black_pieces = [];
    for (var p of this.black_pieces) {
      b.black_pieces.push(p.copy());
    }

    return b;
  }

  moveFromTo(from_pos, to_pos, promote_type) {
    // find piece
    console.log("moveFromTo: " + from_pos + " " + to_pos);
    var pieces = this.white_turn ? this.white_pieces : this.black_pieces;
    var candidate_piece = pieces.find((p) => {
      return p.pos.x == from_pos.x && p.pos.y == from_pos.y;
    });
    assert(candidate_piece != null);

    candidate_piece.pos = new Position(to_pos.x, to_pos.y);

    if (this.is_check(this.white_turn)) {
      console.debug("This move would put your own king in check!");

      // revert move
      candidate_piece.pos = new Position(from_pos.x, from_pos.y);
      return STATUS_INVALID_MOVE;
    }

    console.debug("Move is accepted!");
    this.moves.push({ piece: candidate_piece, from: from_pos, to: to_pos });
    if (candidate_piece instanceof Pawn) {
      candidate_piece.set_moved();
    }

    // promotion: remove current piece, add new piece with same position
    if (promote_type) {
      pieces = pieces.filter((p) => !(p.pos.x == to_pos.x && p.pos.y == to_pos.y))
      pieces.push(new promote_type(this.white_turn, new Position(to_pos.x, to_pos.y)))
      if (this.white_turn) {
        this.white_pieces = pieces
      } else {
        this.black_pieces = pieces
      }
    }

    // remove captured piece, if any
    var opp_pieces = this.white_turn ? this.black_pieces : this.white_pieces;
    opp_pieces = opp_pieces.filter((p) => {
      return !(p.pos.x == to_pos.x && p.pos.y == to_pos.y);
    });

    if (this.white_turn) {
      this.black_pieces = opp_pieces;
    } else {
      this.white_pieces = opp_pieces;
    }

    // check, checkmate
    if (this.is_check(!this.white_turn)) {
      console.debug("Opposing player is in check!");
      if (this.is_checkmate(!this.white_turn)) {
        console.debug("Checkmate!");
        this.game_over = true;
      } else {
        console.debug("Not checkmate though.");
      }
    }

    this.white_turn = !this.white_turn;
    return STATUS_OK;
  }

  handleCastling(chessCoord) {
    console.debug("Processing Castle")
    var friendly_pieces = this.white_turn
      ? this.white_pieces
      : this.black_pieces;
    var opp_pieces = this.white_turn ? this.black_pieces : this.white_pieces;
    var rank = this.white_turn ? 0 : 7;

    // condition 1: king is not in check
    if (this.is_check(this.white_turn)) {
      console.log("Castling failed: condition 1")
      return STATUS_INVALID_MOVE;
    }

    // condition 2: king and rook haven't moved
    var king = this.find_piece_by_type(this.white_turn, King)[0];
    if (king.moved) {
      console.log("Castling failed: condition 2a")
      return STATUS_INVALID_MOVE;
    }

    var rook_x = chessCoord == MOVE_KINGSIDE_CASTLE ? 7 : 0;
    var rook = this.find_piece_by_coord(this.white_turn, new Position(rook_x, rank));
    if (!rook || rook.moved) {
      console.log("Castling failed: condition 2b")
      return STATUS_INVALID_MOVE;
    }

    // condition 3: no pieces in between king and rook
    var left = Math.min(king.pos.x, rook.pos.x);
    var right = Math.max(king.pos.x, rook.pos.x);
    for (let i = left + 1; i < right - 1; i++) {
      var piece =
        this.find_piece_by_coord(true, new Position(rook_x, i)) ||
        this.find_piece_by_coord(false, new Position(rook_x, i));
      if (piece) {
        console.debug(
          "Found piece in between king and rook!" + JSON.stringify(piece)
        );
        console.log("Castling failed: condition 3")
        return STATUS_INVALID_MOVE;
      }
    }

    // condition 4: when the king castles, it moves a couple of squares.
    //              none of those squares can be under attack.
    var in_between_squares =
      chessCoord == MOVE_KINGSIDE_CASTLE
        ? [new Position(5, rank), new Position(6, rank)]
        : [new Position(3, rank), new Position(2, rank)];

    for (var sq of in_between_squares) {
      var sq_is_attacked = opp_pieces.some((p) => {
        var moves = p.get_moves(this);
        return moves.some((m) => m.x == sq.x && m.y == sq.y);
      });
      if (sq_is_attacked) {
        console.debug("Square " + sq + "is attacked!");
        console.log("Castling failed: condition 4")
        return STATUS_INVALID_MOVE;
      }
    }

    // good to go!
    console.debug("Castling is a success!")
    if (chessCoord == MOVE_KINGSIDE_CASTLE) {
      king.pos = new Position(6, rank);
      rook.pos = new Position(5, rank);
    } else {
      king.pos = new Position(2, rank);
      rook.pos = new Position(3, rank);
    }
    this.white_turn = !this.white_turn;

    return STATUS_OK
  }

  find_piece_by_coord(find_white_pieces, pos) {
    return (find_white_pieces ? this.white_pieces : this.black_pieces).find(
      (p) => p.pos.x == pos.x && p.pos.y == pos.y
    );
  }

  find_piece_by_type(find_white_pieces, type) {
    return (find_white_pieces ? this.white_pieces : this.black_pieces).filter(
      (p) => p instanceof type
    );
  }

  move(chessCoord) {
    console.debug("Processing: " + chessCoord);

    var coord = process_chess_coord(chessCoord);
    console.debug("Processed " + JSON.stringify(coord));

    if (coord == null) {
      return STATUS_INVALID_MOVE;
    }

    // handle castling
    if (
      coord.move_type == MOVE_KINGSIDE_CASTLE ||
      coord.move_type == MOVE_QUEENSIDE_CASTLE
    ) {
      return this.handleCastling(coord.move_type);
    }

    var pieces = this.white_turn ? this.white_pieces : this.black_pieces;
    var candidate_pieces = pieces.filter((p) => p instanceof coord.type);
    candidate_pieces = candidate_pieces.filter((p) => {
      var moves = p.get_moves(this);
      console.debug("Moves: " + moves);
      return moves.some(
        (m) => m.x == coord.position.x && m.y == coord.position.y
      );
    });

    console.debug("Candidates: " + JSON.stringify(candidate_pieces));
    if (candidate_pieces.length == 0) {
      return STATUS_INVALID_MOVE;
    }
    if (candidate_pieces.length > 1) {
      // TODO: use disambiguation
      return STATUS_INVALID_TYPE;
    }

    assert(candidate_pieces.length == 1);
    var candidate_piece = candidate_pieces[0];

    var old_pos = new Position(candidate_piece.pos.x, candidate_piece.pos.y);
    return this.moveFromTo(old_pos, coord.position, ('promote' in coord) ? coord.promote : null);
  }

  // is_check(true) => check's if white king is in check
  is_check(is_white) {
    var opp_pieces = is_white ? this.black_pieces : this.white_pieces;
    var friendly_pieces = is_white ? this.white_pieces : this.black_pieces;

    var king = friendly_pieces.find((p) => p instanceof King);
    assert(king != null);

    var king_is_attacked = opp_pieces.some((p) => {
      var moves = p.get_moves(this);
      return moves.some((m) => m.x == king.pos.x && m.y == king.pos.y);
    });

    return king_is_attacked;
  }

  // is_checkmate(true) => white lost the game
  is_checkmate(is_white) {
    if (!this.is_check(is_white)) {
      return false;
    }

    var friendly_pieces = is_white ? this.white_pieces : this.black_pieces;
    var can_escape = friendly_pieces.find((p) => {
      var moves = p.get_moves(this);
      var can_escape = moves.some((m) => {
        var b_copy = this.copy();
        b_copy.white_turn = is_white;

        var status = b_copy.moveFromTo(p.pos, m);
        if (status != STATUS_OK) {
          return false;
        }

        var still_in_check = b_copy.is_check(is_white);
        if (!still_in_check) {
          console.debug(
            "Move found that removed check! " +
              JSON.stringify(m) +
              " " +
              JSON.stringify(p)
          );
        }
        return !still_in_check;
      });

      return can_escape;
    });

    return !can_escape;
  }

  toString() {
    var s = "";
    for (var r in [...Array(8).keys()]) {
      for (var c in [...Array(8).keys()]) {
        var piece =
          this.black_pieces.find((p) => p.pos.x == c && p.pos.y == 8 - r - 1) ||
          this.white_pieces.find((p) => p.pos.x == c && p.pos.y == 8 - r - 1);

        if (piece != null) {
          s += piece.toString() + "|";
        } else {
          s += "  " + "|";
        }
      }
      s += "\n------------------------\n";
    }
    return s;
  }
}

module.exports.Board = Board;
module.exports.STATUS_OK = STATUS_OK;
module.exports.STATUS_INVALID_MOVE = STATUS_INVALID_MOVE;
module.exports.STATUS_CHECKMATE = STATUS_CHECKMATE;
