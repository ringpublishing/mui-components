export interface ArgType {
    description: string;
    control?: string | false;
    category?: string;
    type?: string;
    defaultValue?: string;
    options?: Array<string | number | boolean>;
}

export interface Component {
    id: string;
    name: string;
    category: string;
    title: string;
    description: string;
    argTypes: Record<string, ArgType>;
    storyNames: string[];
    docs: string;
}

export interface Knowledge {
    generated: string;
    version?: string;
    importPath?: string;
    componentCount?: number;
    components: Record<string, Component>;
}

export interface ListComponentResult {
    id: string;
    name: string;
    description: string;
    storyNames: string[];
    argTypesCount: number;
}

export interface ComponentDetailsResult {
    id: string;
    name: string;
    description: string;
    storyNames: string[];
    argTypes: Record<string, ArgType>;
}

export interface ComponentDocsResult {
    id: string;
    name: string;
    docs: string;
}
