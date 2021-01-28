import { Cell } from './cell.fn';
import { IBoardDto } from '../interface/board-dto.interface';
import { IBoard } from '../interface/board.interface';
import { ICoordinate } from '../interface/coordinate.interface';
import { ICoordinateDto } from '../interface/coordinate-dto.interface';
import { COMPASS } from '../enum/compass.enum';
import { ICell } from '../interface/cell.interface';
import { Util } from './util.fn';

export const Board = {
  /**
   * Get the index of a coordinate
   */
  index(board: Pick<IBoard | IBoardDto, 'rows' | 'cols'>, coordinate: ICoordinate): number {
    const { x, y, } = coordinate;
    const { rows, cols, } = board;
    if (y >= board.rows) throw new RangeError(`y cannot be gte ${board.rows}`);
    if (x >= board.cols) throw new RangeError(`x cannot be gte ${board.cols}`);
    return board.cols * y + x;
  },

  /**
   * Get the coordinate of an index
   */
  coordinate(board: Pick<IBoard | IBoardDto, 'rows' | 'cols'>, index: number): ICoordinate {
    const { cols, rows, } = board;
    const perCol = cols;
    const perRow = rows;
    const col = index % perCol;
    const row = Math.floor(index / (perRow || 1));
    return { x: col, y: row };
  },


  isInBounds(board: Pick<IBoard | IBoardDto, 'rows' | 'cols'>, coordinate: ICoordinate | ICoordinateDto): boolean {
    const { x, y } = coordinate;
    const { cols, rows } = board;
    if (x < 0 || x >= cols) return false;
    if (y < 0 || y >= rows) return false;
    return true;
  },

  /**
   * Transform the Board to a BoardDto
   *
   * @param board
   */
  dto(board: IBoard): IBoardDto {
    const dto: IBoardDto = {
      winning_length: board.winning_length,
      cols: board.cols,
      rows: board.rows,
      cells: board.cells.map(Cell.dto),
    };
    return dto;
  },

  /**
   * Get a slice around a point
   *
   * @param board
   * @param target
   * @param direction
   */
  slice(board: IBoard, target: number | ICoordinate, direction: COMPASS): ICell[] {
    let targetCoordinate: ICoordinate;
    if (typeof target === 'number') {
      targetCoordinate = Board.coordinate(board, target);
    } else {
      targetCoordinate = target;
    }

    const dx = direction === COMPASS.NORTH ? 0
      : direction === COMPASS.NORTH_EAST ? +1
      : direction === COMPASS.EAST ? +1
      : direction === COMPASS.SOUTH_EAST ? +1
      : direction === COMPASS.SOUTH ? 0
      : direction === COMPASS.SOUTH_WEST ? -1
      : direction === COMPASS.WEST ? -1
      : direction === COMPASS.NORTH_WEST ? -1
      : null;
    if (dx === null) throw new RangeError(`Unhandled direction: ${String(direction)}`);

    const dy = direction === COMPASS.NORTH ? +1
      : direction === COMPASS.NORTH_EAST ? +1
      : direction === COMPASS.EAST ? 0
      : direction === COMPASS.SOUTH_EAST ? -1
      : direction === COMPASS.SOUTH ? -1
      : direction === COMPASS.SOUTH_WEST ? -1
      : direction === COMPASS.WEST ? 0
      : direction === COMPASS.NORTH_WEST ? +1
      : null;
    if (dy === null) throw new RangeError(`Unhandled direction: ${String(direction)}`);

    const indexes: number[] = [];
    let walk: ICoordinate = {
      x: targetCoordinate.x,
      y: targetCoordinate.y,
    };
    while (Board.isInBounds(board, walk)) {
      indexes.push(Board.index(board, walk));
      walk = { x: walk.x + dx, y: walk.y + dy, };
    }
    walk = { x: targetCoordinate.x, y: targetCoordinate.y, };
    while (Board.isInBounds(board, walk)) {
      indexes.push(Board.index(board, walk));
      walk = { x: walk.x - dx, y: walk.y - dy, };
    }
    const cells: ICell[] = indexes
      // sort in ascending...
      .sort((a, b) => a - b)
      .map(index => board.cells[index]);
    return cells;
  },


  /**
   * Check for the victory condition around a point
   *
   * @param board
   * @param targetIndex
   */
  findVictoriesAround(board: IBoard, targetIndex: number): ICell[][] {
    const target = board.cells[targetIndex];
    if (target.p === null) return [];
    const targetCoordinate = Board.coordinate(board, targetIndex);
    const sliceRow = Board.slice(board, targetCoordinate, COMPASS.EAST);
    const sliceCol = Board.slice(board, targetCoordinate, COMPASS.NORTH);
    const slice45 = Board.slice(board, targetCoordinate, COMPASS.NORTH_EAST);
    const slice135 = Board.slice(board, targetCoordinate, COMPASS.SOUTH_EAST);

    let running: ICell[];
    const victories: ICell[][] = [];

    // console.log('=========');
    // console.log('=========');
    // console.log('---------');
    // function printer(row: ICell[]): object {
    //   return row.map(r => `(${r.c.x}, ${r.c.y})`);
    // }
    // console.log(Util.pretty({
    //   sliceRow: printer(sliceRow),
    //   sliceCol: printer(sliceCol),
    //   slice45: printer(slice45),
    //   slice135: printer(slice135),
    // }));

    [sliceRow, sliceCol, slice45, slice135].forEach(slice => {
      // reset running
      running = [];
      slice.forEach(cell => {
        // hit
        if (cell.p === target.p) return void running.push(cell);
        // no hit
        if (running.length >= board.winning_length) {
          // store victory... then reset
          victories.push(running);
        }
        if (running.length) {
          // reset running
          running = [];
        } else {
          // no need to reset
        }
      })
      if (running.length >= board.winning_length) {
        victories.push(running);
      }
    });

    return victories;
  },
};
