import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
}


@Injectable({
  providedIn: 'root'
})
export class CursosService {

  private apiUrl = 'http://localhost:3000/api/cursos'; // URL del backend

  constructor(private http: HttpClient) {}

  obtenerCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  getCursoById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
