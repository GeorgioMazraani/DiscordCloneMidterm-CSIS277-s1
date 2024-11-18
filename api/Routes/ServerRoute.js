const express = require('express');
const router = express.Router();
const { serverController, upload } = require('../Controllers/ServerController');

router.get('/:id', serverController.getServerByIdController);
router.get('/', serverController.getAllServersController);
router.post('/', upload.single('icon'), serverController.createServerController);
router.put('/:id/details', serverController.updateServerDetailsController);
router.put('/:id/icon', upload.single('icon'), serverController.updateServerIconController);
router.delete('/:id', serverController.deleteServerController);
router.post('/addUser', serverController.addUserToServerController);

module.exports = router;
