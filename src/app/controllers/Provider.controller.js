import UserModel from './../models/User.model';
import FileModel from './../models/File.model';

class ProviderController {
    async index(req, res) {
        const provider = await UserModel.findAll({
            where: {
                provider: true,
            },
            attributes: ['id', 'name', 'email', 'avatar_id'],
            include: [
                {
                    model: FileModel,
                    as: 'avatar',
                    attributes: ['name', 'path', 'url'],
                },
            ],
        });

        res.status(200).json(provider);
    }
}

export default new ProviderController();
