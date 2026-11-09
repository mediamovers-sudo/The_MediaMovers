const prisma = require('../models/prisma');
const { JOIN_OPEN } = require('../config/env');

// Public: POST /api/applications
const submitApplication = async (req, res, next) => {
  try {
    if (!JOIN_OPEN) {
      return res.status(403).json({
        error: 'Applications are closed'
      });
    }

    const { name, email, department, portfolioLink, message } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ error: 'Name, email, and department are required fields.' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const application = await prisma.application.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: department.trim(),
        portfolioLink: portfolioLink ? portfolioLink.trim() : null,
        message: message ? message.trim() : null,
        status: 'new'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Your application has been received by the Callboard desk.',
      id: application.id
    });
  } catch (err) {
    next(err);
  }
};

// Admin: GET /api/applications
const getApplications = async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(applications);
  } catch (err) {
    next(err);
  }
};

// Admin: PATCH /api/applications/:id
const updateApplicationStatus = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid application ID: must be an integer.' });
  }

  const { status } = req.body;
  const validStatuses = ['new', 'reviewed', 'accepted', 'rejected'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    const updated = await prisma.application.update({
      where: { id },
      data: { status }
    });

    console.log(`[Application Route Success] PATCH /api/applications/${id} status updated to ${status}`);
    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: `Application not found with ID ${id}.` });
    }
    console.error(`[Application Route Error] PATCH /api/applications/${id} failed:`, err.message || err);
    return res.status(500).json({
      error: 'Failed to update application status: ' + (err.message || 'Unknown database error')
    });
  }
};

module.exports = {
  submitApplication,
  getApplications,
  updateApplicationStatus
};
