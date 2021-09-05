import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-store-subscribe-promotion',
	templateUrl: 'subscribe-promotion.component.html',
	styleUrls: ['subscribe-promotion.component.scss'],
	animations: [
		trigger('zwRotation', [
			state('in', style({ transform: 'scale(1)' })),
			state('out', style({ transform: 'scale(0)' })),

			transition('in => out', animate(100)),
			transition('out => in', animate(100)),
		])
	]
})

export class StoreSubscribePromotionComponent implements OnInit {
	zeroWidthRotation = [
		{ emoteUrl: '/assets/brand/promo/zerowidth-emote1.webp', modifierUrl: '/assets/brand/promo/zerowidth-emote1z.webp' },
		{ emoteUrl: '/assets/brand/promo/zerowidth-emote2.webp', modifierUrl: '/assets/brand/promo/zerowidth-emote2z.webp' },
		{ emoteUrl: '/assets/brand/promo/zerowidth-emote3.webp', modifierUrl: '/assets/brand/promo/zerowidth-emote3z.webp' },
		{ emoteUrl: '/assets/brand/promo/zerowidth-emote4.webp', modifierUrl: '/assets/brand/promo/zerowidth-emote4z.webp' }
	] as StoreSubscribePromotionComponent.ZeroWidthCombination[];
	zwTransition = new BehaviorSubject <'in' | 'out' | null>('in');
	currentZeroWidth = new BehaviorSubject<StoreSubscribePromotionComponent.ZeroWidthCombination>(this.zeroWidthRotation[0]);

	constructor(
		public themingService: ThemingService
	) {}

	ngOnInit(): void {
		const nextRotation = (at: number) => {
			const cur = this.zeroWidthRotation[at];

			if (typeof cur !== 'undefined') {
				setTimeout(() => this.zwTransition.next('out'), 2500);
				setTimeout(() => {
					this.zwTransition.next('in');
					this.currentZeroWidth.next(cur);
					nextRotation(at +  1);
				}, 3000);
			} else {
				nextRotation(0);
			}
		};
		nextRotation(0);
	}
}

export namespace StoreSubscribePromotionComponent {
	export interface ZeroWidthCombination {
		emoteUrl: string;
		modifierUrl: string;
	}
}
