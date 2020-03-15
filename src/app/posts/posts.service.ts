import { Post } from './post.model';
import { Subject } from 'rxjs';//same like event Emitter
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

export class PostsService{
	private posts:Post[]=[];
	private postsUpdated=new Subject<Post[]>();
	
	constructor(private http:HttpClient,private router:Router){}
	
	getPosts(){
		this.http.get<{message:string,posts:any}>('/api/posts')
		.pipe(map((postData)=>{return postData.posts.map(post=>{
			return {title:post.title,content:post.content,id:post._id}
		})}))
		.subscribe(transformedPosts=>{
			this.posts=transformedPosts;
			this.postsUpdated.next([...this.posts]);
		});//<{message:string,posts:Post[]}> since it is sent back by res.json in nodejs in that format here catched by observable
	}
	
	getPostUpdateListener(){
		return this.postsUpdated.asObservable();
	}
	
	getPost(id:string){
		return this.http.get<{_id:string,title:string,content:string}>('/api/posts/'+id);
	}//checking for id told to be edited present in front end with help of id
	
	addPost(title:string,content:string){
		const post:Post={id:null,title:title,content:content};//initially id is null as we have to push to db to get id
		this.http.post<{message:string,postId:string}>('/api/posts',post).subscribe((responseData)=>{
			console.log(responseData.message);
			const id=responseData.postId;
			post.id=id;//updated front end variable with id from db
			this.posts.push(post);
		    this.postsUpdated.next([...this.posts]);//pushes and emits new array updated
			this.router.navigate(["/"]);		
		});//we get message in form of json from node endpoint {message:string}
		}
		
	updatePost(id:string,title:string,content:string){
		const post:Post={id:id,title:title,content:content};
		this.http.put('/api/posts/'+id,post)
			.subscribe((response)=>{
				const updatedPosts=[...this.posts];
				const oldPostIndex=updatedPosts.findIndex(p=>p.id===post.id);
				updatedPosts[oldPostIndex]=post;
				this.posts=updatedPosts;
				this.postsUpdated.next([...this.posts]);
				this.router.navigate(["/"]);
				});
		}		
		
    deletePost(postId:string){
		this.http.delete('/api/posts/'+postId).subscribe(()=>{
			console.log('Deleted');//logs on console of browser
			const updatedPosts=this.posts.filter(post=>post.id!==postId);//copies all posts except post with id = postId into updatedPosts		
			this.posts=updatedPosts;
			this.postsUpdated.next([...this.posts]);		
		});
	}
		
}