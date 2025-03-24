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
import { UserConsultingHistoryComponent } from "./components/user-consulting-history/user-consulting-history.component";
import { UserConsultingPackageComponent } from "./components/user-consulting-package/user-consulting-package.component";

const adminGuards = [AuthGuard, AdminGuard];

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'access-denied', component: AccessDeniedComponent },
    
    { path: 'dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
    { path: 'consulting-package', component: UserConsultingPackageComponent },
    { path: 'consulting-history', component: UserConsultingHistoryComponent },
    
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