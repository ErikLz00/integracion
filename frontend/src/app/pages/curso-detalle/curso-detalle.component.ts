import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CursosService } from '../../services/cursos.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule],
  templateUrl: './curso-detalle.component.html',
  styleUrl: './curso-detalle.component.css'
})
export class CursoDetalleComponent implements OnInit {
  curso: any;
  paypalClientId = 'AeeqRQ0BujfG9pNRWRxzRG-Lk00k9C4rZc2m6BRb9WtbBUGOsWV03BmzEvUt-bspWQAP6lExuA__H8AV';
  culqiPublicKey = 'pk_test_jVoJvVejCKevDpfH'; 
  nowPaymentsId = '4698422592';

  constructor(
    private route: ActivatedRoute,
    private cursosService: CursosService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cursosService.getCursoById(id).subscribe({
      next: (data) => {
        this.curso = data;
        this.loadPayPal();
        this.loadCulqi();
      },
      error: (err) => {
        console.error('Error al cargar curso:', err);
      }
    });
  }

  // 🧩 Cargar scripts externos
  loadPayPal() {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${this.paypalClientId}&currency=USD`;
    script.onload = () => this.initPayPalButton();
    document.body.appendChild(script);
  }

  loadCulqi() {
    const script = document.createElement('script');
    script.src = 'https://checkout.culqi.com/js/v3';
    script.onload = () => this.setupCulqi();
    document.body.appendChild(script);
  }

  // 💳 Inicializar PayPal
  initPayPalButton() {
    // @ts-ignore
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: (this.curso.precio / 3.8).toFixed(2) }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          alert(`✅ Pago realizado por ${details.payer.name.given_name}`);

          const token = localStorage.getItem('token');
          this.http.post('http://localhost:3000/api/pagos', {
            curso_id: this.curso.id,
            monto: this.curso.precio,
            metodo_pago: 'PayPal'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          }).subscribe({
            next: res => console.log('💾 Pago registrado:', res),
            error: err => console.error('❌ Error registrando pago:', err)
          });
        });
      }
    }).render('#paypal-button-container');
  }

  // 💳 Inicializar Culqi
  setupCulqi() {
    // @ts-ignore
    Culqi.publicKey = this.culqiPublicKey;
  }

  pagarTarjeta() {
  // Guardamos el curso en una variable global para que la función global culqi() pueda usarlo
  (window as any).cursoSeleccionado = this.curso;

  // @ts-ignore
  Culqi.settings({
    title: this.curso.titulo,
    currency: 'PEN',
    amount: Math.round(this.curso.precio * 100)
  });

  // @ts-ignore
  Culqi.open();
}

}

// ⚡ Evento global de Culqi (solo uno)
declare var Culqi: any;

(window as any).culqi = async function () {
  try {
    if (Culqi.token) {
      const tokenCulqi = Culqi.token.id;
      const email = Culqi.token.email;
      const cursoActual = (window as any).cursoSeleccionado;
      const tokenAuth = localStorage.getItem('token');

      if (!tokenAuth) {
        alert('⚠️ Debes iniciar sesión antes de pagar.');
        return;
      }

      console.log('✅ Token recibido de Culqi:', tokenCulqi, email);

      const response = await fetch('http://localhost:3000/api/pagos/tarjeta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAuth}`
        },
        body: JSON.stringify({
          token: tokenCulqi,
          email,
          amount: Math.round(cursoActual.precio * 100),
          curso_id: cursoActual.id
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Pago exitoso y registrado correctamente.');
      } else {
        alert('❌ Error en el pago: ' + (result.error || 'Respuesta inesperada.'));
        console.error(result);
      }
    } else if (Culqi.error?.user_message) {
      alert('⚠️ ' + Culqi.error.user_message);
    } else {
      alert('⚠️ No se pudo procesar el pago. Intenta nuevamente.');
    }
  } catch (err) {
    console.error('❌ Error en culqi():', err);
    alert('⚠️ Error inesperado al procesar el pago.');
  }
};

