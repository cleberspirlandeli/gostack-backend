import jwt from 'jsonwebtoken';
import authConfig from './../../config/auth';
import UserModel from './../models/User.model';
import * as Yup from 'yup';

class SessionController {
    async store(req, res) {
        const schema = Yup.object().shape({
            email: Yup.string().email().required(),
            password: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body)))
            return res.status(400).json({ error: 'Validation fails' });

        const { email, password } = req.body;

        const user = await UserModel.findOne({
            where: { email },
            select: {},
        });

        if (!user) return res.status(401).json({ error: 'User not found.' });

        if (!(await user.checkPassword(password)))
            return res.status(401).json({ error: 'Password does not match.' });

        const { id, name } = user;
        res.status(201).json({
            user: {
                id,
                name,
                email,
            },
            token: jwt.sign(
                { id, name, email, tokenVersion: authConfig.tokenVersion },
                authConfig.secret,
                {
                    expiresIn: authConfig.expiresIn,
                }
            ),
        });
    }
}

export default new SessionController();
