import { Knight } from "./piece";
import { Column, Point, process_chess_coord, RegularMove } from "./chess_coord";
import { assert } from "./utils";

test("test_regular_move", () => {
  var coord = process_chess_coord("Ne4");
  expect(coord?.move_type).toBe("RegularMove")
  coord = coord as RegularMove;

  expect(coord.moved_piece).toBe(Knight)
  expect(coord.position.x).toBe(4)
  expect(coord.position.y).toBe(3)
});

test("test_regular_move_disambiguation", () => {
  var coord = process_chess_coord("Nde4");
  expect(coord?.move_type).toBe("RegularMove")
  coord = coord as RegularMove;

  expect(coord.moved_piece).toBe(Knight)
  expect(coord.position.x).toBe(4)
  expect(coord.position.y).toBe(3)
  expect(coord.disambiguation?.type).toBe("column");
  expect((coord.disambiguation as Column).val).toBe(3);
})

test("test_regular_move_disambiguation_2", () => {
  var coord = process_chess_coord("Nd2e4");
  coord = coord as RegularMove;
  expect(coord.disambiguation?.type).toBe("point")
  expect((coord.disambiguation as Point).col).toBe(3)
  expect((coord.disambiguation as Point).row).toBe(1)
})