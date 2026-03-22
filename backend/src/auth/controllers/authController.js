const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authService.register(email, password);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await authService.login(email, password);
    return res.status(200).json({ token });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

const verify = async (req, res) => {
  try {
    const payload = await authService.verify(req);

    if (!payload) {
      return res.status(401).json({ error: "Payload empty" });
    }

    return res.status(200).json(payload);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

module.exports = { register, login, verify };