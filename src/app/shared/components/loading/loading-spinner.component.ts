import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-spinner-wrapper" [class.loading-spinner-wrapper--fullpage]="fullpage">
      <div class="loading-spinner__ring">
        <div></div><div></div><div></div><div></div>
      </div>
      <p *ngIf="message" class="loading-spinner__msg">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      gap: 1rem;
    }
    .loading-spinner-wrapper--fullpage {
      min-height: 60vh;
    }
    .loading-spinner__ring {
      display: inline-block;
      position: relative;
      width: 48px;
      height: 48px;
    }
    .loading-spinner__ring div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 40px;
      height: 40px;
      margin: 4px;
      border: 4px solid #6366f1;
      border-radius: 50%;
      animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: #6366f1 transparent transparent transparent;
    }
    .loading-spinner__ring div:nth-child(1) { animation-delay: -0.45s; }
    .loading-spinner__ring div:nth-child(2) { animation-delay: -0.3s; }
    .loading-spinner__ring div:nth-child(3) { animation-delay: -0.15s; }
    @keyframes spin {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .loading-spinner__msg {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() message = '';
  @Input() fullpage = false;
}
