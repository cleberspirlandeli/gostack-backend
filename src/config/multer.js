const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
// const aws = require('aws-sdk');
// const multerS3 = require('multer-s3');
const { extname } = require('path');

const storageTypes = {
    local: new multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, path.resolve(__dirname, '..', '..', 'temp'));
        },
        filename: function (req, file, callback) {
            crypto.randomBytes(16, (err, hash) => {
                if (err) callback(err);

                return callback(
                    null,
                    hash.toString('hex') + extname(file.originalname)
                );
            });
        },
    }),
    // s3: multerS3({
    //     s3: new aws.S3(),
    //     bucket: process.env.AWS_BUCKET,
    //     contentType: multerS3.AUTO_CONTENT_TYPE,
    //     acl: 'public-read',
    //     key: (req, file, callback) => {
    //         crypto.randomBytes(8, (err, hash) => {
    //             if (err) callback(err);

    //             let fileName = file.originalname.replace(/\s/g, '-'); // change space for hífen
    //             const [name, extension] = fileName.split('.');

    //             var today = new Date();
    //             var dd = String(today.getDate()).padStart(2, '0');
    //             var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    //             var yyyy = today.getFullYear();
    //             today = dd + mm + yyyy;

    //             const prefix = `__CRUSH_APP_${today}_${hash.toString('hex')}`;
    //             fileName = `${name}${prefix}.${extension}`;
    //             callback(null, fileName);
    //         });
    //     },
    // }),
};

module.exports = {
    dest: path.resolve(__dirname, '..', '..', 'temp'),
    storage: storageTypes[process.env.STORAGE_TYPES],
    fileFilter: function (req, file, callback) {
        const allowedMines = ['image/png', 'image/jpg', 'image/jpeg'];

        if (allowedMines.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error('Imagem inválida'));
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
};
