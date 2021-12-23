import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ClientService } from 'src/app/service/client.service';
import { EgVault } from 'src/app/service/rest/egvault.structure';
import { ThemingService } from 'src/app/service/theming.service';
import { CustomAvatarDialogComponent } from 'src/app/user/dialog/custom-avatar-dialog.component';

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
	@Input() subscription: EgVault.Subscription | null = null;
	zeroWidthRotation = [
		{ emoteUrl: '/assets/brand/promo/zerowidth-emote1.webp', modifierUrl: '/assets/brand/promo/zerowidth-emote1z.webp' },
		{ emoteUrl: '/assets/brand/promo/zerowidth-emote2.webp', modifierUrl: '/assets/brand/promo/zerowidth-emote2z.webp' },
		{ emoteUrl: '/assets/brand/promo/zerowidth-emote3.webp', modifierUrl: '/assets/brand/promo/zerowidth-emote3z.webp' },
		{ emoteUrl: '/assets/brand/promo/zerowidth-emote4.webp', modifierUrl: '/assets/brand/promo/zerowidth-emote4z.webp' }
	] as StoreSubscribePromotionComponent.ZeroWidthCombination[];
	zwTransition = new BehaviorSubject <'in' | 'out' | null>('in');
	currentZeroWidth = new BehaviorSubject<StoreSubscribePromotionComponent.ZeroWidthCombination>(this.zeroWidthRotation[0]);

	constructor(
		public themingService: ThemingService,
		public clientService: ClientService,
		private dialog: MatDialog
	) {}

	uploadCustomAvatar(): void {
		this.dialog.open(CustomAvatarDialogComponent);
	}


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
