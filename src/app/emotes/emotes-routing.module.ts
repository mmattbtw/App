
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EmotesComponent } from 'src/app/emotes/emotes.component';
import { EmoteComponent } from 'src/app/emotes/emote/emote.component';
import { EmoteCreateComponent } from 'src/app/emotes/emote-create/emote-create.component';
import { EmoteListComponent } from 'src/app/emotes/emote-list/emote-list.component';

export const routes: Routes = [
	{
		path: '',
		component: EmotesComponent,
		children: [
			{
				path: '',
				component: EmoteListComponent
			},
			{
				path: 'create',
				component: EmoteCreateComponent
			},
			{
				path: ':emote',
				component: EmoteComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EmotesRouterModule { }
