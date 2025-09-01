import { Routes } from '@angular/router';
import { MyTasks } from './pages/my-tasks/my-tasks/my-tasks';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
    {
        path: '',
        component: Shell,
        children: [
            { path: 'my-tasks', component: MyTasks },
            // { path: 'demo', component: Demo },
            // { path: 'demo2', component: Demo2 },
            // { path: 'demo3', component: Demo3 },
            // { path: 'transactions', component: Transactions },
            // { path: 'chart', component: TransactionDonutChart },



            // { path: 'insight', component: TaskInsights },
            // { path: 'my-notes', component: NotesList },
            // { path: 'contact-list', component: MyContactList },

            // { path: 'reminders', component: ReminderList },




        ]
    }
];
