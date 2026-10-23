const AuditLog = require('../models/AuditLog');

const logAudit = async ({ user, action, entity, entityId, details, req }) => {
  try {
    const ipAddress = req ? req.ip || req.connection.remoteAddress : null;
    await AuditLog.create({
      user: user ? user._id : null,
      action,
      entity,
      entityId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = { logAudit };
