import 'dotenv/config';
import express from 'express';
import path from 'path';
import routes from './routes';
import './database';

class App {
    constructor() {
        this.server = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.server.use(express.json());
        this.server.use(
            '/public',
            express.static(path.resolve(__dirname, '..', 'temp'))
        );
    }

    routes() {
        this.server.use(routes);
    }
}

export default new App().server;
