import { Component, OnInit,OnDestroy } from "@angular/core";
import { FormGroup,FormControl,Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Subscription } from 'rxjs';

import { PostsService } from "../posts.service";
import { Post } from "../post.model";
import { mimeType } from './mime-type.validator';
import { AuthService } from '../../auth.service';

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit,OnDestroy {
  enteredTitle = "";
  enteredContent = "";
  post: Post;
  isLoading = false;
  form:FormGroup;
  imagePreview:string;
  private mode = "create";
  private postId: string;
  private authStatusSub:Subscription;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
	private authService:AuthService
  ) {}

  ngOnInit() {
	this.authStatusSub=this.authService.getAuthStatusListener().subscribe(
	authStatus=>{
		this.isLoading=false;
	}
	);  
	this.form=new FormGroup({
		title:new FormControl(null,{validators:[Validators.required,Validators.minLength(3)]}),//state or value of title is null
	    content:new FormControl(null,{validators:[Validators.required]}),//state or value of content is null
	    image:new FormControl(null,{validators:[Validators.required],asyncValidators:[mimeType]})
		});  
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {id: postData._id, title: postData.title, content: postData.content,imagePath:postData.imagePath,creator:postData.creator};
		  this.form.setValue({title:this.post.title,content:this.post.content,image:this.post.imagePath});//loads reactive form with title and content to be edited on front end
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }
  onImagePicked(event:Event){//Event data type is of js so no need of importing type as we do in TS
	 const file=(event.target as HTMLInputElement).files[0];//TS doesnt know event.target is html element so typecasted like this and files property is array holding multiple files so we are accessing only one file
     this.form.patchValue({image:file});//setValue mandatorily can set all key value pairs to new values but patch value can access single or many key values to be modified in object
     this.form.get('image').updateValueAndValidity();//runs validator to check file uploaded is of image by storing internally
	 //create url for image and it is async
	 const reader=new FileReader();
	 reader.onload=()=>{
		this.imagePreview=reader.result as string; 
	 };//when file is getting read then url is taken by imagePreview
	 reader.readAsDataURL(file);//load the file
  }//when file is being loaded as url and when it is read then reader.onload executes

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.postsService.addPost(this.form.value.title, this.form.value.content,this.form.value.image);
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
		this.form.value.image
      );
    }
    this.form.reset();
  }
  ngOnDestroy(){
	  this.authStatusSub.unsubscribe();
  }
}
