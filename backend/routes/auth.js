const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { createDemoAuthResponse, isDemoMode, supabase, toApiUser } = require('../lib/supabase');
const router = express.Router();

// Register (admin setup)
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name } = req.body;

    if (isDemoMode()) {
      return res.json(createDemoAuthResponse(email));
    }

    // Check if user exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUserError) {
      return res.status(500).json({ message: 'Server error', error: existingUserError.message });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const { count: existingUsers, error: countError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      return res.status(500).json({ message: 'Server error', error: countError.message });
    }

    const role = existingUsers === 0 ? 'owner' : 'admin';
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const { data: userRow, error: createError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: email.toLowerCase(),
          password_hash: passwordHash,
          role,
        },
      ])
      .select('*')
      .single();

    if (createError) {
      return res.status(400).json({ message: 'Error creating user', error: createError.message });
    }

    // Generate JWT
    const token = jwt.sign({ userId: userRow.id, role: userRow.role, email: userRow.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.json({ token, user: toApiUser(userRow) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    if (isDemoMode()) {
      return res.json(createDemoAuthResponse(email));
    }

    // Find user and select password field
    const { data: userRow, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    if (!userRow) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: userRow.id, role: userRow.role, email: userRow.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.json({ token, user: toApiUser(userRow) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    if (isDemoMode()) {
      return res.json({ user: { _id: req.userId, id: req.userId, name: 'Demo Owner', email: req.userEmail, role: req.userRole } });
    }

    const { data: userRow, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    if (!userRow) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: toApiUser(userRow),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
