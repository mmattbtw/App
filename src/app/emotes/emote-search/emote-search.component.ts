import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { asyncScheduler, BehaviorSubject, EMPTY, scheduled } from 'rxjs';
import { map, mergeAll, mergeMap, take, tap, throttleTime } from 'rxjs/operators';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-emote-search',
	templateUrl: './emote-search.component.html',
	styleUrls: ['./emote-search.component.scss']
})
export class EmoteSearchComponent implements OnInit {
	@Output() searchChange = new EventEmitter<Partial<EmoteSearchComponent.SearchChange>>();

	form = new FormGroup({
		name: new FormControl('', { updateOn: 'blur' }),
		hideGlobal: new FormControl(false)
	});
	nameSearchBox: string | undefined;
	current: Partial<EmoteSearchComponent.SearchChange> = {};

	/**
	 * A list of options for changing what the text input does
	 */
	modeMenuOptions = [
		{ // Search emote names
			label: 'Emote Name',
			id: 'name'
		},
		{ // Search by submitter name
			label: 'Submitter Name',
			id: 'submitter'
		}
	] as EmoteSearchComponent.ModeMenuOption[];
	selectedSearchMode = new BehaviorSubject<EmoteSearchComponent.ModeMenuOption>(this.modeMenuOptions[0]);

	constructor(
		public themingService: ThemingService
	) { }

	/**
	 * Change the current search mode
	 *
	 * This method is used by the mode menu
	 */
	changeSearchMode(opt: EmoteSearchComponent.ModeMenuOption): void {

		this.selectedSearchMode.pipe(
			take(1),
			tap(mode => { delete this.current[mode.id as keyof EmoteSearchComponent.SearchChange]; }),
			tap(o => this.selectedSearchMode.next(opt))
		).subscribe();
	}

	handleEnterPress(ev: KeyboardEvent | Event): void {
		ev.preventDefault();

		(ev.target as HTMLInputElement).blur();
		this.form.get('name')?.patchValue((ev.target as HTMLInputElement).value);
	}

	ngOnInit(): void {
		scheduled([
			this.form.get('name')?.valueChanges.pipe( // Look for changes to the name input form field
				mergeMap((value: string) => this.selectedSearchMode.pipe(take(1), map(mode => ({ mode, value })))),
				map(({ value, mode }) => ({ [mode.id]: value })) // Map SearchMode to value
			) ?? EMPTY,

			this.form.get('hideGlobal')?.valueChanges.pipe( // Look for changes to the "show global"
				map((value: string) => ({ hideGlobal: value }))
			) ?? EMPTY
		], asyncScheduler).pipe(
			mergeAll(),
			map(v => this.current = { ...this.current, ...v }),
			throttleTime(250)
		).subscribe({
			next: (v) => this.searchChange.next(v) // Emit the change
		});
	}

}

export namespace EmoteSearchComponent {
	export interface SearchChange {
		name: string;
		submitter: string;
		hideGlobal: string;
	}

	export interface ModeMenuOption {
		label: string;
		id: string;
	}
}
