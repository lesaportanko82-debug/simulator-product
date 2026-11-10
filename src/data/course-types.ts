export type ContentTab = 'theory' | 'example' | 'practice' | 'task';

export interface Module {
  id: string;
  title: string;
  description: string;
  tabs: {
    theory: string;
    example: string;
    practice: string;
    task: string;
  };
}

export interface Week {
  id: number;
  title: string;
  description: string;
  icon: any;
  modules: Module[];
}
