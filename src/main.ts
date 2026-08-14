import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (!environment.production) {
  const s = document.createElement('script');
  s.src = 'http://localhost:8400/live.js';
  document.body.appendChild(s);
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
