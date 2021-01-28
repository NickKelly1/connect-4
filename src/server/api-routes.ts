import { Router } from "express";
import { IObservable } from "../common/interface/observable.interface";
import { IServerState } from "../common/interface/server-state.interface";
import { Game } from "./game.fn";
import { Res } from "./res";

export function apiRoutes(store: IObservable<IServerState>): Router {
  const router = Router();

  router.post('/games', (req, res, next) => {
    const game = Game.create();
    const game_id = game.id;
    store.set((state) => {
      state.gameIds.push(game_id);
      state.gamesById[game_id] = game;
    });
    return res.status(200).json(Res.createGameDto(game_id));
  });

  return router;
}