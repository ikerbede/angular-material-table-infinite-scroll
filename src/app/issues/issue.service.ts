import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import {
  catchError,
  distinctUntilChanged,
  map,
  shareReplay
} from "rxjs/operators";
import { GithubIssue } from "./issues.models";
import { GithubApi } from "./issues.models";

@Injectable({ providedIn: "root" })
export class IssueService {
  static readonly PAGE_SIZE = 30;

  nbTotalIssues$: Observable<number>;
  isLoadingIssues$: Observable<boolean>;
  isRateLimitReached$: Observable<boolean>;

  private _nbTotalIssues = new BehaviorSubject<number>(0);
  private _isLoadingIssues = new BehaviorSubject<boolean>(false);
  private _isRateLimitReached = new BehaviorSubject<boolean>(false);

  constructor(private _httpClient: HttpClient) {
    this.nbTotalIssues$ = this._nbTotalIssues.asObservable().pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
    this.isLoadingIssues$ = this._isLoadingIssues.asObservable().pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
    this.isRateLimitReached$ = this._isRateLimitReached.asObservable().pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  getGithubIssues(
    activeSort: string,
    sortDirection: string,
    pageIndex: number
  ): Observable<GithubIssue[]> {
    this._isLoadingIssues.next(true);
    return this._getGithubApi(activeSort, sortDirection, pageIndex).pipe(
      map(data => {
        this._isLoadingIssues.next(false);
        this._isRateLimitReached.next(false);
        this._nbTotalIssues.next(data.total_count);
        return data.items;
      }),
      catchError(() => {
        this._isLoadingIssues.next(false);
        this._isRateLimitReached.next(true);
        return of([]);
      })
    );
  }

  private _getGithubApi(
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
