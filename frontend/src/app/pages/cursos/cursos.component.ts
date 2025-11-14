import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CursosService, Curso } from '../../services/cursos.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.css'
})
export class CursosComponent implements OnInit {
  cursos: Curso[] = [];

  constructor(private cursosService: CursosService) {}

  ngOnInit(): void {
    this.cursosService.obtenerCursos().subscribe({
      next: (data) => this.cursos = data,
      error: (err) => console.error('❌ Error al cargar cursos:', err)
    });
  }
}
