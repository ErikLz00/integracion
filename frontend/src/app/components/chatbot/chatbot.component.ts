import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';


interface ChatResponse {
  reply: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,  // ← AGREGAR ESTA LÍNEA
  imports: [CommonModule, FormsModule],  // ← AGREGAR ESTOS IMPORTS
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})


export class ChatbotComponent {
  
  mostrarChat = false;
  mensajes: { texto: string, esUsuario: boolean }[] = [];
  inputMensaje = '';
  cargando = false;

  constructor(private chatbotService: ChatbotService) {}
  

  toggleChat() {
    this.mostrarChat = !this.mostrarChat;
     // 👇 Cuando se abre por primera vez, obtener el saludo
    if (this.mostrarChat && this.mensajes.length === 0) {
      this.chatbotService.obtenerSaludo().subscribe({
        next: (data: { reply: string }) => {
          this.mensajes.push({ texto: data.reply, esUsuario: false });
        },
        error: (err) => {
          console.error('Error obteniendo saludo:', err);
          this.mensajes.push({ texto: '👋 ¡Hola! Soy tu asistente. ¿En qué puedo ayudarte?', esUsuario: false });
        }
      });
    }
  }

  enviarMensaje() {
    const texto = this.inputMensaje.trim();
    if (!texto) return;

    this.mensajes.push({ texto, esUsuario: true });
    this.inputMensaje = '';
    this.cargando = true;

    this.chatbotService.enviarMensaje(texto).subscribe({
      next: (data: { reply: string }) => {
      this.mensajes.push({ texto: data.reply, esUsuario: false });
      this.cargando = false;
    },
      error: (err) => {
        console.error('Error en chatbot:', err);
        this.mensajes.push({ texto: '❌ Error al conectar con el asistente.', esUsuario: false });
        this.cargando = false;
      }
    });
  }

}