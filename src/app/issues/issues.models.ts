import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

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

export class IssuesDataSource extends DataSource<GithubIssue | undefined> {
  private _cachedIssues = Array.from<GithubIssue>({ length: 0 });
  private _dataStream = new BehaviorSubject<(GithubIssue | undefined)[]>(this._cachedIssues);
  private _subscription = new Subscription();

  constructor(private factService: FactService) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<(GithubIssue | undefined)[] | ReadonlyArray<GithubIssue | undefined>> {
    this._subscription.add(collectionViewer.viewChange.subscribe(range => {
      const currentPage = this._getPageForIndex(range.end);

      if (currentPage > this.lastPage) {
        this.lastPage = currentPage;
        this._fetchPage();
      }
    }));
    return this._dataStream;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._subscription.unsubscribe();
  }

  private pageSize = 10;
private lastPage = 0;

private _fetchPage(): void {
  for (let i = 0; i < this.pageSize; ++i) {
    this.factService.getRandomFact().subscribe(res => {
      this.cachedFacts = this.cachedFacts.concat(res);
      this.dataStream.next(this.cachedFacts);
    });
  }
}

private _getPageForIndex(i: number): number {
  return Math.floor(i / this.pageSize);
}
}
