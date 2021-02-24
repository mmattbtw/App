import { Injectable, NgZone, Output, EventEmitter, RendererFactory2 } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { noop } from 'rxjs';

export type ViewportBreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Injectable({
	providedIn: 'root'
})

export class ViewportService {
	// tslint:disable-next-line:no-output-native
	@Output() resize = new EventEmitter(true);

	current: ViewportBreakpointName = 'md';
	xs = false;
	sm = false;
	md = false;
	lg = false;
	xl = false;

	toolbarHeight = `${this.toolbarHeightValue}px`;
	get toolbarHeightValue(): number { return 64; }

	height: number;
	width: number;
	mouseX = 0;
	mouseY = 0;

	query: {
		[K in ViewportBreakpointName]?: MediaQueryList;
	} = {};

	queryIndex: {
		[key: number]: ViewportBreakpointName;
	} = {};

	queryListeners: {
		[K in ViewportBreakpointName]: () => any;
	} | undefined;

	constructor(
		ngZone: NgZone, media: MediaMatcher,
		renderFactory2: RendererFactory2
	) {
		this.query.xs = media.matchMedia('(max-width: 576px)');
		this.query.sm = media.matchMedia('(min-width: 576px)');
		this.query.md = media.matchMedia('(min-width: 768px)');
		this.query.lg = media.matchMedia('(min-width: 992px)');
		this.query.xl = media.matchMedia('(min-width: 1200px)');
		(() => {
			let index = 0;
			for (const size of this.BREAKPOINT_NAMES) {
				++index;
				this.queryIndex[index] = size;
			}
		})();

		// Listen to the window being resized
		window.onresize = (e: UIEvent) => {
			ngZone.run(() => {
				this.height = window.innerHeight;
				this.width = window.innerWidth;
				this.resize.emit('windowdow');

				this.checkBreakpoint();
			});
		};

		this.height = window.innerHeight;
		this.width = window.innerWidth;
		this.checkBreakpoint();

		// Update mouse position
		{
			const renderer = renderFactory2.createRenderer(null, null);
			renderer.listen('document', 'mousemove', (ev: MouseEvent) => {
				this.mouseX = ev.x;
				this.mouseY = ev.y;
			});
		}
	}

	get BREAKPOINT_NAMES(): ViewportBreakpointName[] {
		return Object.keys(this.query) as ViewportBreakpointName[];
	}

	/**
	 * Check what is the current breakpoint and set `this.current` to the new value
	 */
	checkBreakpoint(): void {
		const querySizes = this.BREAKPOINT_NAMES;

		for (const size of querySizes) {
			if (this.query[size]?.matches) {
				this.current = size;
				for (const s of querySizes) this[s] = false;
				this[size] = true;
			} else noop();
		}

		return undefined;
	}

	/**
	 * Get the index of a specific breakpoint
	 *
	 * @param size The name of the breakpoint
	 */
	getIndexOf(breakpoint: ViewportBreakpointName): number {
		let index = 0;
		for (const size of this.BREAKPOINT_NAMES) {
			++index;
			if (this.queryIndex[index] === breakpoint)
				return index;
			else
				noop();
		}

		return -1;
	}

	/**
	 * Returns whether the viewport breakpoint is larger than specified size
	 *
	 * @param size The name of the breakpoint
	 *
	 * @example
	 * 	isLargerThan('md')
	 */
	isLargerThan(breakpoint: ViewportBreakpointName): boolean {
		const current = this.getIndexOf(this.current);
		const check = this.getIndexOf(breakpoint);

		return current > check;
	}

	/**
	 * Same as isLargerThan() but the other way around
	 * This is for cleanliness only to avoid using not operator
	 */
	isSmallerThan(breakpoint: ViewportBreakpointName): boolean {
		return !this.isLargerThan(breakpoint);
	}

	/**
	 * Get the total height of the page subtracting the height of the toolbar
	 *
	 * @param css if specified, will return a css calc() function instead of a number
	 */
	getContentHeight(): number;
	getContentHeight(css: 'viewport' | 'percentage' | 'total-height'): string;
	getContentHeight(css?: 'viewport' | 'percentage' | 'total-height'): string | number {
		if (css) {
			let value = '';
			switch (css) {
				case 'viewport':
					value = `calc(100vh - ${this.toolbarHeight})`;
					break;
				case 'percentage':
					value = `calc(100% - ${this.toolbarHeight})`;
					break;
				case 'total-height':
					value = `calc(${this.height}px - ${this.toolbarHeight})`;
					break;
				default:
					break;
			}

			return value;
		} else {
			return this.height - Number(this.toolbarHeight.replace('px', ''));
		}
	}

}

export namespace ViewportService {
	export const MIN_WIDTH_PX = 360;
	export const MIN_HEIGHT_PX = 680;
}
