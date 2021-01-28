import { ICreateGameDto } from "../common/http/create-game-dto.interface";

export const Res = {
  /**
   * Create a CreateGame response
   *
   * @param game_id
   */
  createGameDto(game_id: string): ICreateGameDto {
    const response: ICreateGameDto = {
      game_id,
    };
    return response;
  }
}