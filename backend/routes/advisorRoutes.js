const express = require('express');
const router = express.Router();
const {
  getAdvisors,
  createAdvisor,
  updateAdvisor,
  deleteAdvisor
} = require('../controllers/advisorController');
const { requireAdmin } = require('../middleware/auth');

// Public route: GET /api/advisors (ordered by sortOrder)
router.get('/', getAdvisors);

// Admin-only routes
router.post('/', requireAdmin, createAdvisor);
router.put('/:id', requireAdmin, updateAdvisor);
router.delete('/:id', requireAdmin, deleteAdvisor);

module.exports = router;

