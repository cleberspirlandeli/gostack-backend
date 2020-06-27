import Sequelize from 'sequelize';
import databaseConfig from './../config/database';

import User from './../app/models/User.model';
import File from './../app/models/File.model';
import Appointments from './../app/models/Appointments.model';

const models = [User, File, Appointments];

class Database {
    constructor() {
        this.init();
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
}

export default new Database();
