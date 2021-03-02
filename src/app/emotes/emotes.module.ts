import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EmotesRouterModule } from 'src/app/emotes/emotes-routing.module';
import { EmotesComponent } from 'src/app/emotes/emotes.component';
import { MaterialModule } from 'src/app/material.module';
import { EmoteCardComponent } from './emote-card/emote-card.component';
import { EmoteComponent } from './emote/emote.component';
import { EmoteCreateComponent } from './emote-create/emote-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EmoteListComponent } from './emote-list/emote-list.component';
import { EmoteRenameDialogComponent } from 'src/app/emotes/emote/rename-emote-dialog.component';

@NgModule({
	imports: [
		CommonModule,
		EmotesRouterModule,
		MaterialModule,
		ReactiveFormsModule
	],
	exports: [],
	declarations: [
		EmotesComponent,
		EmoteCardComponent,
		EmoteComponent,
		EmoteCreateComponent,
		EmoteListComponent,
		EmoteRenameDialogComponent
	],
	providers: [],
})
export class EmotesModule { }
