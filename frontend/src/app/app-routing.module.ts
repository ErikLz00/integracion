import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CursoDetalleComponent } from './pages/curso-detalle/curso-detalle.component'; 

const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'curso/:id', component: CursoDetalleComponent } // ✅ ruta dinámica
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }