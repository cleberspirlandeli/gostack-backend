import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import databaseConfig from './../config/database';

import User from './../app/models/User.model';
import File from './../app/models/File.model';
import Appointments from './../app/models/Appointments.model';

const models = [User, File, Appointments];

class Database {
    constructor() {
        this.init();
        this.mongo();
    }

    init() {
        this.connection = new Sequelize(databaseConfig);
        models
            .map((model) => model.init(this.connection))
            .map(
                (model) =>
                    model.associate && model.associate(this.connection.models)
            );
    }

    mongo() {
        this.mongoConnection = mongoose.connect(
            'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false',
            //'mongodb://localhost:27027/gobarber',
            {
                useNewUrlParser: true,
                useFindAndModify: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
            }
        );
    }
}

export default new Database();
