/**
 * Emotion names a class `<cache key>-<hash><labels>`: the cache key is `css`, the hash is a 32-bit
 * murmurhash of the serialized styles written in base 36 (one to seven characters of `0-9a-z`), and every
 * `label:` in the styles appends `-<label>`. Only a whole class token of that shape matches, so
 * `my-css-1abc`, `scss-1abc`, `css-Root` and `css-12345678` are left alone. A hand-written class such as
 * `css-grid` cannot be told apart from a generated one and is rewritten too.
 */
const EMOTION_CLASS_HASH = /(^|\s)css-[0-9a-z]{1,7}(?=[-\s]|$)/g;

/**
 * Drops the hash from every Emotion class in a `class` attribute value:
 * `css-<hash>-<Label>` becomes `css-<Label>` and a bare `css-<hash>` becomes `css`.
 */
export const stripEmotionClassHashes = (classNames: string): string => classNames.replace(EMOTION_CLASS_HASH, '$1css');

/**
 * The Data Grid names the class that carries its CSS variables `MuiDataGridVariables-<hash>`, where the hash is
 * taken from the whole theme object, so it changes with a theme value the grid never reads.
 */
const GRID_VARIABLES_HASH = /\bMuiDataGridVariables-\d+/g;

/** Drops the hash from every `MuiDataGridVariables-<hash>` in a class list, a selector or an address. */
export const stripGridVariablesHash = (text: string): string =>
    text.replace(GRID_VARIABLES_HASH, 'MuiDataGridVariables');

const rewriteAttribute = (element: Element, name: string, rewrite: (value: string) => string): void => {
    const value = element.getAttribute(name);

    if (value !== null && rewrite(value) !== value) {
        element.setAttribute(name, rewrite(value));
    }
};

/**
 * Returns a deep copy of the node with the hashes dropped from every `class` attribute, and the grid variables
 * hash also from the `href` and the rules of the style element that declares the variables.
 * The node itself is left as rendered.
 */
export const cloneWithoutClassHashes = <T extends Element | DocumentFragment>(node: T): T => {
    const clone = node.cloneNode(true) as T;
    const elements: Element[] = Array.from(clone.querySelectorAll('*'));

    if (clone instanceof Element) {
        elements.push(clone);
    }

    elements.forEach((element) => {
        rewriteAttribute(element, 'class', (value) => stripGridVariablesHash(stripEmotionClassHashes(value)));
        rewriteAttribute(element, 'href', stripGridVariablesHash);

        if (element.localName === 'style' && element.textContent) {
            element.textContent = stripGridVariablesHash(element.textContent);
        }
    });

    return clone;
};
