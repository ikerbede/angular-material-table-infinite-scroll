import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { GithubIssue } from "./issues.models";
import { GithubApi } from "./issues.models";

@Injectable({ providedIn: "root" })
export class IssueService {
  nbTotalIssues$ = new BehaviorSubject<number>(0);
  isLoadingIssues$ = new BehaviorSubject<boolean>(false);
  isRateLimitReached$ = new BehaviorSubject<boolean>(false);

  constructor(private _httpClient: HttpClient) {}

  getGithubIssues(
    activeSort: string,
    sortDirection: string,
    pageIndex: number
  ): Observable<GithubIssue[]> {
    this.isLoadingIssues$.next(true);
    return this._getGithubApi(activeSort, sortDirection, pageIndex).pipe(
      map(data => {
        this.isLoadingIssues$.next(false);
        this.isRateLimitReached$.next(false);
        this.nbTotalIssues$.next(data.total_count);
        return data.items;
      }),
      catchError(() => {
        this.isLoadingIssues$.next(false);
        this.isRateLimitReached$.next(true);
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
