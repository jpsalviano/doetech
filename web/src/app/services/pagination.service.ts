import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';

export interface PaginationConfig {
  pageSize: number;
  initialPage?: number;
}

export interface PaginationState<T> {
  items: T[];
  currentPage: number;
  hasMoreItems: boolean;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  
  createPaginationState<T>(config: PaginationConfig): PaginationState<T> {
    return {
      items: [],
      currentPage: config.initialPage || 1,
      hasMoreItems: true,
      loading: false
    };
  }

  loadMore<T>(
    state: PaginationState<T>,
    loadFunction: (page: number, pageSize: number) => Observable<T[]>,
    config: PaginationConfig,
    preserveScroll: boolean = true
  ): Observable<T[]> {
    if (!state.hasMoreItems || state.loading) {
      return new Observable(observer => observer.complete());
    }

    const scrollPosition = preserveScroll ? window.pageYOffset : 0;
    state.loading = true;
    state.currentPage++;

    return loadFunction(state.currentPage, config.pageSize).pipe(
      finalize(() => {
        state.loading = false;
        if (preserveScroll) {
          setTimeout(() => {
            window.scrollTo(0, scrollPosition);
          }, 0);
        }
      })
    );
  }

  reset<T>(state: PaginationState<T>, scrollToTop: boolean = false): void {
    state.items = [];
    state.currentPage = 1;
    state.hasMoreItems = true;
    state.loading = false;
    
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateItems<T>(
    state: PaginationState<T>, 
    newItems: T[], 
    pageSize: number,
    isFirstPage: boolean = false
  ): void {
    if (isFirstPage) {
      state.items = newItems;
    } else {
      state.items = [...state.items, ...newItems];
    }
    state.hasMoreItems = newItems.length === pageSize;
  }
}
