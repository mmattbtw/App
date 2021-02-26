
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EmotesComponent } from 'src/app/emotes/emotes.component';

export const routes: Routes = [
	{
		path: '',
		component: EmotesComponent,
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EmotesRouterModule { }
