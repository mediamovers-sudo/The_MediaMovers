const prisma = require('../models/prisma');

const DEFAULT_ADVISOR_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';

// Public: GET /api/advisors (ordered by sortOrder)
const getAdvisors = async (req, res, next) => {
  try {
    const advisors = await prisma.advisor.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return res.status(200).json(advisors);
  } catch (err) {
    console.error('[Advisor Route Error] GET /api/advisors failed:', err.message || err);
    next(err);
  }
};

// Admin: POST /api/advisors
const createAdvisor = async (req, res) => {
  try {
    const { name, designation, department, message, photoUrl, email, linkUrl, sortOrder } = req.body;

    if (!name || !name.trim() || !designation || !designation.trim()) {
      return res.status(400).json({ error: 'Name and designation are required fields.' });
    }

    const cleanPhotoUrl = (photoUrl && photoUrl.trim()) ? photoUrl.trim() : DEFAULT_ADVISOR_PHOTO;
    const cleanSortOrder = (sortOrder !== undefined && !isNaN(parseInt(sortOrder, 10))) ? parseInt(sortOrder, 10) : 0;

    const advisor = await prisma.advisor.create({
      data: {
        name: name.trim(),
        designation: designation.trim(),
        department: (department && department.trim()) ? department.trim() : null,
        message: (message && message.trim()) ? message.trim() : null,
        photoUrl: cleanPhotoUrl,
        email: (email && email.trim()) ? email.trim() : null,
        linkUrl: (linkUrl && linkUrl.trim()) ? linkUrl.trim() : null,
        sortOrder: cleanSortOrder
      }
    });

    console.log(`[Advisor Route Success] POST /api/advisors created advisor ID ${advisor.id}`);
    return res.status(201).json(advisor);
  } catch (err) {
    console.error('[Advisor Route Error] POST /api/advisors failed:', err.message || err);
    return res.status(500).json({
      error: 'Failed to create advisor: ' + (err.message || 'Unknown database error')
    });
  }
};

// Admin: PUT /api/advisors/:id
const updateAdvisor = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid advisor ID: must be an integer.' });
  }

  try {
    const { name, designation, department, message, photoUrl, email, linkUrl, sortOrder } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: 'Name cannot be empty.' });
      updateData.name = name.trim();
    }
    if (designation !== undefined) {
      if (!designation.trim()) return res.status(400).json({ error: 'Designation cannot be empty.' });
      updateData.designation = designation.trim();
    }
    if (department !== undefined) updateData.department = department.trim() ? department.trim() : null;
    if (message !== undefined) updateData.message = message.trim() ? message.trim() : null;
    if (photoUrl !== undefined) {
      updateData.photoUrl = photoUrl.trim() ? photoUrl.trim() : DEFAULT_ADVISOR_PHOTO;
    }
    if (email !== undefined) updateData.email = email.trim() ? email.trim() : null;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl.trim() ? linkUrl.trim() : null;
    if (sortOrder !== undefined) {
      updateData.sortOrder = isNaN(parseInt(sortOrder, 10)) ? 0 : parseInt(sortOrder, 10);
    }

    const updated = await prisma.advisor.update({
      where: { id },
      data: updateData
    });

    console.log(`[Advisor Route Success] PUT /api/advisors/${id} updated advisor`);
    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: `Advisor not found with ID ${id}.` });
    }
    console.error(`[Advisor Route Error] PUT /api/advisors/${id} failed:`, err.message || err);
    return res.status(500).json({
      error: 'Failed to update advisor: ' + (err.message || 'Unknown database error')
    });
  }
};

// Admin: DELETE /api/advisors/:id
const deleteAdvisor = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid advisor ID: must be an integer.' });
  }

  try {
    await prisma.advisor.delete({
      where: { id }
    });

    console.log(`[Advisor Route Success] DELETE /api/advisors/${id} deleted advisor`);
    return res.status(200).json({ success: true, message: 'Advisor deleted successfully.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: `Advisor not found with ID ${id}.` });
    }
    console.error(`[Advisor Route Error] DELETE /api/advisors/${id} failed:`, err.message || err);
    return res.status(500).json({
      error: 'Failed to delete advisor: ' + (err.message || 'Unknown database error')
    });
  }
};

module.exports = {
  getAdvisors,
  createAdvisor,
  updateAdvisor,
  deleteAdvisor
};

