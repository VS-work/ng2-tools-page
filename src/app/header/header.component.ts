import { Component, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getAllLanguages,
  getAllMenuItems,
  getSelectedLanguage,
  getSelectedMenuItem,
  isLanguageSwitcherVisible,
  isMobileMenuHidden,
  State
} from '../core/store';
import { Observable } from 'rxjs/Observable';
import {
  SelectMenuItem,
  SetLanguageChooserVisibility,
  SwitchLanguageChooserVisibility,
  SwitchMobileMenuVisibility,
} from '../core/store/layout/layout.actions';
import { Language } from '../core/store/language/language';
import { ChangeLanguage } from '../core/store/language/language.actions';

import { PromptForSharingLink, PromptForShortUrl } from '../core/store/user-interaction/user-interaction.actions';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.styl']
})
export class HeaderComponent {
  allLanguages$: Observable<ReadonlyArray<Language>>;
  selectedLanguage$: Observable<Language>;
  isLanguageSwitcherVisible$: Observable<boolean>;

  menuItems$: Observable<any[]>;
  isMobileMenuHidden$: Observable<boolean>;
  selectedMenuItem$: Observable<any>;

  constructor(private store: Store<State>) {
    this.menuItems$ = this.store.select(getAllMenuItems);
    this.selectedMenuItem$ = this.store.select(getSelectedMenuItem);
    this.isMobileMenuHidden$ = this.store.select(isMobileMenuHidden);
    this.allLanguages$ = this.store.select(getAllLanguages);
    this.selectedLanguage$ = this.store.select(getSelectedLanguage);
    this.isLanguageSwitcherVisible$ = this.store.select(isLanguageSwitcherVisible);
  }

  selectMenuItem(item: any): void {
    this.store.dispatch(new SelectMenuItem(item));
  }

  switchMobileMenuVisibility(): void {
    this.store.dispatch(new SwitchMobileMenuVisibility());
  }

  changeLanguage(language: Language): void {
    this.store.dispatch(new ChangeLanguage(language));
  }

  hideLanguageChooser() {
    this.store.dispatch(new SetLanguageChooserVisibility(false));
  }

  switchLanguageChooser() {
    this.store.dispatch(new SwitchLanguageChooserVisibility());
  }

  getEmbeddedUrl(): void {
    this.store.dispatch(new PromptForSharingLink());
  }

  shareLink(): void {
    this.store.dispatch(new PromptForShortUrl());
  }
}
