import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
const routes = new Router();

const upload = multer(multerConfig);

import authMiddlewares from './app/middlewares/auth.middleware';

import UserController from './app/controllers/User.controller';
import SessionController from './app/controllers/Session.controller';
import ProviderController from './app/controllers/Provider.controller';
import AppointmentsController from './app/controllers/Appointments.controller';
import SchedulesController from './app/controllers/Schedule.controller';

import FileController from './app/controllers/File.controller';

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddlewares);

routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);

routes.get('/appointments', AppointmentsController.index);
routes.post('/appointments', AppointmentsController.store);

routes.get('/schedules', SchedulesController.index);

routes.post('/uploads', upload.single('file'), FileController.store);

export default routes;
