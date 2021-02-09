import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
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

  private _cachedIssues = Array.from<GithubIssue>({ length: 0 });
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
        const currentPage = this._getPageForIndex(range.end);
        if (currentPage > this.lastPage) {
          this.lastPage = currentPage;
          this._fetchPage();
        }
      })
    );
    return this._dataStream;
  }

  disconnect(): void {
    this._subscription.unsubscribe();
  }

  private lastPage = 0;

  private _fetchPage(): void {
    // Fetch page
  }

  private _getPageForIndex(i: number): number {
    return Math.floor(i / IssueService.PAGE_SIZE);
  }
}
