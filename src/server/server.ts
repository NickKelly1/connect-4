import http from 'http';
import SocketIO from 'socket.io';
import compression from 'compression';
import express, { Router, ErrorRequestHandler } from 'express';
import { Config } from './config';
import fs from 'fs';
import { wss } from './wss';
import { logger, setLogger } from '../common/fn/logger.fn';
import { Util } from '../common/fn/util.fn';
import { createStore } from './store';
import { serverLogger, serverLoggerStream } from './server-logger';
import { nanoid } from 'nanoid';
import { Game } from './game.fn';
import { Res } from './res';
import { apiRoutes } from './api-routes';
import morgan from 'morgan';
import path from 'path';

setLogger(serverLogger);

async function run() {
  const store = await createStore();

  const app = express();

  app.use(morgan('dev', { stream: serverLoggerStream, }));
  app.use(compression());
  app.use(express.json());
  app.use('/api', apiRoutes(store));

  const server = http.createServer(app);
  const io = wss(new SocketIO.Server(), store);
  io.attach(server);

  server.on('listening', () => logger.info(`Server listening on: ${Util.pretty(server.address())}`));
  server.on('error', (error: Error) => logger.error(`Server error: ${Util.pretty(Util.errorToJson(error))}`));

  app.use(express.static(Config.DIR_PUBLIC));
  app.use(express.static(Config.DIR_DIST_CLIENT));
  app.get('*', (req, res) => res.sendFile(path.normalize(path.resolve(Config.DIR_DIST_CLIENT, 'index.html'))));

  // handle error
  app.use(function (err, req, res, next) {
    let _err: object;
    if (err instanceof Error) { _err = Util.errorToJson(err); }
    else { _err = err; }
    logger.error(`Internal server exception: ${Util.pretty(_err)}`);
    res.status(500).json({ message: 'Internal server exception', });
  } as ErrorRequestHandler);

  server.listen(4000, '0.0.0.0');
}

run();
