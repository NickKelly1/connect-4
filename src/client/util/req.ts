import { ICreateGameDto } from "../../common/http/create-game-dto.interface";
import { Http } from "./http"

export const Req = {
  async createGame(): Promise<ICreateGameDto> {
    const result = await Http.post<ICreateGameDto>('/api/games');
    return result;
  },
  //
}
