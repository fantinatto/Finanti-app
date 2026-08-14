import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionsService } from '../services/permissions.service';

@Directive({ selector: '[appHasFeature]' })
export class HasFeatureDirective implements OnInit, OnDestroy {
  @Input() appHasFeature!: string;

  private sub?: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissions: PermissionsService
  ) {}

  ngOnInit(): void {
    this.sub = this.permissions.hasFeature(this.appHasFeature).subscribe(has => {
      this.viewContainer.clear();
      if (has) this.viewContainer.createEmbeddedView(this.templateRef);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
