module.exports = {
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'postgres',
    database: 'crush',
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
    },
};

// docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres
// docker run --name database -e POSTGRES_PASSWORD=docker -p 5433:5432 -d postgres:11
