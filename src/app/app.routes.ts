import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
        children: [
            {
                path: '',
                loadChildren: () => import('./components/layout/layout.routes').then(m => m.routes)
            }
        ]
    }
];
