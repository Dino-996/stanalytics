import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-access-denied',
  imports: [
    NgbAlertModule
  ],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent implements OnInit {
  returnUrl: string = '/login';

  public constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  public ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/login';
    });
  }

  public async goBackToLogin() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}