import UserModel from './../models/User.model';
import NotificationsSchema from './../schema/Notification.schema';

class NotificationController {
    async index(req, res) {
        /**
         *  Check if provider is a provider
         */
        const checkIsProvider = await UserModel.findOne({
            where: {
                id: req.userId,
                provider: true,
            },
            attributes: ['id', 'provider'],
        });

        if (!checkIsProvider)
            return res.status(401).json({
                error: 'Only provider can load notifications',
            });

        const notifications = await NotificationsSchema.find({
            user: req.userId,
        })
            .sort({ createdAt: 'desc' })
            .limit(20);

        return res.status(200).json(notifications);
    }

    async update(req, res) {
        const { id } = req.params;

        const notification = await NotificationsSchema.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        res.status(200).json(notification);
    }
}

export default new NotificationController();
