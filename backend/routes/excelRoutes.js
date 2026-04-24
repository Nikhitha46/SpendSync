const express = require('express');
const multer = require('multer');
const { exportToExcel, importFromExcel } = require('../controllers/excelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/export', protect, exportToExcel);
router.post('/import', protect, upload.single('file'), importFromExcel);

module.exports = router;
