import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YouTubeLinkComponent } from 'src/app/youtube/youtube.component';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Link YouTube Channel'
		},
		component: YouTubeLinkComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class YouTubeRoutingModule { }
