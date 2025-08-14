
export interface Note {
  id: string;
  title?: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  tabId: string;
  isCollapsed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  isLocked: boolean;
  isRichText: boolean;
  dueDate?: string;
}
