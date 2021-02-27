import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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
	@Input() size = 8;

	borderColor = this.themingService.bg.lighten(.2).hex();
	hover = new BehaviorSubject<boolean | null>(false);

	@HostListener('mouseenter')
	onMouseEnter(): void { this.hover.next(true); }

	@HostListener('mouseleave')
	onMouseLeave(): void { this.hover.next(false); }

	constructor(
		public themingService: ThemingService
	) { }

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		this.hover.next(false);
	}

}
