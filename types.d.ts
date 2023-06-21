import 'estree';

declare module 'estree' {
  export interface BaseNodeWithoutComments {
    edit: {
      source: () => string;
      update: (replacement: string) => Node;
      append: (append: string) => Node;
      prepend: (prepend: string) => Node;
    };
  }
}
