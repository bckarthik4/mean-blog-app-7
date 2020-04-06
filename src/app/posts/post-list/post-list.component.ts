import { Component,OnInit,OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from '../../auth/auth.service';

@Component({
	selector:'app-post-list',
	templateUrl:'./post-list.component.html',
	styleUrls:['./post-list.component.css']
})

export class PostListComponent implements OnInit,OnDestroy{
	/*posts=[
	{title:'First',content:'First Post'},
	{title:'Second',content:'Second Post'}
	]*/
	posts:Post[]=[];
	isLoading=false;
	totalPosts=0;//totalposts in db
	postsPerPage=2;//user selected number of posts per page
	currentPage=1;
	pageSizeOptions=[1,2,5,10];//drop down for user to select number of posts per page
	private postsSub:Subscription;
	private authStatusSub:Subscription;
	userIsAuthenticated=false;
	userId:string;
	
	constructor(public postsService:PostsService,private authService:AuthService){}
	
	ngOnInit(){
		this.isLoading=true;
		this.postsService.getPosts(this.postsPerPage,this.currentPage);
		this.userId=this.authService.getUserId();
		this.postsSub=this.postsService.getPostUpdateListener()
		.subscribe((postData:{posts:Post[],postCount:number})=>{this.isLoading=false;this.posts=postData.posts;this.totalPosts=postData.postCount;});//Listener to the subject
		//subscribe function takes 3 arguments 1st is executed when data emitted by subject
		//2nd argument is run when we get error
		//3rd when observable completed
		//here posts keep on getting created and emitted as when required by subject so 3rd argument not called
	    //whenever this component doesnt exist or posts get deleted then subscriptions shouldnt exist at all or else causes memory leak
		//so we save all subscriptions here in postsSub and destroy it when OnDestroy called
		this.userIsAuthenticated=this.authService.getIsAuth();
		this.authStatusSub=this.authService.getAuthStatusListener().subscribe(isAuthenticated=>{
			this.userIsAuthenticated=isAuthenticated;
			this.userId=this.authService.getUserId();
		});	
	}
	onChangedPage(pageData:PageEvent){
		//pageData object has length which is totalPosts variable value
		//pageData has pageIndex which starts from 0 showing which page we are on
		//pageData has pageSize which is postsPerPage Variable value
		//pageData has previousPageIndex which will be 0 if pageIndex is 1
		this.isLoading=true;//becomes false after we get new Page and getPostUpdateListener is called
		this.currentPage=pageData.pageIndex+1;
		this.postsPerPage=pageData.pageSize;
		this.postsService.getPosts(this.postsPerPage,this.currentPage);

	}
	
	onDelete(postId:string){
		this.isLoading=true;
		this.postsService.deletePost(postId).subscribe(()=>{
			this.postsService.getPosts(this.postsPerPage,this.currentPage);
		});
	}
	
	ngOnDestroy(){
		this.postsSub.unsubscribe();
		this.authStatusSub.unsubscribe();
	}
}