export default {
    secret: process.env.AUTH_SECRET,
    expiresIn: '1d',
    tokenVersion: process.env.TOKEN_VERSION,
};
