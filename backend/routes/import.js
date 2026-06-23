// backend/routes/import.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const importController = require('../controllers/importController');

// Configurar multer para memória (buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'));
    }
  }
});

router.post('/excel', auth, upload.single('file'), importController.importExcel);

module.exports = router;