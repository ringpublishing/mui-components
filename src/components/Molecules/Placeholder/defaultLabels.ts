import { PlaceholderLabels, PlaceholderVariant } from './Placeholder.js';

type PlaceholderLanguageLabels = {
    enUS: PlaceholderLabels;
    plPL?: PlaceholderLabels;
};

type DefaultLabels = {
    [value in PlaceholderVariant]: PlaceholderLanguageLabels;
};

export const defaultLabels: DefaultLabels = {
    error: {
        enUS: {
            header: 'An error occurred',
        },
        plPL: {
            header: 'Wystąpił błąd',
        },
    },
    error_list: {
        enUS: {
            header: 'Failed to load the list',
            description:
                'Refresh the page and try again. If the problem persists, please contact our technical support.',
        },
        plPL: {
            header: 'Nie udało się pobrać listy',
            description:
                'Odśwież stronę i spróbuj ponownie. Jeśli problem się powtarza, skontaktuj się z naszym wsparciem technicznym.',
        },
    },
    not_found: {
        enUS: {
            header: 'No results',
            description: 'Check your spelling, type the phrase differently, or change the filters.',
        },
        plPL: {
            header: 'Brak wyników',
            description: 'Sprawdź pisownię, wpisz frazę inaczej lub zmień filtry.',
        },
    },
    empty: {
        enUS: {
            description: 'Select an item to view its details',
        },
        plPL: {
            description: 'Wybierz element, aby zobaczyć jego szczegóły',
        },
    },
    empty_box: {
        enUS: {
            description: 'No items to display.',
        },
        plPL: {
            description: 'Brak elementów do wyświetlenia.',
        },
    },
};
