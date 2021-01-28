import { ICell } from "./cell.interface";

export interface IBoard {
  winning_length: number;
  cells: ICell[];
  rows: number;
  cols: number;
} 