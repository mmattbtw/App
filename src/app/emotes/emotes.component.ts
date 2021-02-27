import { trigger, transition, query, style, stagger, animate, keyframes, group } from '@angular/animations';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-emotes',
	templateUrl: './emotes.component.html',
	styleUrls: ['./emotes.component.scss'],
	styles: ['.selected-cluster-card { opacity: 0 }'],
	animations: [
		trigger('emotes', [
			transition('* => *', [
				query('.is-emote-card:enter', [
					style({ opacity: 0, transform: 'translateX(-20em) translateY(-20em)' }),
					stagger(21, [
						animate('475ms ease-in-out', keyframes([
							style({ opacity: 0, offset: 0.475 }),
							style({ opacity: 1, transform: 'none', offset: 1 })
						]))
					])
				], { optional: true }),

				group([
					query('.is-emote-card:not(.selected-emote-card):leave', [
						style({ opacity: 1 }),
						stagger(-11.5, [
							animate('200ms', style({ transform: 'scale(0)' }))
						])
					], { optional: true }),

					query('.selected-emote-card', [
						style({ opacity: 1 }),
						animate('550ms', keyframes([
							style({ offset: 0, opacity: 1, transform: 'scale(1)' }),
							style({ offset: .2, transform: 'scale(.91)' }),
							style({ offset: .38, transform: 'scale(.64)' }),
							style({ offset: .44, transform: 'scale(.82)' }),

							style({ offset: 1, transform: 'scale(12) translateY(25%)', opacity: 0 })
						])),
					], { optional: true })
				])
			])
		])
	]
})
export class EmotesComponent implements OnInit, OnDestroy {
	destroyed = new Subject<any>().pipe(take(1)) as Subject<void>;
	selecting = new BehaviorSubject(false).pipe(takeUntil(this.destroyed)) as BehaviorSubject<boolean>;
	sidebarLinks = [
		{
			label: ''
		},
		{
			label: 'Global Emotes'
		},
		{

		},
		{

		}
	] as EmotesComponent.SidebarLink[];

	emotes = new BehaviorSubject<any>([]).pipe(takeUntil(this.destroyed)) as BehaviorSubject<{}[]>;

	constructor(
		public themingService: ThemingService,
		public clientService: ClientService,
		private renderer: Renderer2,
		private router: Router,
	) { }

	selectEmote(el: any, emote: any): void {
		this.selecting.next(true);
		this.renderer.addClass(el, 'selected-emote-card');
		this.emotes.next([]);

		setTimeout(() => {
			this.router.navigate(['emotes', 0]);
		}, 775);
	}

	ngOnInit(): void {
		this.emotes.next([...Array(25).keys()] as number[]);
	}

	ngOnDestroy(): void {
		this.destroyed.next();
	}

}

export namespace EmotesComponent {
	export interface SidebarLink {
		label: string;
		path: string;
	}
}
