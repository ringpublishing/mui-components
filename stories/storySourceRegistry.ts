const registry = new Map<string, string>();

export function setStorySourceCode(storyId: string, code: string): void {
    registry.set(storyId, code);
}

export function deleteStorySourceCode(storyId: string): void {
    registry.delete(storyId);
}

export function getStorySourceCode(storyId: string): string | undefined {
    return registry.get(storyId);
}
