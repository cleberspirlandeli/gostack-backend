import {
    startOfDay,
    endOfDay,
    parseISO,
    setHours,
    setMinutes,
    setSeconds,
    format,
    isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import AppointmentsModel from './../models/Appointments.model';

class Available {
    async index(req, res) {
        const { date } = req.query;
        const { providerId } = req.params;

        if (!date || !providerId) {
            res.status(400).json({ error: 'Invalid date' });
        }

        const searchDate = Number(date);

        const appointments = await AppointmentsModel.findAll({
            where: {
                provider_id: providerId,
                canceled_at: null,
                date: {
                    [Op.between]: [
                        startOfDay(searchDate),
                        endOfDay(searchDate),
                    ],
                },
            },
        });

        const schedule = [
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
        ];

        const available = schedule.map((time) => {
            const [hour, minute] = time.split(':');
            const value = setSeconds(
                setMinutes(setHours(searchDate, hour), minute),
                0
            );

            return {
                time,
                value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
                available:
                    isAfter(value, new Date()) &&
                    !appointments.find((x) => format(x.date, 'HH:mm') == time),
            };
        });

        res.status(200).json(available);
    }
}

export default new Available();
