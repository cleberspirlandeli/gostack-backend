import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import * as Yup from 'yup';

import authConfig from './../../config/auth';

export default async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) res.status(401).json({ error: 'Token not provided' });

    const [, token] = authHeader.split(' ');

    try {
        const decoded = await promisify(jwt.verify)(token, authConfig.secret);

        req.userId = decoded.id;
        req.userName = decoded.name;
        req.userEmail = decoded.email;

        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalid' });
    }
};
