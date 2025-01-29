export interface File {
    id: number;
    name: string;
    projectId: number;
    type: 'code' | 'folder' | 'image' | 'video' | 'document';
    expanded?: boolean;
    children?: File[];
  }

 