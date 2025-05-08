export function extractKeyFromUrl(url: string): string {

    if (url.includes('.com/')) {
        return url.split('.com/')[1];
    }


    return url;
}