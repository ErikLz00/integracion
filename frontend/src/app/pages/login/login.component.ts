import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  mensajeError = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.mensajeError = 'Por favor completa todos los campos.';
      return;
    }

    this.http.post('http://localhost:3000/api/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        console.log('Login exitoso:', res);
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.mensajeError = 'Credenciales inválidas o error en el servidor.';
      }
    });
  }
}
