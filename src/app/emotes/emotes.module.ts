import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EmotesRouterModule } from 'src/app/emotes/emotes-routing.module';
import { EmotesComponent } from 'src/app/emotes/emotes.component';
import { MaterialModule } from 'src/app/material.module';
import { EmoteCardComponent } from './emote-card/emote-card.component';
import { EmoteComponent } from './emote/emote.component';

@NgModule({
	imports: [
		CommonModule,
		EmotesRouterModule,
		MaterialModule
	],
	exports: [],
	declarations: [
		EmotesComponent,
		EmoteCardComponent,
		EmoteComponent
	],
	providers: [],
})
export class EmotesModule { }
