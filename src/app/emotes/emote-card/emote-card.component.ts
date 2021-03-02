import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject } from 'rxjs';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { WindowRef } from 'src/app/service/window.service';

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
	@Input() emote: DataStructure.Emote | null = null;

	borderColor = this.themingService.bg.lighten(.2).hex();
	hover = new BehaviorSubject<boolean | null>(false);

	@HostListener('mouseenter')
	onMouseEnter(): void { this.hover.next(true); }

	@HostListener('mouseleave')
	onMouseLeave(): void { this.hover.next(false); }

	@HostListener('auxclick', ['$event'])
	onMiddleCLick(ev: MouseEvent): void {
		if (ev.button === 1) {
			const url = this.router.serializeUrl(this.router.createUrlTree(['/emotes', String(this.emote?._id)]));

			this.windowRef.getNativeWindow().open(url, '_blank');
		}
	}

	constructor(
		private restService: RestService,
		private router: Router,
		private windowRef: WindowRef,
		public themingService: ThemingService
	) { }

	ngOnInit(): void {
	}

	getEmoteURL(): string {
		return this.restService.CDN.Emote(String(this.emote?._id), 3);
	}

	getTooltip(): string {
		return (this.emote?.name.length ?? 0) >= 13 ? (this.emote?.name ?? '') : '';
	}

	ngOnDestroy(): void {
		this.hover.next(false);
	}

}
