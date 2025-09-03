import { Routes } from '@angular/router';
import { MyTasks } from './pages/my-tasks/my-tasks/my-tasks';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
    {
        path: '',
        component: Shell,
        children: [
            // Default route: redirect to 'my-tasks'
            { path: '', redirectTo: 'my-tasks', pathMatch: 'full' },

            // Actual route
            { path: 'my-tasks', component: MyTasks }
        ],
    },

    // Wildcard route for 404
    { path: '**', component: MyTasks }
];
