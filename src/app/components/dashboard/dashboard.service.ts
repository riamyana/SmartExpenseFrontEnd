import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH } from '../../services';

export interface DashboardCategory { category: string; amount: number; }
export interface DashboardTrend { month: string; amount: number; }
export interface DashboardExpense { id?: number; transaction_date: string; description: string; category_name?: string; withdrawal: number; }
export interface DashboardData {
  total_expenses: number;
  monthly_expenses: number;
  budget: number;
  budget_remaining: number;
  transaction_count: number;
  category_breakdown: DashboardCategory[];
  monthly_trend: DashboardTrend[];
  recent_expenses: DashboardExpense[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient, @Inject(BASE_PATH) private readonly basePath: string) {}

  getDashboard(year: number, month: number, categoryId: number | null): Observable<DashboardData> {
    let params = new HttpParams().set('year', year).set('month', month);
    if (categoryId != null) params = params.set('category_id', categoryId);
    return this.http.get<DashboardData>(`${this.basePath}/dashboard`, { params });
  }
}
