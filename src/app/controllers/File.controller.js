import FileModel from './../models/File.model';

class FileController {
    async store(req, res) {
        const { originalname: name, filename: path } = req.file;

        const file = await FileModel.create({
            name,
            path,
        });

        return res.json(file);
    }
}

export default new FileController();
