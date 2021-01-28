import { ICellDto } from "../interface/cell-dto.interface";
import { ICell } from "../interface/cell.interface";
import { Coordinate } from './coordinate.fn';

export const Cell = {
  /**
   * Transform the Cell to a CellDto
   *
   * @param cell
   */
  dto(cell: ICell): ICellDto {
    const dto: ICellDto = {
      c: Coordinate.dto(cell.c),
      i: cell.i,
      p: cell.p,
    }
    return dto;
  }
}
