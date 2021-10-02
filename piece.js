const { Position } = require("./position");

class Piece {
  constructor(is_white, pos, name) {
    this.is_white = is_white;
    this.pos = pos;
    this.name = name;
    this.moved = false;
  }
  get_moves(board) {
    throw "Unimplemented!";
  }

  // needs to be called by board to make sure we don't double move anymore
  set_moved() {
    this.moved = true;
  }

  // returns positions of valid moves. Moves returned from this function can potentially
  // put the king in check, and that'll have to be checked in the board class.
  move(new_pos) {
    throw "Unimplemented!";
  }

  toString() {
    throw "Unimplemented!";
  }

  in_bounds(pos) {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  _collision(pos, pieces) {
    return pieces.some((piece) => {
      return pos.x === piece.pos.x && pos.y === piece.pos.y;
    });
  }

  friendly_collision(pos, board) {
    var pieces = this.is_white ? board.white_pieces : board.black_pieces;
    return this._collision(pos, pieces);
  }

  enemy_collision(pos, board) {
    var pieces = this.is_white ? board.black_pieces : board.white_pieces;
    return this._collision(pos, pieces);
  }

  any_collision(pos, board) {
    return (
      this.friendly_collision(pos, board) || this.enemy_collision(pos, board)
    );
  }

  // keep adding direction to cur_pos until cur_pos is out of bounds
  // or collides with a piece. useful for implementing get_moves() for
  // Rook, Bishop, Queen.
  get_vector_moves(directions, board) {
    var moves = [];
    for (var dir of directions) {
      var cur_pos = this.pos;
      for (var i in [...Array(8).keys()]) {
        cur_pos = cur_pos.add(new Position(dir.x, dir.y));
        if (
          this.friendly_collision(cur_pos, board) ||
          !this.in_bounds(cur_pos)
        ) {
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
    var cloned = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );

    // ^ is a shallow clone, so i gotta deepcopy all non-primitive attributes
    cloned.pos = this.pos.copy();

    return cloned;
  }
}

class Pawn extends Piece {
  constructor(is_white, pos) {
    super(is_white, pos, "Pawn");
    this.vector = is_white ? 1 : -1;
    this.moved = false;
  }

  toString() {
    return this.is_white ? "WP" : "BP";
  }

  get_moves(board) {
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

    if (
      this.in_bounds(left) &&
      opp_pieces.some((p) => p.pos.x == left.x && p.pos.y == left.y)
    ) {
      moves.push(left);
    }
    if (
      this.in_bounds(right) &&
      opp_pieces.some((p) => p.pos.x == right.x && p.pos.y == right.y)
    ) {
      moves.push(right);
    }

    // en passant
    if (board.moves.length > 0) {
      var last_move = board.moves.slice(-1)[0];
      var distance = Math.abs(last_move.to.y - last_move.from.y);
      if (
        last_move.piece instanceof Pawn &&
        distance == 2 &&
        last_move.to.y == this.pos.y
      ) {
        moves.push(
          new Position(last_move.to.x, this.pos.y).add(dir)
        );
      }
    }

    return moves;
  }
}

class Knight extends Piece {
  constructor(is_white, pos) {
    super(is_white, pos, "Knight");
  }

  toString() {
    return this.is_white ? "WN" : "BN";
  }

  get_moves(board) {
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

class Bishop extends Piece {
  constructor(is_white, pos) {
    super(is_white, pos, "Bishop");
  }

  toString() {
    return this.is_white ? "WB" : "BB";
  }

  get_moves(board) {
    var directions = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: -1 },
      { x: -1, y: 1 },
    ];
    return this.get_vector_moves(directions, board);
  }
}

class Rook extends Piece {
  constructor(is_white, pos) {
    super(is_white, pos, "Rook");
  }

  toString() {
    return this.is_white ? "WR" : "BR";
  }

  get_moves(board) {
    var directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    return this.get_vector_moves(directions, board);
  }
}

class Queen extends Piece {
  constructor(is_white, pos) {
    super(is_white, pos, "Queen");
  }

  toString() {
    return this.is_white ? "WQ" : "BQ";
  }

  get_moves(board, pos) {
    var directions = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    return this.get_vector_moves(directions, board);
  }
}

class King extends Piece {
  constructor(is_white, pos) {
    super(is_white, pos, "King");
  }

  toString() {
    return this.is_white ? "WK" : "BK";
  }

  get_moves(board) {
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

module.exports.Knight = Knight;
module.exports.Bishop = Bishop;
module.exports.Rook = Rook;
module.exports.Queen = Queen;
module.exports.Pawn = Pawn;
module.exports.King = King;
module.exports.Piece = Piece;
