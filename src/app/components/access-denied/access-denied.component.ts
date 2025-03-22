import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-access-denied',
  imports: [RouterLink, NgbAlertModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})

export class AccessDeniedComponent {

}
