import { Position } from "./position"
import { Piece, Pawn, Knight, Bishop, Rook, Queen, King } from "./piece"
import { process_chess_coord, KingSideCastle, QueenSideCastle } from "./chess_coord"
import { assert } from "./utils"

export enum MoveStatus {
  OK,
  INVALID_MOVE,
}

export enum GameStatus {
  UNFINISHED,
  DRAW,
  WHITE_WINS, 
  BLACK_WINS,
}

interface Move {
  piece: Piece,
  from: Position,
  to: Position
}

export class Board {
  white_turn: boolean
  moves: Array<Move>
  white_pieces: Array<Piece>
  black_pieces: Array<Piece>
  game_over: boolean

  constructor() {
    this.white_turn = true;
    this.moves = [];

    this.white_pieces = [];
    this.black_pieces = [];
    this.game_over = false;

    // initialize board with all pieces
    for (var i = 0; i < 8; i++) {
      this.white_pieces.push(new Pawn(true, new Position(i, 1)));
      this.black_pieces.push(new Pawn(false, new Position(i, 6)));
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

  copy(): Board {
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

  moveFromTo(from_pos: Position, to_pos: Position, promote_type: (typeof Piece) | null): MoveStatus {
    // find piece
    console.log("moveFromTo: " + from_pos + " " + to_pos);
    var pieces = this.white_turn ? this.white_pieces : this.black_pieces;
    var candidate_piece = pieces.find((p) => {
      return p.pos.x == from_pos.x && p.pos.y == from_pos.y;
    });

    if (candidate_piece == null) {
      return MoveStatus.INVALID_MOVE
    }

    candidate_piece.pos = new Position(to_pos.x, to_pos.y);

    if (this.is_check(this.white_turn)) {
      console.debug("This move would put your own king in check!");

      // revert move
      candidate_piece.pos = new Position(from_pos.x, from_pos.y);
      return MoveStatus.INVALID_MOVE;
    }

    console.debug("Move is accepted!");
    this.moves.push({ piece: candidate_piece, from: from_pos, to: to_pos });
    if (candidate_piece instanceof Pawn) {
      candidate_piece.set_moved();
    }

    // promotion: remove current piece, add new piece with same position
    if (promote_type) {
      pieces = pieces.filter((p) => !(p.pos.x == to_pos.x && p.pos.y == to_pos.y));
      pieces.push(new promote_type(this.white_turn, new Position(to_pos.x, to_pos.y)));
      if (this.white_turn) {
        this.white_pieces = pieces;
      } else {
        this.black_pieces = pieces;
      }
    }

    // remove captured piece, if any
    var opp_pieces = this.white_turn ? this.black_pieces : this.white_pieces;
    opp_pieces = opp_pieces.filter((p) => {
      return !(p.pos.x == to_pos.x && p.pos.y == to_pos.y);
    });

    // FIXME: special case: remove pawn if en passanted

    if (this.white_turn) {
      this.black_pieces = opp_pieces;
    } else {
      this.white_pieces = opp_pieces;
    }

    this.white_turn = !this.white_turn;
    return MoveStatus.OK;
  }

  eval_game(): GameStatus {
    if (this.is_check(this.white_turn)) {
      console.debug("Opposing player is in check!");
      if (this.is_checkmate(this.white_turn)) {
        console.debug("Checkmate!");
        this.game_over = true;
        return this.white_turn? GameStatus.BLACK_WINS : GameStatus.WHITE_WINS
      } else {
        console.debug("Not checkmate though.");
      }
    }

    if (this.is_draw()) {
      console.log("Draw!");
      return GameStatus.DRAW;
    }

    return GameStatus.UNFINISHED
  }

  is_draw(): boolean {
    // case 1: stalemate. current player can't make any moves
    var friendly_pieces = this.white_turn ? this.white_pieces : this.black_pieces;
    var available_moves = friendly_pieces.flatMap((p) => {
      return p.get_moves(this).filter((m) => {
        var b_copy = this.copy();
        var status = b_copy.moveFromTo(p.pos, m, null);
        return status == MoveStatus.OK;
      });
    });
    if (available_moves.length == 0) {
      return true;
    }

    // TODO: case 2
    // - king vs king + bishop
    // - king vs king + knight
    // - king + bishop vs king + bishop of the same color

    return false;
  }

  handleCastling(move: KingSideCastle | QueenSideCastle): MoveStatus {
    console.debug("Processing Castle");
    var friendly_pieces = this.white_turn ? this.white_pieces : this.black_pieces;
    var opp_pieces = this.white_turn ? this.black_pieces : this.white_pieces;
    var rank = this.white_turn ? 0 : 7;

    // condition 1: king is not in check
    if (this.is_check(this.white_turn)) {
      console.log("Castling failed: condition 1");
      return MoveStatus.INVALID_MOVE;
    }

    // condition 2: king and rook haven't moved
    var kings = this.find_piece_by_type(this.white_turn, King);
    if (kings == null || kings.length > 1) { return MoveStatus.INVALID_MOVE }
    var king = kings[0];

    if (king.moved) {
      console.log("Castling failed: condition 2a");
      return MoveStatus.INVALID_MOVE;
    }

    var rook_x = (move.move_type == "KingSideCastle") ? 7 : 0;
    var rook = this.find_piece_by_coord(this.white_turn, new Position(rook_x, rank));
    if (!rook || rook.moved) {
      console.log("Castling failed: condition 2b");
      return MoveStatus.INVALID_MOVE;
    }

    // condition 3: no pieces in between king and rook
    var left = Math.min(king.pos.x, rook.pos.x);
    var right = Math.max(king.pos.x, rook.pos.x);
    for (let i = left + 1; i < right - 1; i++) {
      var piece =
        this.find_piece_by_coord(true, new Position(rook_x, i)) ||
        this.find_piece_by_coord(false, new Position(rook_x, i));
      if (piece) {
        console.debug("Found piece in between king and rook!" + JSON.stringify(piece));
        console.log("Castling failed: condition 3");
        return MoveStatus.INVALID_MOVE
      }
    }

    // condition 4: when the king castles, it moves a couple of squares.
    //              none of those squares can be under attack.
    var in_between_squares =
      (move.move_type == "KingSideCastle")
        ? [new Position(5, rank), new Position(6, rank)]
        : [new Position(3, rank), new Position(2, rank)];

    for (var sq of in_between_squares) {
      var sq_is_attacked = opp_pieces.some((p) => {
        var moves = p.get_moves(this);
        return moves.some((m) => m.x == sq.x && m.y == sq.y);
      });
      if (sq_is_attacked) {
        console.debug("Square " + sq + "is attacked!");
        console.log("Castling failed: condition 4");
        return MoveStatus.INVALID_MOVE
      }
    }

    // good to go!
    console.debug("Castling is a success!");
    if (move.move_type == "KingSideCastle") {
      king.pos = new Position(6, rank);
      rook.pos = new Position(5, rank);
    } else {
      king.pos = new Position(2, rank);
      rook.pos = new Position(3, rank);
    }
    this.white_turn = !this.white_turn;

    return MoveStatus.OK;
  }

  find_piece_by_coord(find_white_pieces: boolean, pos: Position): Piece | undefined {
    return (find_white_pieces ? this.white_pieces : this.black_pieces).find(
      (p) => p.pos.x == pos.x && p.pos.y == pos.y
    );
  }

  find_piece_by_type(find_white_pieces: boolean, type: (typeof Piece)): Array<Piece> | undefined {
    return (find_white_pieces ? this.white_pieces : this.black_pieces).filter(
      (p) => p instanceof type
    );
  }

  move(chessCoord: string) {
    console.debug("Processing: " + chessCoord);

    var coord = process_chess_coord(chessCoord);
    console.debug("Processed " + JSON.stringify(coord));

    if (coord == null) {
      return MoveStatus.INVALID_MOVE
    }

    // handle castling
    if (coord.move_type == 'KingSideCastle' || coord.move_type == 'QueenSideCastle') {
      return this.handleCastling(coord);
    }

    var pieces = this.white_turn ? this.white_pieces : this.black_pieces;
    var piece_type = coord.moved_piece
    var coord_pos = coord.position

    var candidate_pieces = pieces.filter((p) => p instanceof piece_type)
    candidate_pieces = candidate_pieces.filter((p) => {
      var moves = p.get_moves(this);
      console.debug("Moves: " + moves);
      return moves.some((m) => m.x == coord_pos.x && m.y == coord_pos.y);
    });

    console.debug("Candidates: " + JSON.stringify(candidate_pieces));
    if (candidate_pieces.length == 0) {
      return MoveStatus.INVALID_MOVE;
    }

    if (candidate_pieces.length > 1) {
      var dis = coord.disambiguation;
      if (dis == null) {
        assert(dis != null, "Many candidate pieces but no disambiguation!");
        return MoveStatus.INVALID_MOVE
      }

      candidate_pieces = candidate_pieces.filter((p) => {
        if (dis == null) { return true }
        else if (dis.type == "column") {
          return dis.val == p.pos.x
        }
        else if (dis.type == "row") {
          return dis.val == p.pos.y
        }
        else {
          return dis.row == p.pos.y && dis.col == p.pos.x
        }
      });
    }

    assert(candidate_pieces.length == 1, "I'm mindfucked " + candidate_pieces);
    var candidate_piece = candidate_pieces[0];

    var old_pos = new Position(candidate_piece.pos.x, candidate_piece.pos.y);
    return this.moveFromTo(old_pos, coord.position, "promote" in coord ? coord.promote : null);
  }

  // is_check(true) => check's if white king is in check
  is_check(is_white: boolean) {
    var opp_pieces = is_white ? this.black_pieces : this.white_pieces;
    var friendly_pieces = is_white ? this.white_pieces : this.black_pieces;

    var king = friendly_pieces.find((p) => p instanceof King);
    assert(king != null);

    var king_is_attacked = opp_pieces.some((p) => {
      var moves = p.get_moves(this);
      return moves.some((m) => m.x == king?.pos.x && m.y == king?.pos.y);
    });

    return king_is_attacked;
  }

  // is_checkmate(true) => white lost the game
  is_checkmate(is_white: boolean) {
    if (!this.is_check(is_white)) {
      return false;
    }

    var friendly_pieces = is_white ? this.white_pieces : this.black_pieces;
    var can_escape = friendly_pieces.find((p) => {
      var moves = p.get_moves(this);
      var can_escape = moves.some((m) => {
        var b_copy = this.copy();
        b_copy.white_turn = is_white;

        var status = b_copy.moveFromTo(p.pos, m, null);
        if (status != MoveStatus.OK) {
          return false;
        }

        var still_in_check = b_copy.is_check(is_white);
        if (!still_in_check) {
          console.debug(
            "Move found that removed check! " + JSON.stringify(m) + " " + JSON.stringify(p)
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
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
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