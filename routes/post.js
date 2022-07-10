const express = require('express');
const protect = require('../middlewares/auth');
const postController = require('../controllers/post');

const router = express.Router();

router.route('/')
  .get(postController.getAllPosts)
  .post(protect, postController.createPost)

router.route('/:id')
  .get(postController.getOnePost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

module.exports = router;
