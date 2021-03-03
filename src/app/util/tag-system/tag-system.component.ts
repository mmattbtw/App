import { Component, Input, OnInit } from '@angular/core';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-tag-system',
	templateUrl: './tag-system.component.html',
	styleUrls: ['./tag-system.component.scss']
})

export class TagSystemComponent implements OnInit {


	constructor() { }

	@Input() emote: EmoteStructure | undefined;


	ngOnInit(): void {
		console.log(this.emote);
	}

}
