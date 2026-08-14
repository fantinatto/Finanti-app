import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  template: `
    <div class="contact-page">
      <div class="contact-hero">
        <h1>Fale Conosco</h1>
        <p>Tem alguma dúvida, sugestão ou problema? Estamos aqui para ajudar.</p>
      </div>

      <div class="contact-container">
        <div class="contact-grid">

          <div class="contact-info">
            <h2>Entre em contato</h2>
            <p>Responderemos em até 1 dia útil.</p>

            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <div>
                <strong>E-mail de suporte</strong>
                <a href="mailto:contato@finanti.app">contato@finanti.app</a>
              </div>
            </div>

            <div class="contact-item">
              <span class="contact-icon">🔒</span>
              <div>
                <strong>Privacidade e LGPD</strong>
                <a href="mailto:privacidade@finanti.app">privacidade@finanti.app</a>
              </div>
            </div>

            <div class="contact-item">
              <span class="contact-icon">💳</span>
              <div>
                <strong>Questões de pagamento</strong>
                <a href="mailto:financeiro@finanti.app">financeiro@finanti.app</a>
              </div>
            </div>

            <div class="contact-links">
              <h3>Links úteis</h3>
              <ul>
                <li><a routerLink="/pricing">Planos e preços</a></li>
                <li><a routerLink="/privacidade">Política de Privacidade</a></li>
                <li><a routerLink="/termos">Termos de Uso</a></li>
                <li><a routerLink="/blog">Blog com tutoriais</a></li>
              </ul>
            </div>
          </div>

          <div class="contact-form-card">
            <h2>Envie uma mensagem</h2>
            <form class="contact-form" (submit)="send($event)">
              <div class="form-group">
                <label for="name">Nome</label>
                <input id="name" type="text" [(ngModel)]="form.name" name="name" placeholder="Seu nome completo" required>
              </div>
              <div class="form-group">
                <label for="email">E-mail</label>
                <input id="email" type="email" [(ngModel)]="form.email" name="email" placeholder="seu@email.com" required>
              </div>
              <div class="form-group">
                <label for="subject">Assunto</label>
                <select id="subject" [(ngModel)]="form.subject" name="subject">
                  <option value="suporte">Suporte técnico</option>
                  <option value="pagamento">Questão de pagamento</option>
                  <option value="privacidade">Privacidade / LGPD</option>
                  <option value="sugestao">Sugestão de melhoria</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div class="form-group">
                <label for="message">Mensagem</label>
                <textarea id="message" [(ngModel)]="form.message" name="message" rows="5" placeholder="Descreva sua dúvida ou comentário..." required></textarea>
              </div>
              <button type="submit" class="btn-submit" [disabled]="sent">
                {{ sent ? 'Mensagem enviada! ✓' : 'Enviar mensagem' }}
              </button>
            </form>
            <p class="form-note" *ngIf="sent">
              Recebemos sua mensagem. Responderemos em até 1 dia útil no e-mail informado.
            </p>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-page { min-height: 100vh; background: #f8fafc; }
    .contact-hero {
      background: linear-gradient(135deg, #1A3C56 0%, #0e6ba8 100%);
      color: #fff;
      text-align: center;
      padding: 56px 24px 40px;
    }
    .contact-hero h1 { font-size: clamp(24px, 4vw, 40px); font-weight: 800; margin: 0 0 10px; }
    .contact-hero p { font-size: 16px; opacity: 0.85; margin: 0; }
    .contact-container { max-width: 1000px; margin: 0 auto; padding: 40px 24px 64px; }
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 32px;
      align-items: start;
    }
    .contact-info h2, .contact-form-card h2 {
      font-size: 20px;
      font-weight: 700;
      color: #1A3C56;
      margin: 0 0 8px;
    }
    .contact-info > p { color: #6b7280; font-size: 14px; margin: 0 0 24px; }
    .contact-item {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .contact-icon { font-size: 22px; margin-top: 2px; }
    .contact-item strong { display: block; font-size: 13px; color: #374151; margin-bottom: 2px; }
    .contact-item a { font-size: 14px; color: #0e6ba8; text-decoration: none; }
    .contact-item a:hover { text-decoration: underline; }
    .contact-links { margin-top: 28px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .contact-links h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; margin: 0 0 12px; }
    .contact-links ul { list-style: none; padding: 0; margin: 0; }
    .contact-links li { margin-bottom: 8px; }
    .contact-links a { font-size: 14px; color: #1A3C56; text-decoration: none; }
    .contact-links a:hover { text-decoration: underline; }
    .contact-form-card {
      background: #fff;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
    .contact-form-card h2 { margin-bottom: 24px; }
    .contact-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 13px; font-weight: 600; color: #374151; }
    .form-group input, .form-group select, .form-group textarea {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 14px;
      color: #111827;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: #1A3C56;
    }
    .form-group textarea { resize: vertical; }
    .btn-submit {
      padding: 12px 24px;
      background: #1A3C56;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-submit:hover:not(:disabled) { opacity: 0.85; }
    .btn-submit:disabled { background: #9ca3af; cursor: default; }
    .form-note { font-size: 13px; color: #16a34a; margin: 12px 0 0; }
    @media (max-width: 700px) {
      .contact-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ContactComponent implements OnInit {
  form = { name: '', email: '', subject: 'suporte', message: '' };
  sent = false;

  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Contato | Finanti');
    this.meta.updateTag({ name: 'description', content: 'Entre em contato com a equipe Finanti para suporte técnico, dúvidas de pagamento ou questões de privacidade.' });
  }

  send(event: Event): void {
    event.preventDefault();
    const { name, email, subject, message } = this.form;
    const body = encodeURIComponent(`Nome: ${name}\n\nMensagem:\n${message}`);
    window.open(`mailto:contato@finanti.app?subject=${encodeURIComponent(`[${subject}] Contato de ${name}`)}&body=${body}`);
    this.sent = true;
  }
}
