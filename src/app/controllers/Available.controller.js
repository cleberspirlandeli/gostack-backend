class Available {
    async index(req, res) {
        res.status(200).json('ok');
    }
}

export default new Available();
