import express from 'express';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { authenticateToken } from '../middleware/authmiddleware.js';

import {
  register,
  login,
  logout,
  getProfile,
  getAllUsers,
  getUserById,
  updateProfile,
  deleteUser,
  forgotPassword,
  resetPassword,
} from '../controllers/authcontrollers.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/profile', authenticateToken, getProfile);
authRouter.get('/users', authenticateToken, cacheMiddleware(300), getAllUsers);
authRouter.get('/admin/users/:id', cacheMiddleware(300), getUserById); //ok
authRouter.get('/admin/users', cacheMiddleware(300), getAllUsers); //ok
authRouter.put('/admin/users/:id', updateProfile); //ok
authRouter.delete('/admin/users/:id', deleteUser); //ok
authRouter.post('/forgot-password', forgotPassword);
authRouter.put('/reset-password', resetPassword);

authRouter.put('/profile', authenticateToken, updateProfile);

export default authRouter;
