const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const ProjectMembership = require('./models/ProjectMembership');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- PA2: Signup Route ---
app.post('/api/signup', async (req, res) => {
  const { f_name, l_name, username, password } = req.body;

  // Validation: Check empty fields
  if (!f_name || !l_name || !username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Create and save new user
    const newUser = new User({ f_name, l_name, username, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error("Signup error details:", error);
    res.status(500).json({ message: error.message || 'Server error during signup.' });
  }
});

// --- PA2: Login Route ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Validation: Check empty fields
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Username does not exist.' });
    }

    // Compare passwords
    if (user.password !== password) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    console.error("Login error details:", error);
    res.status(500).json({ message: error.message || 'Server error during login.' });
  }
});

// --- PA3: Get All Users (Needed for Project Lead dropdown & adding members) ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'f_name l_name username');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// --- PA3: Create Project ---
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, status, project_lead_id } = req.body;
    
    // Validation: Required fields
    if (!name || !description || !status || !project_lead_id) {
      return res.status(400).json({ error: 'All project fields are required.' });
    }

    // Validation: Project Lead exists
    const lead = await User.findById(project_lead_id);
    if (!lead) {
      return res.status(404).json({ error: 'Selected Project Lead does not exist.' });
    }

    const newProject = new Project({ name, description, status, project_lead_id });
    await newProject.save();

    // Automatically add the project lead as a member
    await ProjectMembership.create({
      project_id: newProject._id,
      user_id: project_lead_id
    });

    res.status(201).json({ message: 'Project created successfully!', project: newProject });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// --- PA3: Get All Projects (with Project Lead populated) ---
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().populate('project_lead_id', 'f_name l_name username');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// --- PA3: Get Members of a Specific Project ---
app.get('/api/projects/:id/members', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('project_lead_id', 'f_name l_name username');
    if (!project) return res.status(404).json({ error: 'Project does not exist.' });

    const memberships = await ProjectMembership.find({ project_id: req.params.id }).populate('user_id', 'f_name l_name username');
    const members = memberships.map(m => m.user_id);
    
    res.json({ project, members });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// --- PA3: Add Member to Project ---
app.post('/api/projects/:id/members', async (req, res) => {
  try {
    const { user_id } = req.body;
    const project_id = req.params.id;

    const project = await Project.findById(project_id);
    if (!project) return res.status(404).json({ error: 'Project does not exist.' });

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ error: 'User does not exist.' });

    // Validation: Duplicate membership check
    const existing = await ProjectMembership.findOne({ project_id, user_id });
    if (existing) {
      return res.status(400).json({ error: 'User is already a member of this project.' });
    }

    await ProjectMembership.create({ project_id, user_id });
    res.status(201).json({ message: 'Member added successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// --- PA3: Remove Member from Project ---
app.delete('/api/projects/:id/members/:userId', async (req, res) => {
  try {
    const { id: project_id, userId: user_id } = req.params;

    const project = await Project.findById(project_id);
    if (!project) return res.status(404).json({ error: 'Project does not exist.' });

    // Validation: Cannot remove the project lead
    if (project.project_lead_id.toString() === user_id) {
      return res.status(400).json({ error: 'Cannot remove the current Project Lead.' });
    }

    const deleted = await ProjectMembership.findOneAndDelete({ project_id, user_id });
    if (!deleted) return res.status(404).json({ error: 'Membership not found.' });

    res.json({ message: 'Member removed successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));