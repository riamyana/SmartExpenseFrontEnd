import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('../dashboard/dashboard.component').then(m => m.DashboardComponent),
    },
    {
        path: 'expenses',
        loadComponent: () => import('../expenses/expenses.component').then(m => m.ExpensesComponent),
    },
    {
        path: 'budgets',
        loadComponent: () => import('../budgets/budgets.component').then(m => m.BudgetsComponent),
    },
    {
        path: 'categories',
        loadComponent: () => import('../categories/categories.component').then(m => m.CategoriesComponent),
    }
];
