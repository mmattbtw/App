

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { Router } from '@angular/router';
import Color from 'color';
import { Observable, of } from 'rxjs';
import { EmoteListService } from 'src/app/emotes/emote-list/emote-list.service';
import { WindowRef } from 'src/app/service/window.service';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-ctx-menu',
	templateUrl: 'ctx-menu.component.html'
})

export class ContextMenuComponent implements OnInit {
	@ViewChild('contextMenu') menu: MatMenu | null = null;
	@Output() interact = new EventEmitter<ContextMenuComponent.InteractButton>();

	constructor(
		private router: Router,
		private emoteListService: EmoteListService,
		private windowRef: WindowRef
	) { }

	@Input() contextEmote: EmoteStructure | null = null;
	contextMenuOptions = {
		emote: [
			{
				label: 'Open in New Tab',
				icon: 'open_in_new',
				click: emote => {
					const url = this.router.serializeUrl(this.router.createUrlTree(['/emotes', String(emote.getID())]));

					return of(this.windowRef.getNativeWindow()?.open(url, '_blank'));
				}
			},
			{
				label: 'Copy Link',
				icon: 'link',
				click: emote => of(this.windowRef.copyValueToClipboard(''.concat(
					`https://${this.windowRef.getNativeWindow()?.location.host}`, // Get window location.host
					this.router.serializeUrl(this.router.createUrlTree(['/emotes', String(emote.getID())]))
				)))
			},
			...this.emoteListService.interactions
		] as ContextMenuComponent.InteractButton[]
	};

	onContextInteract(button: ContextMenuComponent.InteractButton, emote: EmoteStructure): void {
		if (typeof button.click === 'function' && !!emote) {
			button.click(emote).subscribe();
		}

		this.interact.emit(button);
	}

	ngOnInit(): void { }
}

export namespace ContextMenuComponent {
	export interface InteractButton {
		label: string;
		color: Color;
		icon?: string;
		disabled?: boolean;
		condition: (emote: EmoteStructure) => Observable<boolean>;
		click?: (emote: EmoteStructure) => Observable<void>;
	}
}
