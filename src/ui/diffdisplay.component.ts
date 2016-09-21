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

import {Component, Input} from '@angular/core';
import sortAndRemoveDuplicates = require('../utils/sortAndRemoveDuplicates');

@Component({
    selector: 'atdiff-diffdisplay',
    styles: [".col-md-3 { word-break:break-all; }"],
    template: `
    <atdiff-table [items]="filteredChanges">
        <atdiff-table-title>Changes</atdiff-table-title>
        <div class="panel-body">
            <div class="row">
                <div class="col-md-3"><strong>Type</strong></div>
                <div class="col-md-3"><strong>Member name</strong></div>
                <div class="col-md-3"><strong>Modified file</strong></div>
            </div>
            <div class="row">
                <div class="col-md-3"><atdiff-multiselect [atdiff-multiselect-options]="changeTypes.array" (at-diff-multiselect-change)="updateChangesFiltering()"></atdiff-multiselect></div>
                <div class="col-md-3"><input class="form-control input-sm" [(ngModel)]="filterChangeMember" (ngModelChange)="updateChangesFiltering()"></div>
                <div class="col-md-3"><input class="form-control input-sm" [(ngModel)]="filterChangeModifiedFile" (ngModelChange)="updateChangesFiltering()"></div>
            </div>
        </div>
        <template atdiff-table-item let-change>
            <div class="row">
                <div class="col-md-3">{{change.getType()}}</div>
                <div class="col-md-3">{{getMemberName(change)}}</div>
                <div class="col-md-3">{{change.getModifiedFile()}}</div>
            </div>
        </template>
    </atdiff-table>
    <atdiff-table [items]="filteredImpacts">
        <atdiff-table-title>Impacts</atdiff-table-title>
        <div class="panel-body">
            <div class="row">
                <div class="col-md-3"><strong>Type</strong></div>
                <div class="col-md-3"><strong>Member name</strong></div>
                <div class="col-md-3"><strong>Impacted file</strong></div>
                <div class="col-md-3"><strong>Modified file(s)</strong></div>
            </div>
            <div class="row">
                <div class="col-md-3"><atdiff-multiselect [atdiff-multiselect-options]="impactTypes.array" (at-diff-multiselect-change)="updateImpactsFiltering()"></atdiff-multiselect></div>
                <div class="col-md-3"><input class="form-control input-sm" [(ngModel)]="filterImpactMember" (ngModelChange)="updateImpactsFiltering()"></div>
                <div class="col-md-3"><input class="form-control input-sm" [(ngModel)]="filterImpactImpactedFiles" (ngModelChange)="updateImpactsFiltering()"></div>
                <div class="col-md-3"><input class="form-control input-sm" [(ngModel)]="filterImpactModifiedFiles" (ngModelChange)="updateImpactsFiltering()"></div>
            </div>
        </div>
        <template atdiff-table-item let-impact>
            <div class="row">
                <div class="col-md-3">{{impact.getType()}}</div>
                <div class="col-md-3">{{getMemberName(impact)}}</div>
                <div class="col-md-3">{{impact.getImpactedFile()}}</div>
                <div class="col-md-3">{{getModifiedFiles(impact)}}</div>
            </div>
        </template>
    </atdiff-table>
`
})
export class DiffDisplay {
    @Input()
    set diffData(value) {
        this._diffData = value;
        this.impactTypes = this.extractTypes(value.impacts);
        this.changeTypes = this.extractTypes(value.changes);
        this.updateChangesFiltering();
        this.updateImpactsFiltering();
    }
    get diffData() {
        return this._diffData;
    }
    _diffData;

    public filteredImpacts;
    public impactTypes;
    public filterImpactMember;
    public filterImpactImpactedFiles;
    public filterImpactModifiedFiles;

    public filteredChanges;
    public changeTypes;
    public filterChangeType;
    public filterChangeMember;
    public filterChangeModifiedFile;

    getModifiedFiles(impact) {
        return sortAndRemoveDuplicates(impact.getRootChanges().map((change) => change.getModifiedFile()), null).join(", ");
    }

    updateImpactsFiltering() {
        this.filteredImpacts = this.diffData.impacts.filter(item => {
            if (! this.impactTypes.map[item.getType()].selected) {
                return false;
            }
            if (this.filterImpactMember && this.getMemberName(item).indexOf(this.filterImpactMember) == -1) {
                return false;
            }
            if (this.filterImpactImpactedFiles && item.getImpactedFile().indexOf(this.filterImpactImpactedFiles) == -1) {
                return false;
            }
            if (this.filterImpactModifiedFiles && this.getModifiedFiles(item).indexOf(this.filterImpactModifiedFiles) == -1) {
                return false;
            }
            return true;
        });
    }

    updateChangesFiltering() {
        this.filteredChanges = this.diffData.changes.filter(item => {
            if (! this.changeTypes.map[item.getType()].selected) {
                return false;
            }
            if (this.filterChangeMember && this.getMemberName(item).indexOf(this.filterChangeMember) == -1) {
                return false;
            }
            if (this.filterChangeModifiedFile && item.getModifiedFile().indexOf(this.filterChangeModifiedFile) == -1) {
                return false;
            }
            return true;
        });
    }

    getMemberName(item) {
        if (item.getMemberName) {
            return item.getMemberName();
        } else if (item.getAttributeName && item.getBeanName){
            return `${item.getBeanName()} / ${item.getAttributeName()}`;
        } else if (item.getBeanName) {
            return `${item.getBeanName()}`;
        } else {
            return "";
        }
    }

    extractTypes(array) {
        const typesMap = Object.create(null);
        const typesArray = [];
        array.forEach(instance => {
            const typeName = instance.getType();
            let typeObject = typesMap[typeName];
            if (!typeObject) {
                typeObject = typesMap[typeName] = {
                    name: typeName,
                    selected: true,
                    count: 0
                };
                typesArray.push(typeObject);
            }
            typeObject.count++;
        });
        return {
            array: typesArray.sort((obj1, obj2) => (obj2.count - obj1.count)),
            map: typesMap
        };
    }
}
