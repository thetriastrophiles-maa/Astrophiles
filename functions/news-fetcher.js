const Parser = require('rss-parser');

const RSS_FEEDS = {
    nasa: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    esa: 'https://www.esa.int/rss.xml', // General ESA RSS, will be refined if needed
    jaxa: 'https://global.jaxa.jp/news/rss.xml',
};

exports.handler = async function(event, context) {
    const parser = new Parser();
    let allNews = [];

    for (const [source, url] of Object.entries(RSS_FEEDS)) {
        try {
            let feed = await parser.parseURL(url);
            const newsItems = feed.items.map(item => ({
                source: source.toUpperCase(),
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                contentSnippet: item.contentSnippet ? item.contentSnippet.substring(0, 150) + '...' : '',
            }));
            allNews = allNews.concat(newsItems);
        } catch (error) {
            console.error(`Error fetching news from ${source}:`, error);
        }
    }

    // Sort news by publication date, newest first
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            // Allow CORS for your frontend to access this function
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Methods": "GET",
        },
        body: JSON.stringify(allNews),
    };
};
