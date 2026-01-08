// MOCK STABLE DATABASE MODULE (No Native Binaries)
console.log('📦 Initializing STABLE_IN_MEMORY_STORAGE');

let views = [];

const insertView = (ip, location, os, browser, device, pagePath, referrer) => {
    try {
        const entry = {
            ip, location, os, browser, device, path: pagePath, referrer,
            timestamp: new Date().toISOString()
        };
        views.push(entry);
        if (views.length > 1000) views.shift(); // Keep memory usage low
        console.log(`📡 Logged view: ${pagePath}`);
    } catch (e) {
        console.error('Tracking failed:', e);
    }
};

const getAnalytics = (limit = 100) => {
    return [...views].reverse().slice(0, limit);
};

const getStats = () => {
    const totalViews = views.length;
    const uniqueIps = new Set(views.map(v => v.ip)).size;

    // Simple counts
    const browsersCount = {};
    const locationsCount = {};

    views.forEach(v => {
        browsersCount[v.browser] = (browsersCount[v.browser] || 0) + 1;
        locationsCount[v.location] = (locationsCount[v.location] || 0) + 1;
    });

    const browsers = Object.entries(browsersCount).map(([browser, count]) => ({ browser, count }));
    const locations = Object.entries(locationsCount).map(([location, count]) => ({ location, count }));

    return { totalViews, uniqueIps, browsers, locations };
};

module.exports = { insertView, getAnalytics, getStats };
