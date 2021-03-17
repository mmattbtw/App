import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import * as Color from 'color';
import { Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';

@Directive({
	selector: '[appColor]'
})
export class ColorDirective implements OnInit, OnDestroy {
	@Input() appColor: string | Color | undefined = '';
	@Input() isBackground = false;
	@Input() isBorder = false;
	@Input() onHoverOnly = false;

	private destroyed = new Subject<void>().pipe(take(1)) as Subject<void>;
	private hovering = new Subject<boolean>().pipe(takeUntil(this.destroyed)) as Subject<boolean>;
	private originalColor = '';

	/**
	 * Give a color or background color to an element
	 */
	constructor(private el: ElementRef<HTMLDivElement | HTMLSpanElement>) {

	}

	@HostListener('mouseenter')
	mouseEnter(): void {
		this.hovering.next(true);
	}

	@HostListener('mouseleave')
	onMouseLeave(): void {
		this.hovering.next(false);
	}

	private getStyleName(): string {
		return this.isBorder ? 'borderColor' : (this.isBackground ? 'backgroundColor' : 'color');
	}

	private setColor(): void {
		console.log('set color');
		this.el.nativeElement.style[this.getStyleName() as any] = String(this.appColor);
	}

	resetColor(): void {
		console.log('reset color');
		this.el.nativeElement.style[this.getStyleName() as any] = this.originalColor;
	}

	ngOnInit(): void {
		this.originalColor = this.isBorder ? this.el.nativeElement.style.borderColor : this.el.nativeElement.style[this.isBackground ? 'backgroundColor' : 'color'];

		console.log('hoveronly', this.onHoverOnly);
		this.onHoverOnly ? this.hovering.pipe(
			map(hovering => hovering ? this.setColor() : this.resetColor())
		).subscribe() : this.setColor();
	}

	ngOnDestroy(): void { this.destroyed.next(); }
}
