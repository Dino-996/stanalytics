/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const theme:Array<string> = ['light', 'dark'];

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
