import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';//makes input field zoom in and zoom out with animations
import { MatInputModule,MatCardModule,MatButtonModule,MatToolbarModule,MatExpansionModule,MatProgressSpinnerModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { PostListComponent } from './posts/post-list/post-list.component';
import { HeaderComponent } from './header/header.component';
import { PostsService } from './posts/posts.service';

@NgModule({
  declarations: [
    AppComponent,
	PostCreateComponent,
	PostListComponent,
	HeaderComponent
  ],
  imports: [
    BrowserModule,
	AppRoutingModule,
	FormsModule,
	BrowserAnimationsModule,
	MatInputModule,
	MatCardModule,
	MatButtonModule,
	MatToolbarModule,
	MatExpansionModule,
	MatProgressSpinnerModule,
	HttpClientModule
  ],
  providers: [PostsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
