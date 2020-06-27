import AppointmentsModel from './../models/Appointments.model';
import UserModel from './../models/User.model';
import FileModel from './../models/File.model';
import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

class AppointmentsController {
    async index(req, res) {
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required(),
        });

        const { provider_id, date } = req.body;
        const { page = 1 } = req.query;

        const appointments = await AppointmentsModel.findAll({
            where: {
                user_id: req.userId,
                canceled_at: null,
            },
            attributes: ['id', 'date'],
            order: ['date'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: UserModel,
                    as: 'provider',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: FileModel,
                            as: 'avatar',
                            attributes: ['id', 'path', 'url'],
                        },
                    ],
                },
            ],
        });

        return res.status(200).json(appointments);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required(),
        });

        if (!(await schema.isValid(req.body)))
            return res.status(400).json({ error: 'Validation fails' });

        const { provider_id, date } = req.body;
        const { userId: user_id } = req;
        /**
         *  Check if provider is a provider
         */
        const isProvider = await UserModel.findOne({
            where: {
                id: provider_id,
                provider: true,
            },
            attributes: ['id', 'provider'],
        });

        if (!isProvider)
            return res.status(401).json({
                error: 'You can only create appointments with providers',
            });

        /**
         * Check for past dates
         */
        const hourStart = startOfHour(parseISO(date));
        console.log(hourStart);

        if (isBefore(hourStart, new Date()))
            return res
                .status(400)
                .json({ error: 'Past dates are not permitted' });

        /**
         * Check date availability
         */
        const checkAvailability = await AppointmentsModel.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart,
            },
            attributes: ['id', 'date'],
        });

        if (checkAvailability)
            return res.status(401).json({
                error: 'Appointment date is not available',
            });

        const appointments = await AppointmentsModel.create({
            user_id,
            provider_id,
            date: hourStart,
        });

        return res.status(200).json(appointments);
    }
}

export default new AppointmentsController();
