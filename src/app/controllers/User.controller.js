import UserModel from './../models/User.model';
import * as Yup from 'yup';
import { password } from '../../config/database';

class UserController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6),
        });

        if (!(await schema.isValid(req.body)))
            return res.status(400).json({ error: 'Validation fails' });

        const userExists = await UserModel.findOne({
            where: { email: req.body.email },
            select: {},
        });

        if (userExists) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        const { id, name, email, provider } = await UserModel.create(req.body);
        res.status(201).json({ id, name, email, provider });
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            password: Yup.string().required().min(6),
            oldPassword: Yup.string().min(6),
            password: Yup.string()
                .min(6)
                .when('oldPassword', (oldPassword, field) =>
                    oldPassword ? field.required() : field
                ),
            confirmPassword: Yup.string().when('password', (password, field) =>
                password ? field.required().oneOf([Yup.ref('password')]) : field
            ),
        });

        if (!(await schema.isValid(req.body)))
            return res.status(400).json({ error: 'Validation fails' });

        const { email, oldPassword } = req.body;

        const user = await UserModel.findByPk(req.userId);

        if (email !== user.email) {
            const userExists = await UserModel.findOne({
                where: { email },
                select: {},
            });

            if (userExists)
                return res.status(400).json({ error: 'User already exists.' });
        }

        if (oldPassword && !(await user.checkPassword(oldPassword)))
            return res.status(401).json({ error: 'Password does not match' });

        const { id, name, provider } = await user.update(req.body);
        res.status(200).json({ id, name, email, provider });
    }
}

export default new UserController();
