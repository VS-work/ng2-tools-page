import { $, $$, browser } from 'protractor';

import { safeOpen } from '../helpers/helper';
import { Header } from '../pageObjects/components';
import { AgesChart, BubbleChart, LineChart, MapChart, MountainChart, RankingsChart } from '../pageObjects/charts';

describe('Header: ', () => {
  const header: Header = new Header();

  beforeAll(async() => {
    await safeOpen('');
  });

  it('change language to RTL', async() => {
    await header.changeLanguageToRtl();

    await expect($('.wrapper.page-lang-rtl').isPresent()).toBeTruthy();
    await expect($('.vzb-rtl').isPresent()).toBeTruthy();
  });

  it('change language to English', async() => {
    await header.changeLanguageToEng();

    await expect($('.wrapper.page-lang-rtl').isPresent()).toBeFalsy();
    await expect($('.vzb-rtl').isPresent()).toBeFalsy();
  });

  it('"How to use" popup contains Vimeo player', async() => {
    await header.openHowToUsePopup();

    expect(await header.vimeoIframe.safeGetAttribute('src')).toEqual('https://player.vimeo.com/video/231885967');
  });


  describe('chart switcher', () => {
    const mapChart: MapChart = new MapChart();
    const mountainChart: MountainChart = new MountainChart();
    const lineChart: LineChart = new LineChart();
    const rankingsChart: RankingsChart = new RankingsChart();
    const bubbleChart: BubbleChart = new BubbleChart();
    const agesChart: AgesChart = new AgesChart();

    beforeAll(async() => {
      await safeOpen('');
    });

    it(`chart links`, async() => {
      const expectedLinks = [
        `/tools/#_${mapChart.url}`,
        `/tools/#_${mountainChart.url}`,
        `/tools/#_${lineChart.url}`,
        `/tools/#_${rankingsChart.url}`,
        `/tools/#_${bubbleChart.url}`,
        `/tools/#_${agesChart.url}`
      ];

      const chartLinks = $$('.chart-switcher-options a');
      const links = await browser.executeScript(function(selector){
        const chartLinks = document.querySelectorAll(`${selector}`);
        return [...chartLinks].map(el => el.getAttribute('href')).sort();
      }, chartLinks.first().locator().value);

      await expect(expectedLinks.sort()).toEqual(links as any);
    });
  });
});
