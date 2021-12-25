import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataStructure } from '@typings/typings/DataStructure';
import { Observable, Subject } from 'rxjs';
import { delay, filter, map, mergeAll, switchMap, take, tap, toArray } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { environment } from 'src/environments/environment';


@Component({
	selector: 'app-wardrobe',
	templateUrl: './wardrobe.component.html',
	styleUrls: ['./wardrobe.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class WardrobeComponent implements OnInit, OnDestroy {
	closed = new Subject<void>();
	form = new FormGroup({
		paint: new FormControl('0'.repeat(24))
	});
	paints = [] as WardrobeComponent.PaintCosmetic[];
	badges = [] as WardrobeComponent.BadgeCosmetic[];
	loaded = false;

	constructor(
		private clientService: ClientService,
		private api: RestService,
		private el: ElementRef<HTMLDivElement>,
		public themingService: ThemingService
	) { }

	parseBadges(): Observable<WardrobeComponent.BadgeCosmetic[]> {
		return this.clientService.getCosmetics().pipe(
			mergeAll(),
			filter(c => c.kind === 'BADGE'),
			map(c => ({
				...JSON.parse(c.data),
				...c
			})),
			toArray()
		);
	}

	getBadgeImageURL(badge: WardrobeComponent.BadgeCosmetic): string {
		return `${environment.cdnUrl}/badge/${badge.id}/3x`;
	}

	private parsePaints(): Observable<WardrobeComponent.PaintCosmetic[]> {
		return this.clientService.getCosmetics().pipe(
			mergeAll(),
			filter(c => c.kind === 'PAINT'),
			map(c => ({
				...JSON.parse(c.data),
				...c
			})),
			toArray()
		);
	}

	getPaintBackgroundImage(paint: WardrobeComponent.PaintCosmetic, el: HTMLSpanElement): string {
		// define the css function to use
		const funcName = ''.concat(
			paint.repeat ? 'repeating-' : '',
			paint.function
		);
		const args = [] as string[];
		switch (paint.function) {
			case 'linear-gradient': // paint is linear gradient
				args.push(`${paint.angle}deg`);
				break;
			case 'radial-gradient': // paint is radial gradient
				args.push(paint.shape ?? 'circle');
				break;
			case 'url': // paint is an image
				args.push(paint.image_url ?? '');
				break;
		}

		// Parse stops
		if (Array.isArray(paint.stops)) {
			for (const stop of paint.stops) {
				const color = this.decimalToRGBA(stop.color);
				args.push(`${color} ${stop.at * 100}%`);
			}
		}
		// Handle drop shadow
		const dropShadow = [] as string[];
		if (paint.drop_shadow) {
			const { x_offset, y_offset, color, radius } = paint.drop_shadow;
			dropShadow.push(`${x_offset}px`, `${y_offset}px`, `${radius}px`, this.decimalToRGBA(color));
		}

		return `${funcName}(${args.join(', ')})`;
	}


	// tslint:disable:no-bitwise
	decimalToRGBA(num: number): string {
		const r = (num >>> 24) & 0xFF;
		const g = (num >>> 16) & 0xFF;
		const b = (num >>> 8) & 0xFF;
		const a = num & 0xFF;

		return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
	}
	// tslint:enable:no-bitwise

	selectPaint(id: string): void {
		this.api.v2.gql.query<{ editUser: DataStructure.TwitchUser }>({
			query: `
				mutation SelectUserCosmetic($usr: UserInput!) {
					editUser(user: $usr) {
						id,
						cosmetics {
							id,
							selected,
							name,
							kind,
							data
						}
					}
				}
			`,
			auth: true,
			variables: {
				usr: {
					id: this.clientService.id,
					cosmetic_paint: id
				}
			}
		}).pipe(tap(res => {
			this.form.get('paint')?.patchValue(id);

			const updated = res?.body?.data.editUser.cosmetics;
			if (Array.isArray(updated)) {
				this.clientService.pushData(res?.body?.data.editUser as any);
			}
		})).subscribe();
	}

	close(): void {
		this.closed.next(undefined);
	}

	// Handle outside click: close the menu
	@HostListener('document:click', ['$event'])
	onOutsideClick(ev: MouseEvent): void {
		if (!this.loaded) {
			return;
		}
		if (this.el.nativeElement.contains(ev.target as Node)) {
			return;
		}

		this.close();
	}

	ngOnInit(): void {
		this.clientService.isAuthenticated().pipe(
			filter(x => x),
			take(1),
			switchMap(() => this.parsePaints()),
			map(x => this.paints = x),
			switchMap(() => this.parseBadges()),
			map(x => this.badges = x),
			tap(() => {
				for (const paint of this.paints) {
					if (paint.selected) {
						this.form.get('paint')?.setValue(paint.id);
					}
				}
			}),
			delay(0)
		).subscribe({
			complete: () => this.loaded = true
		});
	}
	ngOnDestroy(): void { }
}

export namespace WardrobeComponent {
	export interface BadgeCosmetic extends DataStructure.Cosmetic {
		selected: boolean;
		tooltip: string;
		misc: boolean;
	}

	export interface PaintCosmetic extends DataStructure.Cosmetic {
		selected: boolean;
		name: string;
		users: string[];
		function: string;
		color: number;
		stops: PaintCosmetic.Step[];
		repeat: boolean;
		angle: number;
		shape?: string;
		image_url?: string;
		drop_shadow: PaintCosmetic.Shadow;
		animation: PaintCosmetic.Animation;
	}
	export namespace PaintCosmetic {
		export interface Step {
			at: number;
			color: number;
		}

		export interface Shadow {
			x_offset: number;
			y_offset: number;
			radius: number;
			color: number;
		}

		export interface Animation {
			speed: number;
			keyframes: PaintCosmetic.Animation.Keyframe[];
		}
		export namespace Animation {
			export interface Keyframe {
				at: number;
				x: number;
				y: number;
			}
		}
	}
}
