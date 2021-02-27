
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EmotesComponent } from 'src/app/emotes/emotes.component';
import { EmoteComponent } from 'src/app/emotes/emote/emote.component';

export const routes: Routes = [
	{
		path: '',
		component: EmotesComponent,
	},
	{
		path: ':emote',
		component: EmoteComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EmotesRouterModule { }
