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

import {Component, Directive, Input, ContentChild, TemplateRef} from 'angular2/core';
import {Dropdown, DropdownMenu} from './dropdown.component';
import {Insert} from './insert.directive';

@Directive({
    selector: '[atdiff-table-item]'
})
export class TableItem {
    constructor(public template: TemplateRef) {}
}

@Component({
    selector: 'atdiff-table',
    directives: [Insert, Dropdown, DropdownMenu],
    template: `<div>
        <div class="panel panel-default">
            <div class="panel-heading">
                <span class="pull-right">
                    <span atdiff-dropdown>
                        <button type="button" class="btn btn-link btn-xs dropdown-toggle">{{maxItemsPerPage}} items/page <span class="caret"></span></button>
                        <template atdiff-dropdown-menu>
                            <li *ngFor="#num of maxItemsPerPageOptions" (click)="clickItemsPerPage(num, $event)"><a href="#"><template [ngIf]="num !== maxItemsPerPage">{{num}}</template><strong *ngIf="num == maxItemsPerPage">{{num}}</strong></a></li>
                        </template>
                    </span> <span class="badge">{{items.length}}</span>
                </span>
                <ng-content select="atdiff-table-title"></ng-content>
                <span>&nbsp;</span>
            </div>
            <ng-content></ng-content>
            <ul class="list-group">
                <li *ngFor="#item of curPageItems" class="list-group-item"><template [atdiff-insert]="tableItemTemplate" [data]="item">{{item}}</template></li>
            </ul>
        </div>
        <nav class="text-center">
            <ul class="pagination">
                <li [class.disabled]="curPageIndex === 1" (click)="clickPage(curPageIndex - 1, $event)"><a href="#"><span>&laquo;</span></a></li>
                <li *ngFor="#page of paginationItems" [class.active]="curPageIndex === page" (click)="clickPage(page, $event)" [class.disabled]="page === skipPages"><a href="#">{{page}}</a></li>
                <li [class.disabled]="curPageIndex === pagesCount" (click)="clickPage(curPageIndex + 1, $event)"><a href="#"><span>&raquo;</span></a></li>
            </ul>
        </nav>
    </div>`
})
export class Table {
    @ContentChild(TableItem) tableItem: TableItem;

    get tableItemTemplate() {
        if (this.tableItem) {
            return this.tableItem.template;
        }
    }

    @Input()
    set items(value) {
        this._items = value;
        // when items change, go back to the first page:
        this.curPageIndex = 1;
        this.updatePagination();
    }
    get items() {
        return this._items;
    }
    private _items = [];

    public maxItemsPerPageOptions = [10, 20, 40, 80];
    public maxItemsPerPage = 20;
    public curPageIndex = 1;
    public curPageItems = [];
    public curPageStartItemIndex = 0;
    public curPageEndItemIndex = 0;
    public paginationItems = [1];
    public pagesCount = 1;

    public skipPages = "\u2026";

    updatePagination() {
        let curPageIndex = this.curPageIndex;
        const items = this.items;
        const maxItemsPerPage = this.maxItemsPerPage;
        const itemsCount = items.length;
        const pagesCount = Math.max(1, Math.ceil(itemsCount / maxItemsPerPage));
        if (curPageIndex < 1) {
            curPageIndex = 1;
        } else if (curPageIndex > pagesCount) {
            curPageIndex = pagesCount;
        }
        this.curPageStartItemIndex = (curPageIndex - 1) * maxItemsPerPage;
        this.curPageEndItemIndex = Math.min(this.curPageStartItemIndex + maxItemsPerPage, itemsCount);
        this.curPageIndex = curPageIndex;
        this.curPageItems = items.slice(this.curPageStartItemIndex, this.curPageEndItemIndex);
        this.paginationItems = this.computePaginationItems([1, 2, curPageIndex - 2, curPageIndex - 1, curPageIndex, curPageIndex + 1, curPageIndex + 2, pagesCount - 1, pagesCount], pagesCount);
        this.pagesCount = pagesCount;
    }

    computePaginationItems(base, pagesCount) {
        const res = [];
        let lastItem = 0;
        for (const nextItem of base) {
            if (nextItem > lastItem && nextItem <= pagesCount) {
                if (nextItem > lastItem + 1) {
                    res.push(this.skipPages);
                }
                res.push(nextItem);
                lastItem = nextItem;
            }
        }
        return res;
    }

    clickPage(pageNumber, event) {
        if (pageNumber >= 1 && pageNumber <= this.pagesCount) {
            this.curPageIndex = pageNumber;
            this.updatePagination();
        }
        event.preventDefault();
    }

    clickItemsPerPage(num, event) {
        if (this.maxItemsPerPage !== num) {
            this.maxItemsPerPage = num;
            this.updatePagination();
        }
        event.preventDefault();
    }
}
