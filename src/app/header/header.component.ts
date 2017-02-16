import { Component, ViewEncapsulation } from '@angular/core';
import { LanguageSwitcherService } from './language-switcher/language-switcher.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.styl']
})
export class HeaderComponent {

  private mobileMenuHidden: boolean = true;

  constructor(languageSwitcherService: LanguageSwitcherService) {
    languageSwitcherService.getLanguageChangeEmitter()
      .subscribe(() => this.mobileMenuHidden = true);
  }

  public switchMobileMenuState(): void {
    this.mobileMenuHidden = !this.mobileMenuHidden;
  }

  public getMobileMenuState(): boolean {
    return this.mobileMenuHidden;
  }
}