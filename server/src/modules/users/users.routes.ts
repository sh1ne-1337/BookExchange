import { Router } from 'express';
import { UserRole } from '../../entities/user.entity.js';
import { authenticate, authorize } from '../../middlewares/authenticate.js';
import * as usersController from './users.controller.js';

export const adminUsersRouter = Router();

adminUsersRouter.use(authenticate, authorize(UserRole.Admin));

adminUsersRouter.get('/', usersController.list);
adminUsersRouter.post('/', usersController.create);
adminUsersRouter.patch('/:id', usersController.update);
adminUsersRouter.delete('/:id', usersController.remove);
