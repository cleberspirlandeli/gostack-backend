import FileModel from './../models/File.model';

class FileController {
    async store(req, res) {
        if (!req.file)
            return res.status(400).json({ error: 'File not found.' });

        const { originalname: name, filename: path } = req.file;

        const file = await FileModel.create({
            name,
            path,
        });

        return res.json(file);
    }
}

export default new FileController();
