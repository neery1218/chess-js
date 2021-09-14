const {Position} = require('./position')

class Piece {
    constructor(is_white) {
        this.is_white = is_white
    }
    get_moves(board, pos) {
        throw "Unimplemented!"
    }

    // returns positions of valid moves. Moves returned from this function can potentially
    // put the king in check, and that'll have to be checked in the board class.
    move(new_pos) {
        throw "Unimplemented!"
    }

    toString() {
        throw "Unimplemented!"
    }

    in_bounds(pos) {
        return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8
    }
    collision(pos, board) {
        var friendly_piece_pos = Array.from((this.is_white ? board.white_pieces : board.black_pieces).keys())
        return friendly_piece_pos.some(
            (piece) => {
                return pos.x === piece.pos.x && pos.y === piece.pos.y
            }
        ) 
    }

    // keep adding direction to cur_pos until cur_pos is out of bounds
    // or collides with a piece. useful for implementing get_moves() for
    // Rook, Bishop, Queen.
    get_vector_moves(directions, board, pos) {
        var moves = []
        for (var dir of directions) {
            var cur_pos = pos
            for (var i in [...Array(8).keys()]) {
                cur_pos = cur_pos.add(new Position(dir.x, dir.y))
                if (this.collision(cur_pos, board) || !this.in_bounds(cur_pos)) {
                    break
                }
                moves.push(cur_pos)
            }
        }
        return moves
    }
}

class Pawn extends Piece {
    constructor (is_white, pos) {
        super(is_white, pos)
        this.vector = (is_white ? 1 : -1)
        this.moved = false
    }

    toString() {
        return this.is_white ? "WP" : "BP"
    }

    // needs to be called by board to make sure we don't double move anymore
    set_moved() {
        this.moved = true
    }

    get_moves(board, pos) {
        var moves = []
        var dir = this.is_white ? new Position(0, 1) : new Position(0, -1)

        var forward = pos.add(dir)
        if (!this.collision(forward, board)) {
            moves.push(forward)
        }

        // check for captures
        var left = forward.add(new Position(-1, 0))
        var right = forward.add(new Position(1, 0))
        var opp_pieces = this.is_white ? board.black_pieces : board.white_pieces

        if (this.in_bounds(left) && opp_pieces.has(left.toString())) {
            moves.push(left)
        }
        if (this.in_bounds(right) && opp_pieces.has(right.toString())) {
            moves.push(right)
        }

        // check for first move
        if (!this.moved) {
            var double = forward.add(dir)
            if (!this.collision(double, board)) {
                moves.push(double)
            }
        }

        // TODO: check for en passant
        return moves
    }
}

class Knight extends Piece {
    constructor (is_white) {
        super(is_white)
    }

    toString() {
        return this.is_white ? "WN" : "BN"
    }

    get_moves(board, pos) {
        var candidate_moves = [
            pos.add(new Position(-2, 1)), 
            pos.add(new Position(-1, 2)),
            pos.add(new Position(1, 2)),
            pos.add(new Position(2, 1)),
            pos.add(new Position(2, -1)),
            pos.add(new Position(1, -2)),
            pos.add(new Position(-1, -2)),
            pos.add(new Position(-2, -1)),
        ]
        return candidate_moves.filter(pos => {
            return this.in_bounds(pos) && !this.collision(pos, board)
        })
    }
}

class Bishop extends Piece {
    constructor (is_white) {
        super(is_white)
    }

    toString() {
        return this.is_white ? "WB" : "BB"
    }

    get_moves(board, pos) {
        var directions = [
            {x: 1, y: 1}, 
            {x: 1, y: -1},
            {x: -1, y: -1},
            {x: -1, y: 1}
        ]
        return this.get_vector_moves(directions, board, pos)
    }
}

class Rook extends Piece {
    constructor (is_white, pos) {
        super(is_white, pos)
    }

    toString() {
        return this.is_white ? "WR" : "BR"
    }

    get_moves(board, pos) {
        var directions = [
            {x: 1, y: 0}, 
            {x: -1, y: 0},
            {x: 0, y: 1},
            {x: 0, y: -1}
        ]
        return this.get_vector_moves(directions, board, pos)
    }
}

class Queen extends Piece {
    constructor (is_white, pos) {
        super(is_white, pos)
    }

    toString() {
        return this.is_white ? "WQ" : "BQ"
    }

    get_moves(board, pos) {
        var directions = [
            {x: 1, y: 1}, 
            {x: 1, y: -1},
            {x: -1, y: -1},
            {x: -1, y: 1},
            {x: 1, y: 0}, 
            {x: -1, y: 0},
            {x: 0, y: 1},
            {x: 0, y: -1},
        ]
        return this.get_vector_moves(directions, board, pos)
    }
}

class King extends Piece {
    constructor (is_white, pos) {
        super(is_white, pos)
    }

    toString() {
        return this.is_white ? "WK" : "BK"
    }

    get_moves(board, pos) {
        var candidate_moves = [
            pos.add(new Position(-1, 0)),
            pos.add(new Position(-1, -1)),
            pos.add(new Position(0, -1)),
            pos.add(new Position(1, -1)),
            pos.add(new Position(1, 0)),
            pos.add(new Position(1, 1)),
            pos.add(new Position(0, 1)),
            pos.add(new Position(-1, 1))
        ]

        return candidate_moves.filter(pos => {
            return this.in_bounds(pos) && !this.collision(pos, board)
        })

    }
}

module.exports.Knight = Knight
module.exports.Bishop = Bishop
module.exports.Rook = Rook
module.exports.Queen = Queen
module.exports.Pawn = Pawn
module.exports.King = King
module.exports.Piece = Piece