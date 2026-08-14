import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AdsService } from '../../../services/ads.service';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiLoaded = false;
let ytApiReady = false;
const ytReadyCallbacks: Array<() => void> = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (ytApiReady) { resolve(); return; }
    ytReadyCallbacks.push(resolve);
    if (!ytApiLoaded) {
      ytApiLoaded = true;
      window.onYouTubeIframeAPIReady = () => {
        ytApiReady = true;
        ytReadyCallbacks.forEach((cb) => cb());
        ytReadyCallbacks.length = 0;
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });
}

@Component({
  selector: 'app-video-ad',
  template: `
    <div class="video-ad-overlay" *ngIf="visible">
      <div class="video-ad-modal">

        <div class="video-ad-header">
          <span class="video-ad-label">Anúncio</span>
          <span class="video-ad-counter" [class.ready]="canSkip">
            {{ canSkip ? 'Pode fechar!' : (playerError ? 'Erro — ' + fallbackCountdown + 's' : 'Assista até o final') }}
          </span>
        </div>

        <div class="video-ad-body">
          <div class="yt-loading" *ngIf="!playerReady && !playerError">
            <div class="yt-spinner"></div>
            <small>Carregando vídeo...</small>
          </div>
          <div class="yt-error" *ngIf="playerError">
            <span>⚠️</span>
            <small>Não foi possível carregar o vídeo. Liberando em {{ fallbackCountdown }}s...</small>
          </div>
          <!-- div que o YT Player substitui -->
          <div id="yt-player-container" [style.display]="playerReady ? 'block' : 'none'"></div>
        </div>

        <div class="video-ad-footer">
          <a routerLink="/pricing" class="btn-upgrade" (click)="close()">
            ⭐ Remover anúncios com PRO
          </a>
          <button class="btn-close" [disabled]="!canSkip" (click)="finish()">
            {{ canSkip ? 'Continuar →' : 'Assista até o final' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .video-ad-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .video-ad-modal {
      background: #fff;
      border-radius: 12px;
      width: min(560px, 96vw);
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    }
    .video-ad-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: #1a1a1a;
    }
    .video-ad-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
    }
    .video-ad-counter {
      font-size: 12px;
      font-weight: 600;
      color: #facc15;
    }
    .video-ad-counter.ready { color: #4ade80; }
    .video-ad-body {
      background: #000;
      position: relative;
      min-height: 315px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #yt-player-container { width: 100%; }
    #yt-player-container iframe { display: block; width: 100%; height: 315px; }
    .yt-loading, .yt-error {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #aaa;
    }
    .yt-error span { font-size: 32px; }
    .yt-error small, .yt-loading small { font-size: 13px; color: #666; }
    .yt-spinner {
      width: 36px; height: 36px;
      border: 3px solid #333;
      border-top-color: #facc15;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .video-ad-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      gap: 12px;
      border-top: 1px solid #eee;
    }
    .btn-upgrade { font-size: 13px; color: #16a34a; text-decoration: none; font-weight: 500; }
    .btn-upgrade:hover { text-decoration: underline; }
    .btn-close {
      padding: 8px 20px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      background: #1A3C56;
      color: #fff;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    .btn-close:disabled { background: #d1d5db; color: #9ca3af; cursor: not-allowed; }
    .btn-close:not(:disabled):hover { opacity: 0.85; }
  `],
})
export class VideoAdComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() videoId = 'dQw4w9WgXcQ'; // substituir pelo ID do vídeo de anúncio real

  private readonly adEnabled = false;
  visible = false;
  canSkip = false;
  playerReady = false;
  playerError = false;
  fallbackCountdown = 15;

  private player: any = null;
  private needsPlayerInit = false;
  private fallbackTimer: any = null;

  constructor(
    private ads: AdsService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.ads.stats.subscribe((s) => {
      if (this.adEnabled && s && !s.isPaidPlan && s.videosOwed > 0 && !this.visible) {
        this.openModal();
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.needsPlayerInit) {
      this.needsPlayerInit = false;
      this.initPlayer();
    }
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
    clearInterval(this.fallbackTimer);
  }

  private openModal(): void {
    this.visible = true;
    this.canSkip = false;
    this.playerReady = false;
    this.playerError = false;
    this.fallbackCountdown = 15;
    this.needsPlayerInit = true;
  }

  private async initPlayer(): Promise<void> {
    const el = document.getElementById('yt-player-container');
    if (!el) return;

    // Fallback: libera após 15s caso o player não carregue ou falhe
    this.fallbackTimer = setInterval(() => {
      this.zone.run(() => {
        this.fallbackCountdown--;
        if (this.fallbackCountdown <= 0) {
          clearInterval(this.fallbackTimer);
          this.canSkip = true;
          this.cdr.markForCheck();
        }
      });
    }, 1000);

    try {
      await loadYouTubeAPI();

      this.zone.runOutsideAngular(() => {
        this.player = new window.YT.Player('yt-player-container', {
          videoId: this.videoId,
          width: '100%',
          height: '315',
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: () => {
              this.zone.run(() => {
                clearInterval(this.fallbackTimer);
                this.playerReady = true;
                this.cdr.markForCheck();
              });
            },
            onStateChange: (event: any) => {
              // YT.PlayerState.ENDED = 0
              if (event.data === 0) {
                this.zone.run(() => {
                  this.canSkip = true;
                  this.cdr.markForCheck();
                });
              }
            },
            onError: () => {
              this.zone.run(() => {
                this.playerReady = false;
                this.playerError = true;
                this.cdr.markForCheck();
              });
            },
          },
        });
      });
    } catch {
      this.zone.run(() => {
        this.playerError = true;
        this.cdr.markForCheck();
      });
    }
  }

  private destroyPlayer(): void {
    try { this.player?.destroy(); } catch {}
    this.player = null;
  }

  finish(): void {
    if (!this.canSkip) return;
    this.close();
    this.ads.recordWatch().subscribe();
  }

  close(): void {
    this.visible = false;
    this.destroyPlayer();
    clearInterval(this.fallbackTimer);
  }
}
