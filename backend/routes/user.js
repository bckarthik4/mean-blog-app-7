const express=require('express');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

const User=require('../models/user');

const router=express.Router();

//api/user/signup
router.post('/signup',(req,res,next)=>{
	bcrypt.hash(req.body.password,10)
	.then(hash=>{
	const user=new User({
		email:req.body.email,
		password:hash
	});
		user.save().then(result=>{
			res.status(200).json({message:'User Created',result:result});
			}).catch(err=>{res.status(500).json({message:'Invalid Authentication Credentials'})});
		});
	});

//api/user/login
//return statements doesnt allow other res objects to execute
router.post('/login',(req,res,next)=>{
	let fetchedUser;
	User.findOne({email:req.body.email})
	.then(user=>{
		if(!user){
			return res.status(401).json({message:'Auth Failed'});
		}
		fetchedUser=user;
		return bcrypt.compare(req.body.password,user.password);//password enetered while logging in will be plain converted to hash and compared to hash stored in db so hash matching will yield result
	})
	.then(result=>{
		if(!result){
			return res.status(401).json({message:'Auth Failed'});
		}
		const token=jwt.sign({email:fetchedUser.email,userId:fetchedUser._id},'secret_this_should_be_longer_and_it_is_public_key',{expiresIn:'1h'});//has hashing algorithm,verifying signature and our data in hash verified by server and we have put email and id in token only as data
		res.status(200).json({token:token,expiresIn:3600,userId:fetchedUser._id});
	})
	.catch(err=>{return res.status(401).json({message:'Invalid Authentication Credentials'})});//for pwd
});

module.exports=router;