import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardData} from './dashboard.service';
import { CategoriesService, CategoryModelOutput, DashboardService } from '../../services';

Chart.register(...registerables);

@Component({ selector: 'app-dashboard', imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatSelectModule], templateUrl: './dashboard.component.html', styleUrl: './dashboard.component.scss' })
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryChart') categoryChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChartCanvas?: ElementRef<HTMLCanvasElement>;
  private readonly destroyRef = inject(DestroyRef);
  private categoryChart?: Chart;
  private trendChart?: Chart;
  private viewReady = false;
  readonly months = this.createMonths();
  categories: CategoryModelOutput[] = [];
  selectedMonth = this.monthKey(new Date());
  selectedCategoryId: number | null = null;
  dashboard?: DashboardData | any;
  isLoading = true;
  loadError = false;

  constructor(private dashboardService: DashboardService, private categoriesService: CategoriesService) {
    this.destroyRef.onDestroy(() => { this.categoryChart?.destroy(); this.trendChart?.destroy(); });
  }

  ngOnInit(): void {
    this.categoriesService.getAllCategoryCategoryGet()
    .subscribe({ 
      next: categories => this.categories = categories, error: () => this.categories = [] 
    });
    this.loadDashboard();
  }

  ngAfterViewInit(): void { 
    this.viewReady = true; this.renderCharts(); 
  }

  onFiltersChanged(): void { 
    this.loadDashboard(); 
  }

  get selectedMonthLabel(): string { 
    const [year, month] = this.selectedMonth.split('-').map(Number); 
    return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1)); 
  }

  get categoryTotal(): number { 
    return 0;
    // return this.dashboard?.category_breakdown?.reduce((total, item) => total + item.amount, 0) ?? 0; 
  }

  trackExpense(_: number, expense: DashboardData['recent_expenses'][number]): number | string { 
    return expense.id ?? `${expense.transaction_date}-${expense.description}`; 
  }

  private loadDashboard(): void {
    this.isLoading = true; this.loadError = false;
    this.dashboardService.getDashboardDataByMonthYearDashboardmonthlyYearMonthGet(this.selectedMonth).subscribe({
      next: dashboard => { 
        this.dashboard = dashboard; 
        console.log('this.dashoboard', this.dashboard);
        this.isLoading = false; 
        this.renderCharts(); 
      },
      error: () => { 
        this.dashboard = undefined; 
        this.isLoading = false; 
        this.loadError = true; 
        this.renderCharts(); }
    });
  }

  private renderCharts(): void {
    if (!this.viewReady) return;

    this.categoryChart?.destroy(); 
    this.trendChart?.destroy(); 
    this.categoryChart = undefined; 
    this.trendChart = undefined;
    const breakdown = this.dashboard?.category_breakdown ?? [];

    // if (this.categoryChartCanvas && breakdown.length) 
    //   this.categoryChart = new Chart(this.categoryChartCanvas.nativeElement, { type: 'doughnut', data: { labels: breakdown.map(item => item.category), datasets: [{ data: breakdown.map(item => item.amount), backgroundColor: ['#21a67a', '#2764e7', '#f59e0b', '#a855f7', '#ef6c5b', '#14b8a6'], borderWidth: 0 }] }, options: { cutout: '68%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${context.label}: ${this.formatAmount(context.parsed)}` } } } } });

    const trend = this.dashboard?.monthly_trend ?? [];

    // if (this.trendChartCanvas && trend.length) {
    //   const config: ChartConfiguration<'bar'> = { type: 'bar', data: { labels: trend.map(item => item.month), datasets: [{ data: trend.map(item => item.amount), label: 'Expenses', backgroundColor: '#21a67a', borderRadius: 7, borderSkipped: false }] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => this.formatAmount(context.parsed.y ?? 0) } } }, scales: { x: { grid: { display: false }, border: { display: false } }, y: { beginAtZero: true, border: { display: false }, ticks: { callback: value => `₹${Number(value) / 1000}k` }, grid: { color: '#eef1f5' } } } } };
    //   this.trendChart = new Chart(this.trendChartCanvas.nativeElement, config);
    // }
  }

  private formatAmount(amount: number): string { 
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount); 
  }

  private createMonths(): { value: string; label: string }[] { 
    const today = new Date(); return Array.from({ length: 12 }, (_, index) => { const date = new Date(today.getFullYear(), today.getMonth() - index, 1); return { value: this.monthKey(date), label: new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date) }; }); 
  }

  private monthKey(date: Date): string { 
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; 
  }
}
