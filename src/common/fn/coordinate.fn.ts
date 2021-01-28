import { ICoordinateDto } from "../interface/coordinate-dto.interface";
import { ICoordinate } from "../interface/coordinate.interface";

export const Coordinate = {
  /**
   * Transform the Coordinate to a CoordinateDto
   *
   * @param coordinate
   */
  dto(coordinate: ICoordinate): ICoordinateDto {
    const dto: ICoordinateDto = {
      _: null,
      x: coordinate.x,
      y: coordinate.y,
    };
    return dto;
  }
}