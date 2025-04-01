import { Component } from '@angular/core';
import { bootstrapBoxArrowInLeft } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-termini-econdizioni',
  imports: [
    NgIcon,
    RouterLink
  ],
  providers:[
    provideIcons({
      bootstrapBoxArrowInLeft
    })
  ],
  templateUrl: './termini-econdizioni.component.html',
})

export class TerminiECondizioniComponent {

}
