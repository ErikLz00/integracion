import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  mensajeError = '';
  mensajeExito = '';

  constructor(private http: HttpClient, private router: Router) {}

  registrarUsuario() {
    if (!this.nombre || !this.email || !this.password) {
      this.mensajeError = '⚠️ Todos los campos son obligatorios.';
      return;
    }

    const body = {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:3000/api/auth/register', body).subscribe({
      next: (res) => {
        this.mensajeExito = '✅ Usuario registrado correctamente.';
        this.mensajeError = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = err.error?.mensaje || '❌ Error al registrar usuario.';
      }
    });
  }
}
