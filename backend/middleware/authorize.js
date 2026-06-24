const { supabase, toApiUser } = require('../lib/supabase');

const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { data: userRow, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.userId)
        .maybeSingle();

      if (error) {
        return res.status(500).json({ message: 'Authorization failed', error: error.message });
      }

      if (!userRow) {
        return res.status(401).json({ message: 'User not found for this token' });
      }

      const user = toApiUser(userRow);

      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
      };

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions for this action' });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ message: 'Authorization failed', error: error.message });
    }
  };
};

module.exports = authorize;
