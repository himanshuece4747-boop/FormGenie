const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    let { username, email, password, role } = req.body;
    
    username = username?.trim();
    email = email?.trim();
    password = password?.trim();
    
    // Explicit Validation to prevent 500 crashes
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'User'
    });

    await user.save();

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, username, email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    
    email = email?.trim();
    password = password?.trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Invalid Credentials. Please reset your password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `http://localhost:5174/reset-password/${resetToken}`;
    
    // Simulate email
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    let info = await transporter.sendMail({
      from: '"FormGenie Security" <no-reply@formgenie.test>',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset: ${resetUrl}`,
    });

    console.log("Password Reset preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.json({ message: 'Password reset email sent (check backend console)' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
