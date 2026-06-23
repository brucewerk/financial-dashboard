// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acesso negado. Token inválido.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bruce_finance_secret_key_2024');
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};