import express from 'express';
import { 
  getUsers, 
  getUser, 
  updateUser, 
  updateUserRole 
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get all users
router.get('/', getUsers);

// Get, update a specific user
router.route('/:id')
  .get(getUser)
  .put(updateUser);

// Update user role (admin only)
router.put('/:id/role', updateUserRole);

export default router;