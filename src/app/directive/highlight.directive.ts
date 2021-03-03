import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import * as Color from 'color';

@Directive({
	selector: '[appColor]'
})
export class ColorDirective implements OnInit {
	@Input() appColor: string | Color | undefined = '';
	@Input() isBackground = false;
	@Input() isBorder = false;

	/**
	 * Give a color or background color to an element
	 */
	constructor(private el: ElementRef<HTMLDivElement | HTMLSpanElement>) {

	}

	ngOnInit(): void {
		if (this.isBorder) {
			this.el.nativeElement.style.borderColor = String(this.appColor);
		} else {
			this.el.nativeElement.style[this.isBackground ? 'backgroundColor' : 'color'] = String(this.appColor);
		}
	}

}
