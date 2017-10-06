import { $, $$, browser, ElementArrayFinder, ElementFinder, ExpectedConditions as EC } from 'protractor';

import { CommonChartPage } from './common-chart.po';
import {
  findElementByExactText, isCountryAddedInUrl, waitForSliderToBeReady,
  waitForSpinner
} from '../helpers/helper';
import { Slider } from './components/slider.e2e-component';
import { ExtendedElementFinder, _$, _$$, ExtendedArrayFinder } from '../helpers/ExtendedElementFinder';

export class LineChart extends CommonChartPage {
  type = 'lineChart';
  url = '#_chart-type=linechart';
  chartLink: ExtendedElementFinder = _$('a[href*="linechart"]');

  opacity = {
    highlighted: 1,
    dimmed: 0.3
  };

  dataDoubtsLink: ExtendedElementFinder = _$('.vzb-data-warning');

  // dataDoubtsLink: ElementFinder = $('.vzb-data-warning');
  dataDoubtsWindow: ElementFinder = $('.vzb-data-warning-box');

  /**
   * specific Line chart selectors
   */
  latestPointOnChart: ElementFinder = $('[class="vzb-axis-value"]');
  selectedCountries: ExtendedArrayFinder = _$$('.vzb-lc-labelname.vzb-lc-labelfill');
  yAsixDropdownOptions: ExtendedArrayFinder = _$$('.vzb-treemenu-list-item-label');
  yAxisBtn: ExtendedElementFinder = _$('.vzb-lc-axis-y-title');
  axisValues: ElementArrayFinder = $$('.vzb-lc-axis-x .tick text');
  countriesLines: ElementArrayFinder = $$('.vzb-lc-line');

  public linesChartShowAllButton: ElementFinder = $('.vzb-dialog-button.vzb-show-deselect');
  public linesChartRightSidePanelCountriesList: ElementArrayFinder = $$('.vzb-show-item.vzb-dialog-checkbox');
  public linesChartDataDoubtsLabel: ElementArrayFinder = $$('g[class="vzb-data-warning vzb-noexport"]');
  public linesChartSelectedCountries: ElementArrayFinder = $$('.vzb-lc-label');
  public advancedControlsRightSidePanelFindButton: ElementFinder = $$('[data-btn="find"]').last();

  // TODO maybe it should be moved to sidebar po
  countryList: ElementFinder = $$('[class="vzb-show-item vzb-dialog-checkbox"]').first();
  resetBtn: ExtendedElementFinder = _$('.vzb-show-deselect');

  /**
   * default sidebar elements
   * change it carefully
   */
  public sidebar = {
    searchSection: $('.vzb-show-filter'),
    countriesList: $('.vzb-show-list'),
    resetFilterButton: $('.vzb-show-deselect')
  };

  /**
   * specific sidebar elements, unique for Lines chart
   */
  public searchInputField: ExtendedElementFinder = _$('.vzb-show-search');
  public searchResult: ExtendedArrayFinder = _$$('div[class="vzb-show-item vzb-dialog-checkbox"] label'); // TODO maybe add test class to vizabi

  getSidebarElements() {
    return this.sidebar;
  }

  async openChart(): Promise<void> {
    await super.openChart();

    await new Slider().waitForSliderToBeReady();
  }

  async refreshPage(): Promise<void> {
    await super.refreshPage();
    await browser.wait(EC.visibilityOf(this.countriesLines.first()));
  }

  getSelectedCountries() {
    return this.selectedCountries;
  }

  async selectLine(country: string): Promise<void> {
    await new ExtendedElementFinder(findElementByExactText(this.selectedCountries, country)).safeClick();
    await browser.wait(isCountryAddedInUrl(country));
  }

  async getLineOpacity(country: string): Promise<number> {
    this.selectedCountries.findElementByExactText(country).safeGetCssValue('opacity');
    return Number(await findElementByExactText(this.selectedCountries, country).getCssValue('opacity'));
  }

  async countHighlightedLines(): Promise<number> {
    return this.countLinesByOpacity(this.opacity.highlighted);
  }

  async countDimmedLines(): Promise<number> {
    return this.countLinesByOpacity(this.opacity.dimmed);
  }

  async countLinesByOpacity(opacity: number): Promise<number> {
    return $$(`.vzb-lc-lines .vzb-lc-entity[style="opacity: ${opacity};"]`).count();
  }

  async hoverLine(country: string): Promise<void> {
    await this.selectedCountries
      .findElementByExactText(country)
      .hover();
  }

  async changeYaxisValue(): Promise<string> {
    await this.yAxisBtn.safeClick();
    const newOption: ExtendedElementFinder = this.yAsixDropdownOptions.first();

    await browser.wait(EC.visibilityOf(newOption));
    const newOptionValue = newOption.getText();
    await newOption.click();

    await waitForSpinner();
    await waitForSliderToBeReady();

    return newOptionValue;
  }

  async clickResetButton(): Promise<void> {
    await this.resetBtn.safeClick();
    await waitForSpinner();
    await waitForSliderToBeReady();
  }

  async getLineLabelColor(country: string) {
    return await findElementByExactText(this.selectedCountries, country).getCssValue('fill');
  }
}
