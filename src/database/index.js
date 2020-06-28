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
        // docker run --name dbmongo -p 27017:27017 -d -t mongo
        this.mongoConnection = mongoose.connect(process.env.DB_MONGO_URL, {
            useNewUrlParser: true,
            useFindAndModify: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
    }
}

export default new Database();
