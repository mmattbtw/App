import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { WindowRef } from 'src/app/service/window.service';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote-card',
	templateUrl: './emote-card.component.html',
	styleUrls: ['./emote-card.component.scss'],
	animations: [
		trigger('hovering', [
			state('true', style({ 'border-color': 'currentColor' })),
			state('false', style({ 'border-color': '{{borderColor}}'} ), { params: { borderColor: 'blue' } }),

			transition('true => false', animate(500)),
			transition('false => true', animate(100))
		])
	]
})
export class EmoteCardComponent implements OnInit, OnDestroy {
	@Input() size = 10;
	@Input() emote: EmoteStructure | null = null;
	@Input() contextMenu: MatMenu | undefined;
	@Output() openContext = new EventEmitter<EmoteStructure>();
	@ViewChild(MatMenuTrigger) contextMenuTrigger: MatMenuTrigger | undefined;

	borderColor = this.themingService.bg.lighten(.2).hex();
	globalBorderColor = this.themingService.accent.hex();
	hover = new BehaviorSubject<boolean | null>(false);

	// Listen for hover states
	@HostListener('mouseenter')
	onMouseEnter(): void { this.hover.next(true); }

	@HostListener('mouseleave')
	onMouseLeave(): void { this.hover.next(false); }

	/**
	 * Middle Mouse Click: open in new tab
	 */
	@HostListener('auxclick', ['$event'])
	onMiddleCLick(ev: MouseEvent): void {
		if (ev.button === 1) {
			const url = this.router.serializeUrl(this.router.createUrlTree(['/emotes', String(this.emote?.getID())]));

			this.windowRef.getNativeWindow().open(url, '_blank');
		}
	}

	/**
	 * On Right Click: open quick actions menu
	 */
	@HostListener('contextmenu', ['$event'])
	onRightClick(ev: MouseEvent): void {
		ev.preventDefault(); // Stop the default context menu from opening

		if (!!this.emote) this.openContext.next(this.emote);
		this.contextMenuTrigger?.openMenu();
		console.log(this.contextMenuTrigger);
	}

	constructor(
		private restService: RestService,
		private router: Router,
		private windowRef: WindowRef,
		public themingService: ThemingService
	) { }

	ngOnInit(): void {
		console.log(this.contextMenu);
	}

	getEmoteURL(): string {
		return this.restService.CDN.Emote(String(this.emote?.getID()), 3);
	}

	getTooltip(): Observable<string | undefined> {
		return this.emote?.getName().pipe(
			map(name => (name?.length ?? 0) >= 14 ? name : '')
		) ?? EMPTY;
	}

	ngOnDestroy(): void {
		this.hover.next(false);
	}

}
