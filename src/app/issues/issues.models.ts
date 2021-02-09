import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
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
  data: GithubIssue[] = [];

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
    return of(this.data);
  }

  disconnect(): void {
    this._subscription.unsubscribe();
  }
}
