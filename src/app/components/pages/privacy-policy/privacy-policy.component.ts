import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  template: `
    <div class="legal-page">
      <div class="legal-hero">
        <h1>Política de Privacidade</h1>
        <p>Última atualização: 19 de julho de 2026</p>
      </div>

      <div class="legal-container">
        <article class="legal-content">

          <h2>1. Quem somos</h2>
          <p>O <strong>Finanti</strong> é uma plataforma SaaS de gestão de RH, controle de ponto e produtividade, desenvolvida e operada por Vinícius Fantinatto. Para dúvidas, entre em contato pelo e-mail <a href="mailto:contato@finanti.app">contato@finanti.app</a>.</p>

          <h2>2. Quais dados coletamos</h2>
          <p>Coletamos apenas os dados necessários para a prestação do serviço:</p>
          <ul>
            <li><strong>Dados de identificação:</strong> nome, e-mail e foto de perfil obtidos via OAuth (LinkedIn ou Microsoft) com o seu consentimento expresso.</li>
            <li><strong>Dados profissionais:</strong> informações de currículo (experiências, habilidades, formação) que você insere ou importa voluntariamente do LinkedIn.</li>
            <li><strong>Dados de uso:</strong> registros de ponto, atividades, tarefas e projetos criados por você na plataforma.</li>
            <li><strong>Dados de pagamento:</strong> processados exclusivamente pelo Stripe, Inc. Não armazenamos dados de cartão de crédito.</li>
            <li><strong>Dados de acesso:</strong> logs de autenticação, endereço IP e informações do dispositivo para fins de segurança.</li>
          </ul>

          <h2>3. Como usamos os dados</h2>
          <p>Seus dados são usados exclusivamente para:</p>
          <ul>
            <li>Fornecer e melhorar as funcionalidades da plataforma;</li>
            <li>Processar pagamentos e gerenciar assinaturas;</li>
            <li>Enviar comunicações transacionais (confirmações, alertas de conta);</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>
          <p>Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais.</p>

          <h2>4. Cookies e tecnologias similares</h2>
          <p>Utilizamos cookies essenciais para manter sua sessão autenticada. Também utilizamos cookies de terceiros para:</p>
          <ul>
            <li><strong>Google AdSense:</strong> exibição de anúncios personalizados para usuários do plano gratuito. Você pode gerenciar suas preferências em <a href="https://adssettings.google.com" target="_blank" rel="noopener">adssettings.google.com</a>.</li>
            <li><strong>Vercel Analytics:</strong> análise de desempenho da plataforma de forma anônima.</li>
          </ul>

          <h2>5. Compartilhamento de dados</h2>
          <p>Compartilhamos dados apenas com prestadores de serviço necessários à operação da plataforma:</p>
          <ul>
            <li><strong>Stripe:</strong> processamento de pagamentos (política: <a href="https://stripe.com/br/privacy" target="_blank" rel="noopener">stripe.com/br/privacy</a>);</li>
            <li><strong>Supabase / PostgreSQL:</strong> armazenamento seguro dos dados;</li>
            <li><strong>Vercel:</strong> hospedagem da plataforma;</li>
            <li><strong>LinkedIn / Microsoft:</strong> autenticação OAuth.</li>
          </ul>

          <h2>6. Seus direitos (LGPD)</h2>
          <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
          <ul>
            <li>Confirmar a existência de tratamento de seus dados;</li>
            <li>Acessar seus dados;</li>
            <li>Corrigir dados incompletos ou desatualizados;</li>
            <li>Solicitar a exclusão de seus dados;</li>
            <li>Revogar o consentimento a qualquer momento.</li>
          </ul>
          <p>Para exercer seus direitos, envie um e-mail para <a href="mailto:privacidade@finanti.app">privacidade@finanti.app</a>.</p>

          <h2>7. Retenção de dados</h2>
          <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após a exclusão da conta, os dados são removidos em até 30 dias, exceto quando houver obrigação legal de retenção.</p>

          <h2>8. Segurança</h2>
          <p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo: criptografia em trânsito (HTTPS/TLS), autenticação JWT com expiração, controle de acesso por função e backups regulares.</p>

          <h2>9. Alterações nesta política</h2>
          <p>Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos alterações significativas por e-mail ou notificação na plataforma. O uso continuado após as alterações implica aceitação.</p>

          <h2>10. Contato</h2>
          <p>Para questões sobre privacidade: <a href="mailto:privacidade@finanti.app">privacidade@finanti.app</a><br>
          Para suporte geral: <a routerLink="/contato">página de contato</a>.</p>

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
export class PrivacyPolicyComponent implements OnInit {
  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Política de Privacidade | Finanti');
    this.meta.updateTag({ name: 'description', content: 'Saiba como o Finanti coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.' });
  }
}
