import { Routes } from "@angular/router";
import { AccessDeniedComponent } from "./components/access-denied/access-denied.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { LoginComponent } from "./components/login/login.component";
import { UserDashboardComponent } from "./components/user-dashboard/user-dashboard.component";
import { AdminGuard } from "./guards/admin.guard";
import { AuthGuard } from "./guards/auth.guard";
import { AdminAccountComponent } from "./components/admin-account/admin-account.component";
import { AdminBilingComponent } from "./components/admin-biling/admin-biling.component";

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'access-denied', component: AccessDeniedComponent },
    {
        path: 'dashboard',
        component: UserDashboardComponent,
        canActivate: [AuthGuard] // Solo utenti autenticati
    },
    {
        path: 'admin',
        canActivate: [AuthGuard, AdminGuard], // Solo admin autenticati
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'account', component: AdminAccountComponent },
            { path: 'billing', component: AdminBilingComponent, },
        ]
    },
    { path: '**', redirectTo: '/dashboard' }
];
