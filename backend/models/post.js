const mongoose=require('mongoose');


const postSchema=mongoose.Schema({
	title:{type:String,required:true},
	content:{type:String,required:true},
	imagePath:{type:String,required:true},
	creator:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
});//ref tells that id we are storing is of User Model

module.exports=mongoose.model('Post',postSchema);//will create posts collection