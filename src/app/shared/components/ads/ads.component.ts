import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { AdsService, AdsStats } from '../../../services/ads.service';

export type AdSlotSize = 'banner' | 'rectangle' | 'sidebar';

@Component({
  selector: 'app-ads',
  template: `
    <ng-container *ngIf="shouldShow">

      <!-- Banner horizontal -->
      <div class="ad-wrap ad-wrap--banner" *ngIf="slot === 'banner'">
        <span class="ad-label">Publicidade</span>
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-6681234767999952"
             [attr.data-ad-slot]="adSlotId || '1234567890'"
             data-ad-format="auto"
             data-full-width-responsive="true">
        </ins>
        <a routerLink="/pricing" class="ad-upgrade-link">Remover anúncios com PRO →</a>
      </div>

      <!-- Retângulo (meio de conteúdo) -->
      <div class="ad-wrap ad-wrap--rectangle" *ngIf="slot === 'rectangle'">
        <span class="ad-label">Publicidade</span>
        <ins class="adsbygoogle"
             style="display:inline-block;width:336px;height:280px"
             data-ad-client="ca-pub-6681234767999952"
             [attr.data-ad-slot]="adSlotId || '0987654321'">
        </ins>
        <a routerLink="/pricing" class="ad-upgrade-link">Remover anúncios com PRO →</a>
      </div>

      <!-- Sidebar -->
      <div class="ad-wrap ad-wrap--sidebar" *ngIf="slot === 'sidebar'">
        <span class="ad-label">Publicidade</span>
        <ins class="adsbygoogle"
             style="display:inline-block;width:160px;height:600px"
             data-ad-client="ca-pub-6681234767999952"
             [attr.data-ad-slot]="adSlotId || '1122334455'">
        </ins>
        <a routerLink="/pricing" class="ad-upgrade-link">PRO →</a>
      </div>

    </ng-container>
  `,
  styles: [`
    .ad-wrap {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .ad-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #bbb;
      align-self: flex-start;
    }
    .ad-upgrade-link {
      font-size: 11px;
      color: #1976d2;
      text-decoration: none;
      align-self: flex-end;
    }
    .ad-upgrade-link:hover { text-decoration: underline; }
    .ad-wrap--banner {
      width: 100%;
      padding: 8px 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
    }
    .ad-wrap--banner ins { width: 100%; }
    .ad-wrap--rectangle { margin: 16px auto; }
  `],
})
export class AdsComponent implements OnInit, AfterViewInit {
  @Input() slot: AdSlotSize = 'banner';
  @Input() adSlotId = '';

  stats: AdsStats | null = null;

  constructor(private adsService: AdsService) {}

  ngOnInit(): void {
    this.adsService.stats.subscribe((s) => (this.stats = s));
  }

  ngAfterViewInit(): void {
    if (this.shouldShow) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {}
    }
  }

  get shouldShow(): boolean {
    return this.stats !== null && !this.stats.isPaidPlan;
  }
}
