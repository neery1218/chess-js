const { Pawn, Knight, Bishop, Rook, Queen, King} = require('./piece')
const {Position} = require('./position')

const STATUS_OK = 0
const STATUS_INVALID_MOVE = 1
const STATUS_CHECK = 2
const STATUS_CHECKMATE = 3

class Board {
    constructor() {
        this.white_turn = true
        this.moves = []

        // dictionary of Position.toString() => Piece
        this.white_pieces = new Map()
        this.black_pieces = new Map()

        // initialize board with all pieces
        for (var i in [...Array(8).keys()]) {
            this.white_pieces.set(
                new Position(i, 1).toString(),
                new Pawn(true))

            this.black_pieces.set(
                new Position(i, 6).toString(),
                new Pawn(false))
        }

        this.white_pieces.set(
            new Position(0, 0).toString(),
            new Rook(true))
        this.black_pieces.set(
            new Position(0, 7).toString(),
            new Rook(false))

        this.white_pieces.set(
            new Position(1, 0).toString(),
            new Knight(true))
        this.black_pieces.set(
            new Position(1, 7).toString(),
            new Knight(false))

        this.white_pieces.set(
            new Position(2, 0).toString(),
            new Bishop(true))
        this.black_pieces.set(
            new Position(2, 7).toString(),
            new Bishop(false))

        this.white_pieces.set(
            new Position(3, 0).toString(),
            new Queen(true))
        this.black_pieces.set(
            new Position(3, 7).toString(),
            new Queen(false))

        this.white_pieces.set(
            new Position(4, 0).toString(),
            new King(true))
        this.black_pieces.set(
            new Position(4, 7).toString(),
            new King(false))

        this.white_pieces.set(
            new Position(5, 0).toString(),
            new Bishop(true))
        this.black_pieces.set(
            new Position(5, 7).toString(),
            new Bishop(false))

        this.white_pieces.set(
            new Position(6, 0).toString(),
            new Knight(true))
        this.black_pieces.set(
            new Position(6, 7).toString(),
            new Knight(false))

        this.white_pieces.set(
            new Position(7, 0).toString(),
            new Rook(true))
        this.black_pieces.set(
            new Position(7, 7).toString(),
            new Rook(false))
    }

    move(chessCoord) {
        // parse coord to figure out which piece is supposed to move
        // get pieces
        // call get_moves on all candidate pieces
        // create (piece, move) array
        // filter out moves that cause king to be in check
        // if there are still duplicates, throw
        // move piece to desired area
    }

    move(piecePos, newPos) {
        // invariants:
        // board is in valid state. 
        // return value: Status enum

        // validation:
        // 1. check piece exists
        // 2. check newPosition is in piece.get_valid_moves(board)
        // 3. check that the move doesn't put the king in check
            // should this be done in Piece or Board
            // probably worthwhile to do it in board. otherwise,
            // creating all the moves is going to take forever
        // 4. move piece on board
        // 5. evaluate if opposition is in check or checkmate
    }

    toString() {
        var s = ""
        for (var r in [...Array(8).keys()]) {
            for (var c in [...Array(8).keys()]) {
                var pos = new Position(c, r)
                if (this.white_pieces.has(pos.toString())) {
                    s += this.white_pieces.get(pos.toString()).toString() + "|"
                }
                else if (this.black_pieces.has(pos.toString())) {
                    s += this.black_pieces.get(pos.toString()).toString() + "|"
                }
                else {
                    s += "  " + "|"
                }
            }
            s += "\n------------------------\n"
        }
        return s
    }
}

module.exports.Board = Board