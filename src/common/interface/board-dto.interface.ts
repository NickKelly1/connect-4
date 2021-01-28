import { ICellDto } from "./cell-dto.interface";
import { ICell } from "./cell.interface";

export interface IBoardDto {
  winning_length: number;
  cells: ICellDto[];
  rows: number;
  cols: number;
} 