import { Component } from '@angular/core';
import { bootstrapBox2Fill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { PackagesComponent } from '../packages/packages.component';

@Component({
  selector: 'app-user-consulting-package',
  imports: [
    NgIcon,
    PackagesComponent
  ],
  providers: [
    provideIcons({
      bootstrapBox2Fill
    })
  ],
  templateUrl: './user-consulting-package.component.html',
  styleUrl: './user-consulting-package.component.css'
})

export class UserConsultingPackageComponent {

}
