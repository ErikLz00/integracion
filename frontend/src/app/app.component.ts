import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, CurrencyPipe, HeaderComponent, FooterComponent,ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cursos-frontend';
  mostrarLayout = true;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      const rutaActual = this.router.url;
      // Oculta header y footer si está en login o register
      this.mostrarLayout = !(rutaActual.includes('/login') || rutaActual.includes('/register'));
    });
  }
}
