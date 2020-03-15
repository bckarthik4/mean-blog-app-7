import { Component,OnInit,OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
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
	private postsSub:Subscription;
	
	constructor(public postsService:PostsService){}
	
	ngOnInit(){
		this.isLoading=true;
		this.postsService.getPosts();
		this.postsSub=this.postsService.getPostUpdateListener()
		.subscribe((posts:Post[])=>{this.isLoading=false;this.posts=posts;});//Listener to the subject
		//subscribe function takes 3 arguments 1st is executed when data emitted by subject
		//2nd argument is run when we get error
		//3rd when observable completed
		//here posts keep on getting created and emitted as when required by subject so 3rd argument not called
	    //whenever this component doesnt exist or posts get deleted then subscriptions shouldnt exist at all or else causes memory leak
		//so we save all subscriptions here in postsSub and destroy it when OnDestroy called
	}
	
	onDelete(postId:string){
		this.postsService.deletePost(postId);
	}
	
	ngOnDestroy(){
		this.postsSub.unsubscribe();
	}
}