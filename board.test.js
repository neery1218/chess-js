const { Board, STATUS_OK, STATUS_INVALID_MOVE } = require("./board.js");
const { Position } = require("./position.js");
const { Queen } = require("./piece")
const { assert } = require("./utils.js");

console.log = function() {}
console.debug = function() {}

test('test_check', () => {
  var b = new Board()
  b.move("e4")
  b.move("e5")
  b.move("Nf3")
  b.move("d6")
  b.move("Bb5")
  console.log(b.toString())
  expect(b.is_check(false)).toBeTruthy();
});

test('test_checkmate', () => {
  var b = new Board()
  expect(b.is_checkmate(false)).toBeFalsy();

  b.move('e4')
  b.move('e5')
  b.move('Qf3')
  b.move('a6')
  b.move('Bc4')
  b.move('h6')
  b.move('Qf7')
  expect(b.is_checkmate(false)).toBeTruthy();
});

test('test_castling', () => {
  var b = new Board()
  b.move('e4')
  b.move('e5')
  b.move('Nf3')
  b.move('Nc6')
  b.move('Bc4')
  b.move('Bc5')
  expect(b.move("O-O")).toBe(STATUS_OK)
  console.log(b.toString())
});

test('test_castling_bad_rook_moved', () => {
  var b = new Board()
  b.move('e4')
  b.move('e5')
  b.move('Nf3')
  b.move('Nc6')
  b.move('Bc4')
  b.move('Bc5')
  b.move('Rg1') // move kingside rook
  b.move('a6')

  expect(b.move("O-O")).toBe(STATUS_INVALID_MOVE)
  console.log(b.toString())
});

test('test_castling_bad_check', () => {
  var b = new Board()
  b.move("e4")
  b.move("e5")
  b.move("Nf3")
  b.move("d6")
  b.move("Bb5")
  console.log(b.toString())
  expect(b.move("O-O")).toBe(STATUS_INVALID_MOVE);
});

test('test_pawn_promotion', () => {
  var b = new Board()
  b.move('a4')
  b.move('b6')
  b.move('a5')
  b.move('h6')
  b.move('axb6')
  b.move('h5')
  b.move('b7')
  b.move('h4')
  b.move('bxa8=Q')
  var p = b.find_piece_by_coord(true, new Position(0, 7))
  expect(p instanceof Queen).toBeTruthy()
})
