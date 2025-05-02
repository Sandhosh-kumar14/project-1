import express from 'express';
import { 
  getTasks, 
  createTask, 
  getTask, 
  updateTask, 
  deleteTask, 
  addComment 
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get all tasks and create a new task
router.route('/')
  .get(getTasks)
  .post(createTask);

// Get, update, and delete a specific task
router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// Add a comment to a task
router.post('/:id/comments', addComment);

export default router;