const ANALYTICS_ENDPOINT = import.meta.env.PROD
    ? '/api/signal'
    : 'http://localhost:3001/api/signal';

export const trackPageView = async (path = window.location.pathname) => {
    try {
        await fetch(ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path,
                referrer: document.referrer,
                screen: `${window.innerWidth}x${window.innerHeight}`
            }),
        });
    } catch (e) {
        console.warn('Analytics sync failed.');
    }
};
