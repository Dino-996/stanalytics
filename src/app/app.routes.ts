import { Routes } from "@angular/router";

// Componenti
import { AccessDeniedComponent } from "./components/access-denied/access-denied.component";
import { AdminAccountComponent } from "./components/admin-account/admin-account.component";
import { AdminBilingComponent } from "./components/admin-biling/admin-biling.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { LoginComponent } from "./components/login/login.component";
import { UserDashboardComponent } from "./components/user-dashboard/user-dashboard.component";

// Guard
import { AdminGuard } from "./guards/admin.guard";
import { AuthGuard } from "./guards/auth.guard";

const adminGuards = [AuthGuard, AdminGuard];

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'access-denied', component: AccessDeniedComponent },
    {
        path: 'dashboard',
        component: UserDashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin',
        canActivate: adminGuards,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'account', component: AdminAccountComponent },
            { path: 'billing', component: AdminBilingComponent }
        ]
    },
    { path: '**', redirectTo: '/dashboard' }
];