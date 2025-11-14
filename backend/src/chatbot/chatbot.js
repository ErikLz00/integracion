class Chatbot {
  constructor() {
    this.cursos = {
      'programacion': [
        'Python desde Cero - $50',
        'JavaScript Avanzado - $60'
      ],
      'diseno': [
        'Diseño UI/UX - $45',
        'Photoshop - $55'
      ]
    };
  }

  generarRespuesta(mensaje) {
    const mensajeLower = mensaje.toLowerCase().trim();
    
    if (mensajeLower.includes('hola')) {
      return '¡Hola! 👋 ¿Buscas algún curso?';
    } else if (mensajeLower.includes('curso')) {
      return 'Tenemos cursos de programación y diseño. ¿Cuál te interesa?';
    } else if (mensajeLower.includes('programacion')) {
      return '💻 **Cursos de Programación:**\n' + this.cursos.programacion.join('\n');
    } else if (mensajeLower.includes('diseño')) {
      return '🎨 **Cursos de Diseño:**\n' + this.cursos.diseno.join('\n');
    } else {
      return '🤔 ¿Podrías contarme más sobre qué curso buscas?';
    }
  }
}

export default Chatbot;