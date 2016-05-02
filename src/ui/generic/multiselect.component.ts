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

import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {Dropdown, DropdownMenu} from './dropdown.component';

@Component({
    selector: 'atdiff-multiselect',
    directives: [Dropdown, DropdownMenu],
    template: `<div class="input-group input-group-sm">
                    <input type="text" class="form-control" [value]="getDisplayText()" readonly>
                    <div class="input-group-btn" atdiff-dropdown>
                        <button type="button" class="btn btn-default dropdown-toggle"><span class="caret"></span></button>
                        <template atdiff-dropdown-menu>
                            <template [ngIf]="options.length === 0">
                                <li class="disabled" (click)="$event.preventDefault()"><a href="#">(No option)</a></li>
                            </template>
                            <template [ngIf]="options.length > 0">
                                <li *ngFor="#opt of options" (click)="clickOption(opt, $event)"><a href="#"><span class="glyphicon" [class.glyphicon-unchecked]="!opt.selected" [class.glyphicon-check]="opt.selected"></span> {{ opt.name }} ({{ opt.count }})</a></li>
                                <li role="separator" class="divider"></li>
                                <li (click)="clickAll(true, $event)"><a href="#">Select all</a></li>
                                <li (click)="clickAll(false, $event)"><a href="#">Unselect all</a></li>
                            </template>
                        </template>
                    </div>
                </div>`
})
export class Multiselect {
    @Output("at-diff-multiselect-change") change = new EventEmitter();
    @Input("atdiff-multiselect-options") options;

    clickOption(opt, event) {
        opt.selected = !opt.selected;
        this.change.emit(null);
        event.stopPropagation();
        event.preventDefault();
    }

    clickAll(value, event) {
        this.options.forEach(opt => opt.selected = value);
        this.change.emit(null);
        event.stopPropagation();
        event.preventDefault();
    }

    getDisplayText() {
        let selectedItems = 0;
        let unselectedItems = 0;
        this.options.forEach(opt => opt.selected ? selectedItems++ : unselectedItems++);
        if (unselectedItems === 0) {
            return "Not filtered";
        }
        return `${selectedItems} selected item(s)`;
    }
}
