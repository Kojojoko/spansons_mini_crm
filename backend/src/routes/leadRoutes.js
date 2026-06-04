const express = require('express');
const router = express.Router();
const {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  patchLeadStatus
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // protect all lead routes

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .put(updateLead)
  .delete(deleteLead);

router.route('/:id/status')
  .patch(patchLeadStatus);

module.exports = router;
