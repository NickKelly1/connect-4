import { Game } from "./game.fn";
import { logger } from "../common/fn/logger.fn";
import { Util } from "../common/fn/util.fn";
import { IServerState } from "../common/interface/server-state.interface";
import fs from 'fs/promises';
import { Config } from "./config";
import { IData } from "../common/interface/data.interface";
import { IObservable } from "../common/interface/observable.interface";

const fsDebouncer = Util.createDebouncer(2000);

/**
 * Write data to filesystem
 *
 * @param next
 */
async function writeFs(next: IServerState): Promise<void> {
  const data: IData = {
    gameIds: next.gameIds,
    gamesById: next.gamesById,
    version: next.version,
  };
  const json = JSON.stringify(data, null, 2);
  fs
    .writeFile(Config.DATA_FILE, json, { encoding: 'utf-8' })
    .then(() => {
      logger.debug('Synced to fs...');
    })
    .catch((error) => {
      logger.error(`Errored syncing to fs... ${Util.pretty(Util.errorToJson(error))}`);
    })
}

/**
 * Read data from filesystem
 */
async function readFs(): Promise<IData> {
  try {
    let data: IData;
    try {
      const file = await fs.readFile(Config.DATA_FILE, { encoding: 'utf-8'})
      data = JSON.parse(file);
    } catch (error) {
      const exists = await fs.access(Config.DATA_FILE).then(() => true).catch(() => false)
      if (exists) throw error;
      // create new
      data = {
        gamesById: {},
        gameIds: [],
        version: 1,
      }
      await fs
        .writeFile(
          Config.DATA_FILE,
          JSON.stringify(data, null, 2),
          { encoding: 'utf-8' },
        );
    }
    return data;
  } catch (error) {
    logger.error(`Errored reading from fs... ${Util.pretty(Util.errorToJson(error))}`);
    throw error;
  }
}


export async function createStore(): Promise<IObservable<IServerState>> {
  // TODO: data migration...
  const data = await readFs();
  const store = Util.createObservable<IServerState>({
    userIds: [],
    usersById: {},
    connections: 0,
    gameIds: data.gameIds,
    gamesById: data.gamesById,
    version: data.version,
  });

  let _i = 0;

  store.subscribe(({ diff, next, prev }) => {
    logger.info(`--------------------- store-updated --------------------- (${_i += 1})`);
    logger.info(Util.pretty(diff));
    logger.info(`---------------------------------------------------------`);
  });

  // sync to database on update...
  store.subscribe(({ next }) => { fsDebouncer(() => writeFs(next)); });

  return store;
}