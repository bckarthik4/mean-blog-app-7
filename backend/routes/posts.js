const express = require("express");
const multer=require('multer');

const Post = require("../models/post");
const checkAuth=require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP={
	'image/png':'png',
	'image/jpeg':'jpg',
	'image/jpg':'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

router.post("",checkAuth,multer({storage:storage}).single("image") ,(req, res, next) => {
  const url=req.protocol+'://'+req.get('host');//gives server url
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
	imagePath:url+"/images/"+req.file.filename,
	creator:req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: "Post added successfully",
      post:{
		  id:createdPost._id,
		  title:createdPost.title,
		  content:createdPost.content,
		  imagePath:createdPost.imagePath
	  }
    });
  });
});//multer will expect single image and will call storage

router.put("/:id",checkAuth,multer({storage:storage}).single("image"), (req, res, next) => {
  let imagePath=req.body.imagePath;
  if(req.file){//if file passed not a string
	  const url=req.protocol+"://"+req.get('host');
	  imagePath=url+'/images/'+req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
	imagePath:imagePath,
	creator:req.userData.userId
  });
  Post.updateOne({ _id: req.params.id,creator:req.userData.userId }, post).then(result => {
	  if(result.nModified > 0){
          res.status(200).json({ message: "Update successful!" });
	  }//this means created user and correct post id was passed and modified so value will be 1 since 1 post edited
	  else{
		  res.status(401).json({message:'Not Authorized'});
	  }
  });//now only creator can edit on backend since we added creator:req.userData.userId
});

router.get("", (req, res, next) => {
  //for matPaginator for getting requested number of posts
  //localhost:3000/api/posts?pageSize=10&page=3 will hit this function for GET Request
  //localhost:3000/api/posts will show all posts
  const pageSize=+req.query.pageSize;//selected by user
  const currentPage=+req.query.page;//starts from 0
  //+ sign is making req.query.pageSize and req.query.page values as numbers from strings
  const postQuery=Post.find();
  let fetchedPosts;
  if(pageSize && currentPage){
	  postQuery
	  .skip(pageSize*(currentPage-1))
	  .limit(pageSize);
	  //user requests currentPage as 3
	  //user has set pageSize or number of posts per page as 10
	  //skip function will have value 10*2=20 so first 20 records are skipped and limit will show next 10 records only
  }//pageSize and currentPage should be not null
  postQuery.then(documents => {
	  fetchedPosts=documents;
	  return Post.count();
	  }).then(count=>{
		  res.status(200).json({
			 message:'Posts Fetched Successfully!',
			 posts:fetchedPosts,
			 maxPosts:count
		  });
	  });
	  });//Post.count gives total number of posts in db

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

router.delete("/:id",checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id,creator:req.userData.userId }).then(result => {
    if(result.n > 0){
		res.status(200).json({ message: "Post deleted!" });
	}
	else{
		res.status(401).json({message:'Not Authorized'});
	}//if n=1 then it was deleted by correct user or else it will be unauthorized user
  
  });
});

module.exports = router;
