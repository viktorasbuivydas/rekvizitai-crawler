// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor } from 'apify';
// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import { CheerioCrawler, Dataset, createCheerioRouter } from 'crawlee';
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

interface Input {
    startUrls: string[];
    maxRequestsPerCrawl: number;
}

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();

// Structure of input is defined in input_schema.json
const {
    startUrls = ['https://rekvizitai.vz.lt/imones/'],
    maxRequestsPerCrawl = 100,
} = await Actor.getInput<Input>() ?? {} as Input;

const proxyConfiguration = await Actor.createProxyConfiguration();

const router = createCheerioRouter();
router.addDefaultHandler(async ({ request, $, log, enqueueLinks }) => {
    log.info('hey here');

    // Extract title from the page.
    const title = $('title').text();
    log.info(`${title}`, { url: request.loadedUrl });

    // Enqueue pagination links
    await enqueueLinks({
        selector: '.breadcrumb.mb-0 strong',
        baseUrl: 'https://rekvizitai.vz.lt/imomnes/',
    });

    // Save url and title to Dataset - a table-like storage.
    await Dataset.pushData({ url: request.loadedUrl, title });
});

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandler: router,
});

await crawler.run(startUrls);

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();
