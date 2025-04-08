import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './components/user/user-dashboard/user-dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { TerminiECondizioniComponent } from './pages/termini-econdizioni/termini-econdizioni.component';
import { PaginaNonTrovataComponent } from './pages/pagina-non-trovata/pagina-non-trovata.component';

export const routes: Routes = [

    { path: '**', component: PaginaNonTrovataComponent },
    { path: 'login', component: LoginComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'user-dashboard', component: UserDashboardComponent },
    { path: 'termini', component: TerminiECondizioniComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
];