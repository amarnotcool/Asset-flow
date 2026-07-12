export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // TODO: Validate user against Postgres users table and verify password hash
    
    // Mock response for now
    res.json({ 
      token: 'mock-jwt-token', 
      user: { id: 1, email, name: email.split('@')[0], role: 'Admin', department_id: null } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // TODO: Insert new employee into users table
    
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
