// task model
export interface Task {
    id?: number;
    title: string;
    description: string;
    status: string,
    priority: string,
    startDate: string;
    dueDate: string;
    createdBy: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isOverDue: boolean;
    dueTime: string;
}

//note model
// Note model
export interface Note {
    id?: any;      // json-server will auto-create id
    title: string;
    content: any;
    image?: string;
    isPinned?: boolean,
    color?: string;
}

