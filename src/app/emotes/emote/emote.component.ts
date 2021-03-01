import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Observable } from 'rxjs';
import { filter, map, tap, toArray } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote',
	templateUrl: './emote.component.html',
	styleUrls: ['./emote.component.scss']
})
export class EmoteComponent implements OnInit {
	/** The maximum height an emote can be. This tells where the scope text should be placed */
	MAX_HEIGHT = 128;

	emote: EmoteStructure | undefined;

	constructor(
		private restService: RestService,
		private route: ActivatedRoute,
		private router: Router,
		private cdr: ChangeDetectorRef,
		public themingService: ThemingService
	) { }

	/**
	 * Get all sizes of the current emote
	 */
	getSizes(): Observable<EmoteComponent.SizeResult[]> {
		return from([1, 2, 3, 4]).pipe(
			map(s => ({
				scope: s,
				url: this.restService.CDN.Emote(String(this.emote?.getID()), s)
			} as EmoteComponent.SizeResult)),
			toArray()
		);
	}

	ngOnInit(): void {
		if (this.route.snapshot.paramMap.has('emote')) {
			this.restService.Emotes.Get(this.route.snapshot.paramMap.get('emote') as string).pipe(
				tap(x => console.log(x, x instanceof HttpResponse)),
				RestService.onlyResponse(),
				filter(res => res.body !== null),
				map(res => this.emote = new EmoteStructure(this.restService).pushData(res.body)),

				tap(() => this.cdr.markForCheck()),
				tap(x => console.log(this.emote))
			).subscribe({
				error: (err) => this.router.navigate(['/emotes'])
			});
		}
	}
}

export namespace EmoteComponent {
	export interface SizeResult {
		scope: number;
		url: string;
	}
}
