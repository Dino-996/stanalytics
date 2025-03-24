import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-access-denied',
  imports: [RouterLink, NgbAlertModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})

export class AccessDeniedComponent {

  public constructor(private authService: AuthService, private router: Router) { }

  public async goBackToLogin() {
    await this.authService.logout(); //IMPORTANTE, fai il logout
    this.router.navigate(['/login']);
  }

}
