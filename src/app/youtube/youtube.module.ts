import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { UtilModule } from 'src/app/util/util.module';
import { YouTubeRoutingModule } from 'src/app/youtube/youtube-routing.module';
import { YouTubeLinkComponent } from 'src/app/youtube/youtube.component';
import { YouTubeVerifyComponent } from 'src/app/youtube/yt-verify.component';

@NgModule({
	declarations: [
		YouTubeLinkComponent,
		YouTubeVerifyComponent
	],
	imports: [
		YouTubeRoutingModule,
		CommonModule,
		MaterialModule,
		ReactiveFormsModule,
		UtilModule
	]
})
export class YouTubeModule { }
