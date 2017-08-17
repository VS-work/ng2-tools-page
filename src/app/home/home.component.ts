import { AfterViewInit, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import * as _ from 'lodash';

import 'rxjs/add/operator/distinctUntilChanged';
import { Store } from '@ngrx/store';
import {
  getCreatedVizabiInstance,
  getCurrentLocale,
  getCurrentVizabiModelHash,
  getInitialToolsSetup,
  getSelectedTool,
  State
} from '../core/store';
import { TrackGaPageEvent, TrackGaVizabiModelChangeEvent } from '../core/store/google/google.actions';
import { VizabiLocale } from '../core/store/language/language';
import { VizabiInstanceCreated, VizabiModelChanged } from '../core/store/tools/tools.actions';
import { Subscription } from 'rxjs/Subscription';
import { VizabiToolsService } from '../core/vizabi-tools-service';

const { WsReader } = require('vizabi-ws-reader');

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.styl']
})

export class HomeComponent implements AfterViewInit, OnDestroy {
  slugs: any[];
  currentChartType: string = '';
  currentHashModel: any;

  readerModuleObject: any = WsReader;
  readerParams = [];
  extResources: any = {
    host: environment.wsUrl + '/',
    dataPath: '/api/ddf/',
    preloadPath: 'api/vizabi/'
  };

  private defaultTool: string;
  private tools: any;
  private toolToSlug = {};
  private vizabiInstances = {};

  private vizabiModelChangesSubscription: Subscription;
  private vizabiCreationSubscription: Subscription;
  private initialToolsSetupSubscription: Subscription;
  private localeChangesSubscription: Subscription;
  private toolChangesSubscription: Subscription;
  private routesModelChangesSubscription: Subscription;

  constructor(private router: Router,
              private location: Location,
              private vizabiToolsService: VizabiToolsService,
              private store: Store<State>) {

    this.initialToolsSetupSubscription = this.store.select(getInitialToolsSetup).subscribe((initial) => {
      this.tools = initial.tools;
      this.slugs = initial.slugs;
      this.defaultTool = initial.defaultTool;
      this.toolToSlug = initial.toolToSlug;
      this.vizabiInstances = initial.initialVizabiInstances;

      const model = this.vizabiToolsService.getModelFromUrl();
      this.store.dispatch(new VizabiModelChanged(model));
    });

    this.vizabiCreationSubscription = this.store.select(getCreatedVizabiInstance).filter(({ tool, instance }) => !!tool).subscribe(({ tool, instance }) => {
      this.vizabiInstances[tool] = Object.assign({}, this.vizabiInstances[tool], instance);
    });

    this.vizabiModelChangesSubscription = this.store.select(getCurrentVizabiModelHash)
      .filter(hashModel => this.vizabiToolsService.areModelsEqual(this.currentHashModel, hashModel))
      .filter(hashModel => !!Object.keys(hashModel).length)
      .map(hashModel => {
        if (!_.includes(this.slugs, hashModel['chart-type'])) {
          return { 'chart-type': 'bubbles' };
        }
        return hashModel;
      })
      .subscribe((hashModel) => {
        setTimeout(() => {
          this.currentHashModel = hashModel;
          this.currentChartType = hashModel['chart-type'];

          const stringModel = this.vizabiToolsService.convertModelToString(this.currentHashModel);
          window.location.hash = `#${stringModel}`;
          this.vizabiInstances[this.currentChartType].modelHash = stringModel;

          const currentPathWithHash = this.location.path(true);
          this.store.dispatch(new TrackGaPageEvent(currentPathWithHash));
          this.store.dispatch(new TrackGaVizabiModelChangeEvent(currentPathWithHash));

          const vizabiInstance = this.vizabiInstances[this.currentChartType].instance;
          if (vizabiInstance.setModel && vizabiInstance._ready) {
            vizabiInstance.setModel(this.currentHashModel);
          }
        });
      });
  }

  ngAfterViewInit(): void {
    this.routesModelChangesSubscription = this.router.events.filter((event: any) => event instanceof NavigationEnd).subscribe(() => {
      const model = this.vizabiToolsService.getModelFromUrl();
      this.store.dispatch(new VizabiModelChanged(model));
    });

    this.toolChangesSubscription = this.store.select(getSelectedTool).subscribe(selectedTool => {
      const simpleModel = this.vizabiToolsService.simplifyModel(this.currentHashModel);
      const model = Object.assign(simpleModel, { 'chart-type': selectedTool });
      this.store.dispatch(new VizabiModelChanged(model));
    });

    this.localeChangesSubscription = this.store.select(getCurrentLocale).subscribe((locale: VizabiLocale) => {
      const model = Object.assign({}, this.currentHashModel, locale);
      this.store.dispatch(new VizabiModelChanged(model));
    });
  }

  getVizabiInitialModel(slug: string): any {
    const initialModel = this.vizabiInstances[slug].model;
    if (slug === 'mountain') {
      Object.assign(_.get(initialModel, 'state.marker.group'), { manualSorting: ['asia', 'africa', 'americas', 'europe'] });
    }
    return initialModel;
  }

  onCreated(changes: any): void {
    const slug = this.toolToSlug[changes.type];
    const instance: any = {
      'chart-type': slug,
      model: _.cloneDeep(this.tools[slug].opts),
      // modelInitial: changes.component.getModel(),
      instance: changes.component
    };

    this.store.dispatch(new VizabiInstanceCreated(instance, slug));
  }

  onChanged(changes: any): void {
    const model = _.extend({}, this.currentHashModel, changes.modelDiff, { 'chart-type': this.toolToSlug[changes.type] });
    this.store.dispatch(new VizabiModelChanged(model));
  }

  ngOnDestroy(): void {
    this.vizabiModelChangesSubscription.unsubscribe();
    this.vizabiCreationSubscription.unsubscribe();
    this.initialToolsSetupSubscription.unsubscribe();
    this.localeChangesSubscription.unsubscribe();
    this.toolChangesSubscription.unsubscribe();
    this.routesModelChangesSubscription.unsubscribe();
  }
}
