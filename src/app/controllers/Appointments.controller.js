import AppointmentsModel from './../models/Appointments.model';
import UserModel from './../models/User.model';
import FileModel from './../models/File.model';
import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import NotificationSchema from './../schema/Notification.schema';
import pt from 'date-fns/locale/pt';
import Mail from './../../lib/Mail';

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

        /**
         * Notify appointment provider
         */
        const formatDate = format(
            hourStart,
            "'dia' dd 'de' MMMM', às' H:mm'h'",
            { locale: pt }
        );
        await NotificationSchema.create({
            content: `Novo agendamento de ${req.userName} para o ${formatDate}`,
            user: provider_id,
        });

        return res.status(200).json(appointments);
    }

    async delete(req, res) {
        const { id } = req.params;
        const appointment = await AppointmentsModel.findByPk(id, {
            include: [
                {
                    model: UserModel,
                    as: 'provider',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: UserModel,
                    as: 'user',
                    attributes: ['id', 'name'],
                },
            ],
        });

        if (appointment.user_id !== req.userId)
            return res.status(401).json({
                error: `You don't have permission to cancel this appointment`,
            });

        const dateWithSub = subHours(appointment.date, 2);

        if (isBefore(dateWithSub, new Date()))
            return res.status(401).json({
                error: `You can omly cancel appointments 2 hours in advance`,
            });

        appointment.canceled_at = new Date();
        await appointment.save();

        await Mail.sendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>`,
            subject: 'Agendamento cancelado',
            template: 'cancellation',
            context: {
                provider: appointment.provider.name,
                user: appointment.user.name,
                date: format(
                    appointment.date,
                    "'dia' dd 'de' MMMM', às' H:mm'h'",
                    {
                        locale: pt,
                    }
                ),
            },
        });

        return res.status(200).json(appointment);
    }
}

export default new AppointmentsController();
