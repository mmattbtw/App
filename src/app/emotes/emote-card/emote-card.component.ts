import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject } from 'rxjs';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';

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

	constructor(
		private restService: RestService,
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
