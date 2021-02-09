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
import { Observable } from "rxjs";
import { distinctUntilChanged,  shareReplay } from "rxjs/operators";
import { IssueService } from "./issue.service";
import { GithubIssue } from "./issues.models";
import { GithubIssue } from "./issues.models";

/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: "issues",
  styleUrls: ["issues.component.css"],
  templateUrl: "issues.component.html"
})
export class IssuesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["created", "state", "number", "title"];
  data: GithubIssue[] = [];
  dataSource: MatTableDataSource<GithubIssue> = new MatTableDataSource();

  isLoadingIssues$ = this._issueService.isLoadingIssues$
    .asObservable()
    .pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
  isRateLimitReached$ = this._issueService.isRateLimitReached$
    .asObservable()
    .pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );

  paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), this._cdr);
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _issueService: IssueService
  ) {}

  ngOnInit() {
    this.paginator.pageSize = IssueService.PAGE_SIZE;
    this.paginator.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.data;
  }

  ngAfterViewInit() {
    this._initIssues();

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => {
      const elt = document.getElementById('table-container');
      elt?.scrollTop = 0; 
      this.paginator.pageIndex = 0;
      this._initIssues();
    });

    this._issueService.nbTotalIssues$
      .pipe(distinctUntilChanged())
      .subscribe(nbIssues => (this.paginator.length = nbIssues));

    this.paginator.page.subscribe(() => this._getMoreIssues());
  }

  onScroll(event: UIEvent) {
    const elem = event.currentTarget as Element;
    if (
      elem.scrollTop + 500 >= (this.paginator.pageIndex + 1) * IssueService.PAGE_SIZE * 48 &&
      (this.paginator.pageIndex + 1) * IssueService.PAGE_SIZE <= this.paginator.length
    ) {
      this.paginator.nextPage();
    }
  }

  private _initIssues() {
    this._getIssues().subscribe(issues => (this.data = issues));
  }

  private _getMoreIssues() {
    this._getIssues().subscribe(
      issues => (this.data = this.data.concat(...issues))
    );
  }

  private _getIssues(): Observable<GithubIssue[]> {
    return this._issueService.getGithubIssues(
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex
    );
  }
}
