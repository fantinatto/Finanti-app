import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-terms',
  template: `
    <div class="legal-page">
      <div class="legal-hero">
        <h1>Termos de Uso</h1>
        <p>Última atualização: 19 de julho de 2026</p>
      </div>

      <div class="legal-container">
        <article class="legal-content">

          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar ou utilizar o <strong>Finanti</strong>, você concorda em ficar vinculado a estes Termos de Uso. Se não concordar com qualquer parte, não utilize a plataforma.</p>

          <h2>2. Descrição do Serviço</h2>
          <p>O Finanti é uma plataforma SaaS que oferece:</p>
          <ul>
            <li>Controle de ponto e apontamento de horas;</li>
            <li>Gestão de projetos e board Kanban;</li>
            <li>Currículo digital e gestão de habilidades;</li>
            <li>Relatórios de produtividade.</li>
          </ul>
          <p>O serviço é disponibilizado nos planos Gratuito, Individual, PJ/Freelancer e Empresarial, conforme descrito na <a routerLink="/pricing">página de planos</a>.</p>

          <h2>3. Cadastro e Conta</h2>
          <p>Para usar o Finanti, você deve autenticar-se via LinkedIn ou Microsoft OAuth. Você é responsável por:</p>
          <ul>
            <li>Manter a confidencialidade de suas credenciais;</li>
            <li>Todas as atividades realizadas sob sua conta;</li>
            <li>Notificar imediatamente qualquer uso não autorizado.</li>
          </ul>

          <h2>4. Planos e Pagamento</h2>
          <p>Planos pagos são cobrados mensalmente via Stripe. Ao assinar:</p>
          <ul>
            <li>A cobrança é recorrente e automática na data de renovação;</li>
            <li>Cancelamentos entram em vigor ao final do período vigente;</li>
            <li>Reembolsos podem ser solicitados em até 7 dias após a cobrança.</li>
          </ul>
          <p>O plano Gratuito está sujeito à exibição de anúncios (Google AdSense e vídeos patrocinados).</p>

          <h2>5. Uso Aceitável</h2>
          <p>É proibido:</p>
          <ul>
            <li>Usar o serviço para fins ilegais ou fraudulentos;</li>
            <li>Violar direitos de propriedade intelectual de terceiros;</li>
            <li>Tentar acessar sistemas ou dados de outros usuários;</li>
            <li>Realizar engenharia reversa da plataforma;</li>
            <li>Transmitir malware ou código malicioso.</li>
          </ul>

          <h2>6. Propriedade Intelectual</h2>
          <p>O código, design, marcas e conteúdo do Finanti são propriedade exclusiva de Vinícius Fantinatto. Você mantém a propriedade de todos os dados que inserir na plataforma.</p>

          <h2>7. Privacidade</h2>
          <p>O uso de seus dados é regido pela nossa <a routerLink="/privacidade">Política de Privacidade</a>, incorporada a estes termos por referência.</p>

          <h2>8. Disponibilidade</h2>
          <p>Buscamos manter a plataforma disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência quando possível.</p>

          <h2>9. Limitação de Responsabilidade</h2>
          <p>O Finanti é fornecido "como está". Em nenhuma hipótese seremos responsáveis por danos indiretos, lucros cessantes ou perda de dados resultantes do uso ou impossibilidade de uso da plataforma.</p>

          <h2>10. Alterações nos Termos</h2>
          <p>Podemos alterar estes Termos a qualquer momento. Notificaremos alterações relevantes por e-mail. O uso continuado após as alterações implica aceitação.</p>

          <h2>11. Lei Aplicável e Foro</h2>
          <p>Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>

          <h2>12. Contato</h2>
          <p>Para dúvidas sobre estes Termos: <a href="mailto:contato@finanti.app">contato@finanti.app</a></p>

        </article>
      </div>
    </div>
  `,
  styles: [`
    .legal-page { min-height: 100vh; background: #f8fafc; }
    .legal-hero {
      background: linear-gradient(135deg, #1A3C56 0%, #0e6ba8 100%);
      color: #fff;
      text-align: center;
      padding: 56px 24px 40px;
    }
    .legal-hero h1 { font-size: clamp(24px, 4vw, 40px); font-weight: 800; margin: 0 0 8px; }
    .legal-hero p { font-size: 14px; opacity: 0.75; margin: 0; }
    .legal-container { max-width: 780px; margin: 0 auto; padding: 40px 24px 64px; }
    .legal-content {
      background: #fff;
      border-radius: 12px;
      padding: 40px 48px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      line-height: 1.8;
      color: #1f2937;
      font-size: 15px;
    }
    .legal-content h2 {
      font-size: 19px;
      font-weight: 700;
      color: #1A3C56;
      margin: 32px 0 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e5e7eb;
    }
    .legal-content h2:first-child { margin-top: 0; }
    .legal-content p { margin: 0 0 14px; }
    .legal-content ul { margin: 0 0 14px 20px; }
    .legal-content li { margin-bottom: 6px; }
    .legal-content a { color: #0e6ba8; text-decoration: none; }
    .legal-content a:hover { text-decoration: underline; }
    @media (max-width: 600px) {
      .legal-content { padding: 24px 20px; }
    }
  `]
})
export class TermsComponent implements OnInit {
  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Termos de Uso | Finanti');
    this.meta.updateTag({ name: 'description', content: 'Termos de Uso do Finanti: regras de utilização da plataforma, planos, pagamento e responsabilidades.' });
  }
}
