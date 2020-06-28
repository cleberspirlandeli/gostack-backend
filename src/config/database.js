module.exports = {
    dialect: process.env.DB_PGS_DIALECT,
    host: process.env.DB_PGS_HOST,
    username: process.env.DB_PGS_USERNAME,
    password: process.env.DB_PGS_PASSWORD,
    database: process.env.DB_PGS_DATABASE,
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
    },
};

// docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres
// docker run --name database -e POSTGRES_PASSWORD=docker -p 543:5432 -d postgres:11
