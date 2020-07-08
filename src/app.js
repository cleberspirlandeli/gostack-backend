import 'dotenv/config';
import express from 'express';
import path from 'path';
import Youch from 'youch';
import helmet from 'helmet';
import redis from 'redis';
import RateLimit from 'express-rate-limit';
import RateLimitRedis from 'rate-limit-redis';
import * as Sentry from '@sentry/node';
import 'express-async-errors';
import routes from './routes';
import sentryConfig from './config/sentry';
import './database';

class App {
    constructor() {
        this.server = express();

        Sentry.init(sentryConfig);
        this.middlewares();
        this.routes();
        this.exceptionHandler();
    }

    middlewares() {
        this.server.use(Sentry.Handlers.requestHandler());
        this.server.use(helmet());
        this.server.use(express.json());
        this.server.use(
            '/public',
            express.static(path.resolve(__dirname, '..', 'temp'))
        );

        if (process.env.NODE_ENV !== 'developer') {
            this.server.use(
                new RateLimit({
                    store: new RateLimitRedis({
                        client: redis.createClient({
                            host: process.env.REDIS_HOST,
                            port: process.env.REDIS_PORT,
                        }),
                    }),
                    windowMs: 1000 * 60 * 15, // 15min,
                    max: 100,
                })
            );
        }
    }

    routes() {
        this.server.use(routes);
        this.server.use(Sentry.Handlers.errorHandler());
    }

    exceptionHandler() {
        this.server.use(async (err, req, res, next) => {
            const errors = await new Youch(err, req).toJSON();
            res.status(500).json(errors);
            // TODO insert errors in MongoDB and return ID from client
        });
    }
}

export default new App().server;
