/*
 * Copyright 2016 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

import {Component} from '@angular/core';
import {ATDiffDataService} from './atdiffdata.service';

@Component({
    selector: 'atdiff-app',
    providers: [ATDiffDataService],
    template: `
<div class="container-fluid">
    <h1>at-diff results</h1>
    <atdiff-diffdisplay [diffData]="diffData" *ngIf="diffData"></atdiff-diffdisplay>
</div>`
})
export class AppComponent {
    public diffData:any;

    constructor(atDiffDataService: ATDiffDataService) {
        if (atDiffDataService.isDiffData()) {
            this.diffData = atDiffDataService.getDiffData();
        }
    }
}
