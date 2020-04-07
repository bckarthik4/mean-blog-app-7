const jwt=require('jsonwebtoken');

module.exports=(req,res,next)=>{
	try{
	const token=req.headers.authorization.split(" ")[1];//'ex of token:Bearer assadadasda'
   //[0] has bearer word which we dont want
    const decodedToken=jwt.verify(token,'secret_this_should_be_longer_and_it_is_public_key');
	req.userData={email:decodedToken.email,userId:decodedToken.userId};//we added new key value to req so this will allow us to save post with user id in post route
	//so every request we made from angular that has token will first come here and then goto post route or put route or delete route
	next();
	}
	catch(error){
		res.status(401).json({message:'You are not Authenticated!'});
	}
}