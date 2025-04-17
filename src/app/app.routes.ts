import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './components/user/user-dashboard/user-dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { TerminiECondizioniComponent } from './pages/termini-econdizioni/termini-econdizioni.component';
import { PaginaNonTrovataComponent } from './pages/pagina-non-trovata/pagina-non-trovata.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { 
      path: 'admin-dashboard', 
      component: AdminDashboardComponent,
      canActivate: [AuthGuard, AdminGuard]
    },
    { 
      path: 'user-dashboard', 
      component: UserDashboardComponent,
      canActivate: [AuthGuard]
    },
    { path: 'termini', component: TerminiECondizioniComponent },

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', component: PaginaNonTrovataComponent }
];