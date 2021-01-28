import { IGameId } from "./game-id.interface";
import { IMatchDto } from "./match-dto.interface";

export interface IClientState {
  matchesById: Record<IGameId, IMatchDto>;
  matches: IGameId[];
  user_id: string;
  user_name: string;
}
