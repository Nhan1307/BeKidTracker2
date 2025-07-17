const express = require('express');
const router = express.Router();
const payosController = require('../controller/payosController');
const authMiddleware = require('../middlewares/authMiddleware'); 

router.post(
  '/create-order',
  authMiddleware, 
  (req, res, next) => {
    console.log('Đã vào route /create-order');
    next();
  },
  payosController.createOrder
);

router.post('/callback', payosController.handleCallback);
router.get('/transactions', payosController.getTransactions);

module.exports = router;