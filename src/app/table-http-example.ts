import { HttpClient } from "@angular/common/http";
import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit
} from "@angular/core";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: "table-http-example",
  styleUrls: ["table-http-example.css"],
  templateUrl: "table-http-example.html"
})
export class TableHttpExample implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["created", "state", "number", "title"];
  exampleDatabase: ExampleHttpDatabase | null;
  data: GithubIssue[] = [];
  dataSource: MatTableDataSource<GithubIssue> = new MatTableDataSource();

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), this._cdr);
  @ViewChild(MatSort) sort: MatSort;

  private readonly PAGE_SIZE = 30;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.exampleDatabase = new ExampleHttpDatabase(this._httpClient);
    this.paginator.pageSize = this.PAGE_SIZE;
    this.paginator.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.data;
  }

  ngAfterViewInit() {
    this._getMoreIssues().subscribe(
      issues => (this.data = this.data.concat(...issues))
    );

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => {
      const elt = document.getElementById('table-container');
      elt?.scrollTop = 0; 
      this.paginator.pageIndex = 0;
      this._getMoreIssues().subscribe(issues => this.data = issues);
    });

    this.paginator.page.subscribe(() =>
      this._getMoreIssues().subscribe(
        issues => (this.data = this.data.concat(...issues))
      )
    );
  }

  onScroll(event: UIEvent) {
    const elem = event.currentTarget as Element;
    if (
      elem.scrollTop + 500 >= (this.paginator.pageIndex + 1) * this.PAGE_SIZE * 48 &&
      (this.paginator.pageIndex + 1) * this.PAGE_SIZE <= this.paginator.length
    ) {
      this.paginator.nextPage();
    }
  }

  private _getMoreIssues(): Observable<GithubIssue[]> {
    this.isLoadingResults = true;
    return this.exampleDatabase!.getRepoIssues(
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex
    ).pipe(
      map(data => {
        this.isLoadingResults = false;
        this.isRateLimitReached = false;
        this.paginator.length = data.total_count;
        return data.items;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        this.isRateLimitReached = true;
        return of([]);
      })
    );
  }
}

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDatabase {
  constructor(private _httpClient: HttpClient) {}

  getRepoIssues(
    sort: string,
    order: string,
    page: number
  ): Observable<GithubApi> {
    const href = "https://api.github.com/search/issues";
    const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${page +
      1}`;

    return this._httpClient.get<GithubApi>(requestUrl);
  }
}

/**  Copyright 2020 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */
