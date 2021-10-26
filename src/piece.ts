import { Position } from "./position"
import { Board } from "./board"

export class Piece {
  is_white: boolean
  pos: Position
  moved: boolean

  constructor(is_white: boolean, pos: Position) {
    this.is_white = is_white;
    this.pos = pos;
    this.moved = false;
  }

  // returns positions of valid moves. Moves returned from this function can potentially
  // put the king in check, and that'll have to be checked in the board class.
  get_moves(board: Board): Array<Position> {
    throw "Unimplemented!";
  }

  // needs to be called by board to make sure we don't double move anymore
  set_moved() {
    this.moved = true;
  }

  toString(): string {
    throw "Unimplemented!";
  }

  in_bounds(pos: Position) {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  _collision(pos: Position, pieces: Array<Piece>) {
    return pieces.some((piece) => {
      return pos.x === piece.pos.x && pos.y === piece.pos.y;
    });
  }

  friendly_collision(pos: Position, board: Board) {
    var pieces = this.is_white ? board.white_pieces : board.black_pieces;
    return this._collision(pos, pieces);
  }

  enemy_collision(pos: Position, board: Board) {
    var pieces = this.is_white ? board.black_pieces : board.white_pieces;
    return this._collision(pos, pieces);
  }

  any_collision(pos: Position, board: Board) {
    return this.friendly_collision(pos, board) || this.enemy_collision(pos, board);
  }

  // keep adding direction to cur_pos until cur_pos is out of bounds
  // or collides with a piece. useful for implementing get_moves() for
  // Rook, Bishop, Queen.
  get_vector_moves(directions: Array<Position>, board: Board) {
    var moves = [];
    for (var dir of directions) {
      var cur_pos = this.pos;
      for (var i = 0; i < 8; i++) {
        cur_pos = cur_pos.add(new Position(dir.x, dir.y));
        if (this.friendly_collision(cur_pos, board) || !this.in_bounds(cur_pos)) {
          break;
        }
        moves.push(cur_pos);
        if (this.enemy_collision(cur_pos, board)) {
          break;
        }
      }
    }
    return moves;
  }

  copy() {
    var cloned = Object.assign(Object.create(Object.getPrototypeOf(this)), this);

    // ^ is a shallow clone, so i gotta deepcopy all non-primitive attributes
    cloned.pos = this.pos.copy();

    return cloned;
  }
}

export class Pawn extends Piece {
  vector: number

  constructor(is_white: boolean, pos: Position) {
    super(is_white, pos);
    this.vector = is_white ? 1 : -1;
    this.moved = false;
  }

  toString() {
    return this.is_white ? "WP" : "BP";
  }

  get_moves(board: Board) {
    var moves = [];
    var dir = this.is_white ? new Position(0, 1) : new Position(0, -1);

    var forward = this.pos.add(dir);
    if (!this.any_collision(forward, board)) {
      moves.push(forward);

      if (!this.moved) {
        var double = forward.add(dir);
        if (!this.any_collision(double, board)) {
          moves.push(double);
        }
      }
    }

    // check for captures
    var left = forward.add(new Position(-1, 0));
    var right = forward.add(new Position(1, 0));
    var opp_pieces = this.is_white ? board.black_pieces : board.white_pieces;

    if (this.in_bounds(left) && opp_pieces.some((p) => p.pos.x == left.x && p.pos.y == left.y)) {
      moves.push(left);
    }
    if (this.in_bounds(right) && opp_pieces.some((p) => p.pos.x == right.x && p.pos.y == right.y)) {
      moves.push(right);
    }

    // en passant
    if (board.moves.length > 0) {
      var last_move = board.moves.slice(-1)[0];
      var distance = Math.abs(last_move.to.y - last_move.from.y);
      if (last_move.piece instanceof Pawn && distance == 2 && last_move.to.y == this.pos.y) {
        moves.push(new Position(last_move.to.x, this.pos.y).add(dir));
      }
    }

    return moves;
  }
}

export class Knight extends Piece {
  constructor(is_white: boolean, pos: Position) {
    super(is_white, pos);
  }

  toString() {
    return this.is_white ? "WN" : "BN";
  }

  get_moves(board: Board) {
    var candidate_moves = [
      this.pos.add(new Position(-2, 1)),
      this.pos.add(new Position(-1, 2)),
      this.pos.add(new Position(1, 2)),
      this.pos.add(new Position(2, 1)),
      this.pos.add(new Position(2, -1)),
      this.pos.add(new Position(1, -2)),
      this.pos.add(new Position(-1, -2)),
      this.pos.add(new Position(-2, -1)),
    ];
    return candidate_moves.filter((pos) => {
      return this.in_bounds(pos) && !this.friendly_collision(pos, board);
    });
  }
}

export class Bishop extends Piece {
  constructor(is_white: boolean, pos: Position) {
    super(is_white, pos)
  }

  toString() {
    return this.is_white ? "WB" : "BB";
  }

  get_moves(board: Board) {
    var directions = [
      new Position(1,1),
      new Position(1, -1),
      new Position(-1,-1),
      new Position(-1, 1),
    ];
    return this.get_vector_moves(directions, board);
  }
}

export class Rook extends Piece {
  constructor(is_white: boolean, pos: Position) {
    super(is_white, pos);
  }

  toString() {
    return this.is_white ? "WR" : "BR";
  }

  get_moves(board: Board) {
    var directions = [
      new Position(1,0),
      new Position(0, 1),
      new Position(-1, 0),
      new Position(0, -1),
    ];
    return this.get_vector_moves(directions, board);
  }
}

export class Queen extends Piece {
  constructor(is_white: boolean, pos: Position) {
    super(is_white, pos)
  }

  toString() {
    return this.is_white ? "WQ" : "BQ";
  }

  get_moves(board: Board) {
    var directions = [
      new Position(1, 1),
      new Position(1, -1),
      new Position(-1, -1),
      new Position(-1, 1),
      new Position(1, 0),
      new Position(-1, 0),
      new Position(0, 1),
      new Position(0, -1),
    ];
    return this.get_vector_moves(directions, board);
  }
}

export class King extends Piece {
  constructor(is_white: boolean, pos: Position) {
    super(is_white, pos)
  }

  toString() {
    return this.is_white ? "WK" : "BK";
  }

  get_moves(board: Board) {
    var candidate_moves = [
      this.pos.add(new Position(-1, 0)),
      this.pos.add(new Position(-1, -1)),
      this.pos.add(new Position(0, -1)),
      this.pos.add(new Position(1, -1)),
      this.pos.add(new Position(1, 0)),
      this.pos.add(new Position(1, 1)),
      this.pos.add(new Position(0, 1)),
      this.pos.add(new Position(-1, 1)),
    ];

    return candidate_moves.filter((pos) => {
      return this.in_bounds(pos) && !this.friendly_collision(pos, board);
    });
  }
}