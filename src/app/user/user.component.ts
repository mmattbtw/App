import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';


@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

	constructor(private route: ActivatedRoute, public client: ClientService, public themingService: ThemingService) { }

	ngOnInit(): void {
		//const id:string = this.route.snapshot.paramMap.get("user");
		//console.log(id);
	}

}
