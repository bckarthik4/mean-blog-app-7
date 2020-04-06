import { Post } from './post.model';
import { Subject } from 'rxjs';//same like event Emitter
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

export class PostsService{
	private posts:Post[]=[];
	private postsUpdated=new Subject<{posts:Post[],postCount:number}>();
	
	constructor(private http:HttpClient,private router:Router){}
	
	getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        "/api/posts" + queryParams
      )
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
				creator:post.creator
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }
	
	getPostUpdateListener(){
		return this.postsUpdated.asObservable();
	}
	
	getPost(id:string){
		return this.http.get<{_id:string,title:string,content:string,imagePath:string,creator:string}>('/api/posts/'+id);
	}//checking for id told to be edited present in front end with help of id
	
	addPost(title:string,content:string,image:File){
		const postData=new FormData();//allows to use blob for image files and text data
		postData.append('title',title);
		postData.append('content',content);
		postData.append('image',image,title);//passing image and filename which is same as title so title passed
		this.http.post<{message:string,post:Post}>('/api/posts',postData).subscribe((responseData)=>{
			this.router.navigate(["/"]);		
		});//we get message in form of json from node endpoint {message:string}
		}
		
	updatePost(id:string,title:string,content:string,image:File | string){
		let postData:Post | FormData;
		if(typeof(image)==='object')//file type will be object but string type is not object
		{
		    postData=new FormData();
			postData.append('id',id);
			postData.append('title',title);
			postData.append('content',content);
			postData.append('image',image,title);//can have blob image and title content strings in postData
		//contains image as object
		}
		else{
			postData={id:id,title:title,content:content,imagePath:image,creator:null};//contains image as string
		}
		this.http.put('/api/posts/'+id,postData)
			.subscribe((response)=>{
				this.router.navigate(["/"]);
				});
		}		
		
    deletePost(postId:string){
		return this.http.delete('/api/posts/'+postId);
	}
		
}