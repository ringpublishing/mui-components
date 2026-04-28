import dayjs from 'dayjs';

type dateFormatType = {
    language: string;
    timeFormat: string;
    dateFormat: string;
};

export function formatDate(date: string | Date, dateFormat: dateFormatType | null = null): string {
    if (!date) {
        return '';
    }

    const localeData = dateFormat || getLocale();

    return dayjs(date).format(`${localeData.timeFormat} | ${localeData.dateFormat}`);
}

export function getLocale(): dateFormatType {
    switch (navigator.language) {
        case 'en-US':
            return {
                language: 'en-US',
                timeFormat: 'hh:mm A',
                dateFormat: 'MMM D, YYYY',
            };
        case 'pl':
            return {
                language: 'pl',
                timeFormat: 'HH:mm',
                dateFormat: 'DD-MM-YYYY',
            };
        default:
            return {
                language: 'en',
                timeFormat: 'HH:mm',
                dateFormat: 'DD-MM-YY',
            };
    }
}
