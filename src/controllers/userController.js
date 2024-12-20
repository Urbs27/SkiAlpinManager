const User = require('../models/user');

const getUserById = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }
  
  try {
    const user = await User.getById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  try {
    await User.update(id, userData);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating user' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deactivate(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser
}; 