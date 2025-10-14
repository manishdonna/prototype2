// server/routes/auth.js
const express = require('express');
const router = express.Router();
const fs = require('fs');

const usersFile = './data/users.json';

// Read users from file
const getUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Save users to file
const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// Login route
router.post('/login', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const users = getUsers();
    let user = users.find(u => u.email === email);
    
    // Auto-register new users
    if (!user) {
      user = {
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveUsers(users);
    }
    
    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Register route
router.post('/register', (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const users = getUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    const newUser = {
      email,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    res.json({
      success: true,
      user: {
        email: newUser.email,
        name: newUser.name
      },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

module.exports = router;