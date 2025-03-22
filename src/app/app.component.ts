import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  public constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) { 
        window.scrollTo(0, 0); 
      }
    });
  }

}
