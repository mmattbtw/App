import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from 'src/app/service/client.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  constructor(private route:ActivatedRoute, public client:ClientService ) { }

  ngOnInit(): void {
    //const id:string = this.route.snapshot.paramMap.get("user");
    //console.log(id);
  }

}
