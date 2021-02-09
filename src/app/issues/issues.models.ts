import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
import { IssueService } from "./issue.service";

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

export class IssuesDataSource extends DataSource<GithubIssue> {
  paginator: MatPaginator;
  sort: MatSort;

  private _cachedIssues: GithubIssue[] = [];
  private _dataStream = new BehaviorSubject<GithubIssue[]>(this._cachedIssues);
  private _subscription = new Subscription();

  constructor(private _issueService: IssueService) {
    super();
  }

  connect(
    collectionViewer: CollectionViewer
  ): Observable<GithubIssue[] | ReadonlyArray<GithubIssue>> {
    this._subscription.add(
      collectionViewer.viewChange.subscribe(range => {
        // Fetch new page if scrolled too much
      })
    );

    this.paginator.page.subscribe(() => this._getMoreIssues());
    return this._dataStream.asObservable();
  }

  disconnect(): void {
    this._subscription.unsubscribe();
  }

  initIssues(sort?: MatSort) {
    if (!this.sort && sort) {
      this.sort = sort;
    }
    this._getIssues().subscribe(issues => {
      this._cachedIssues = issues;
      this._dataStream.next(issues);
    });
  }

  private _getMoreIssues() {
    this._getIssues().subscribe(issues => {
      this._cachedIssues = this._cachedIssues.concat(...issues);
      this._dataStream.next(this._cachedIssues);
    });
  }

  private _getIssues(): Observable<GithubIssue[]> {
    return this._issueService.getGithubIssues(
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex
    );
  }
}
