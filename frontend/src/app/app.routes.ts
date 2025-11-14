import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CursosComponent } from './pages/cursos/cursos.component';
import { CursoDetalleComponent } from './pages/curso-detalle/curso-detalle.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' }, // ✅ redirige al login
    { path: 'home', component: HomeComponent },
    { path: 'cursos', component: CursosComponent },
    { path: 'curso/:id', component: CursoDetalleComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent }
  ];
