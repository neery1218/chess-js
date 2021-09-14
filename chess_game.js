const {Position} = require('./position')
const {Board} = require('./board')
const {Knight, Bishop, Rook, Queen, Pawn, Piece} = require('./piece')

var a = new Pawn(true)
console.log(a instanceof Pawn)
console.log(a instanceof Piece)
console.log(a instanceof Knight)

var b = new Board()
console.log(b.toString())

// var knight = new Knight(true, new Position(1,0))
// console.log(knight.get_moves(b))

// var bishop = new Bishop(true, new Position(3, 3))
// console.log(bishop.get_moves(b))

// var rook = new Rook(true, new Position(0, 0))
// console.log(rook.get_moves(b))

// var queen = new Queen(true, new Position(0, 0))
// console.log(queen.get_moves(b))

// var pawn = new Pawn(true, new Position(0, 1))
// b.black_pieces.set(new Position(1, 2).toString(), new Knight(false, new Position(1, 2)))
// console.log(b.black_pieces)
// console.log(pawn.get_moves(b))