import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowClockwise } from '@ng-icons/bootstrap-icons';
import { AsyncPipe } from '@angular/common';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import { auth } from '../environments/firebase';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FooterComponent,
    NgIcon,
    AsyncPipe
  ],
  providers:[provideIcons({
    bootstrapArrowClockwise
  })],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit{

  public isLoading$: Observable<boolean>;

  public constructor(private router: Router, private authService: AuthService) {
    this.scrollToTop();
    this.isLoading$ = this.authService.isLoading$;
  }

  public async ngOnInit(): Promise<void> {
    try {
      await setPersistence(auth, browserLocalPersistence);
      console.log('Persistenza impostata con successo.');
    } catch (error) {
      console.error('Errore nell\'impostazione della persistenza:', error);
    }
  }

  public scrollToTop(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

}
