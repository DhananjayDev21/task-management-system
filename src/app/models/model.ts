// task model
export interface Task {
    id?: number;
    title: string;
    description: string;
    status: string,
    priority: string,
    startDate: string,
    startTime: string,
    dueDate: string;
    dueTime: string;
    createdBy: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isOverDue: boolean;
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

