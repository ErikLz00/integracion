import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private apiUrl = 'http://localhost:3000/api/chatbot';

  constructor(private http: HttpClient) {}

  enviarMensaje(mensaje: string): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token'); // 👈 Asegúrate que guardas así el token
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(this.apiUrl, 
      { message: mensaje }, // 👈 Ya NO enviar usuario_id aquí
      { headers }
    );
  }
  obtenerSaludo(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.get(`${this.apiUrl}/saludo`, { headers });
}
}

