import AppointmentsModel from '../models/Appointments.model';
import UserModel from '../models/User.model';
import FileModel from '../models/File.model';
import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

class ScheduleController {
    async index(req, res) {
        const checkUserProvider = await UserModel.findOne({
            where: {
                id: req.userId,
                provider: true,
            },
        });

        if (!checkUserProvider)
            res.status(401).json({ error: 'User is not a provider' });

        const { date } = req.query;
        const parsedDate = parseISO(date);

        const appointments = await AppointmentsModel.findAll({
            where: {
                provider_id: req.userId,
                canceled_at: null,
                date: {
                    [Op.between]: [
                        startOfDay(parsedDate),
                        endOfDay(parsedDate),
                    ],
                },
            },
            order: ['date'],
        });

        return res.status(200).json(appointments);
    }
}

export default new ScheduleController();
