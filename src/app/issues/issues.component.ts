import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit
} from "@angular/core";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { IssueService } from "./issue.service";
import { GithubIssue, IssuesDataSource } from "./issues.models";
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
  dataSource: IssuesDataSource;

  isLoadingIssues$ = this._issueService.isLoadingIssues$;
  isRateLimitReached$ = this._issueService.isRateLimitReached$;

  paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), this._cdr);
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _issueService: IssueService
  ) {
    this.dataSource = new IssuesDataSource(this._issueService);
  }

  ngOnInit() {
    this.paginator.pageSize = IssueService.PAGE_SIZE;
    this.paginator.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit() {

    this.dataSource.initIssues(this.sort);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => {
      const elt = document.getElementById('table-container');
      elt?.scrollTop = 0; 
      this.paginator.pageIndex = 0;
      this.dataSource.initIssues(this.sort);
    });

    this._issueService.nbTotalIssues$.subscribe(
      nbIssues => (this.paginator.length = nbIssues)
    );

    
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
}
