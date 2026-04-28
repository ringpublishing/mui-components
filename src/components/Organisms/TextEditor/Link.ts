import { Link } from '@tiptap/extension-link';

const customLink = Link.extend({
    addAttributes() {
        return {
            title: {
                parseHTML: (element: Element): string | null => element.getAttribute('title'),
            },
            role: {
                parseHTML: (element: Element): string | null => element.getAttribute('data-link-role-code'),
            },
            href: {
                parseHTML: (element: Element): string | null => element.getAttribute('href'),
            },
            rel: 'noopener noreferrer',
        };
    },
});

export default customLink;
