import { Component, ViewEncapsulation } from '@angular/core';
import { ToolService } from './../tool.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-see-also',
  templateUrl: './see-also.component.html',
  styleUrls: ['./see-also.component.styl']
})
export class SeeAlsoComponent {

  public tools: any = {};
  public toolKeys: Array<string> = [];
  public toolActive: string;

  constructor(private toolService: ToolService) {

    this.toolService.getToolLoaderEmitter().subscribe(data => {
      this.tools = data.items;
      this.toolKeys = data.keys;
      this.toolActive = data.active;
    });

    this.toolService.getToolChangeEmitter().subscribe(data => {
      this.toolActive = data.active;
    });
  }

  public getLink(toolKey: string): string {
    return `${window.location.pathname}#_chart-type=${toolKey}`;
  }

  public changeHandler(toolKey: string): void {
    this.toolService.changeActiveTool(toolKey);
  }
}
