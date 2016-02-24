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

import {Directive, ViewContainerRef, TemplateRef, OnChanges, EmbeddedViewRef, Input} from 'angular2/core';

@Directive({
    selector: "[atdiff-insert]"
})
export class Insert implements OnChanges {
    constructor(private _viewContainer: ViewContainerRef, private _defaultTemplateRef: TemplateRef) {}

    private _previousTemplateRef: TemplateRef = null;

    @Input("atdiff-insert")
    public insert: TemplateRef;
    @Input()
    public data;

    ngOnChanges() {
        const curTemplate = this.insert || this._defaultTemplateRef;
        if (curTemplate !== this._previousTemplateRef) {
            this._viewContainer.clear();
            this._viewContainer.createEmbeddedView(curTemplate);
            this._previousTemplateRef = curTemplate;
        }
        const viewRef = <EmbeddedViewRef>this._viewContainer.get(0);
        viewRef.setLocal("$implicit", this.data);
    }
}
