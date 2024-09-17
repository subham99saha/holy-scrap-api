const puppeteer = require('puppeteer');

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function waitForImagesToLoad(page) {
    await page.evaluate(async () => {
        const images = document.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) return;
            return new Promise((resolve) => {
                img.onload = img.onerror = resolve;
            });
        });
        await Promise.all(imagePromises);
    });
}

function replaceSpaces(query, replacement) {
    // Use the JavaScript string `replace` method with a regular expression to replace all spaces
    return query.replace(/\s+/g, replacement);
}

// async function scrapeAmazon(query) {
const scrapeAmazon = (query) => new Promise(async resolve => {
    let q = replaceSpaces(query,'+')
    console.log({query: q})
    const url = `https://www.amazon.in/s?k=${q}`;
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-http2']
    });
    
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector('.s-result-item');
        await autoScroll(page);
        await waitForImagesToLoad(page);
        
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]');
            return Array.from(productElements).map(el => {
                const imageElement = el.querySelector('.s-image');
                const titleElement = el.querySelector('h2 a.a-link-normal');
                const priceElement = el.querySelector('.a-price[data-a-color="base"] .a-offscreen');
                const discountedPriceElement = el.querySelector('.a-price[data-a-color="price"] .a-offscreen');
                const ratingElement = el.querySelector('.a-icon-star-small');
                const ratingCountElement = el.querySelector('.a-size-base.s-underline-text');

                return {
                    imageUrl: imageElement ? imageElement.src : null,
                    productTitle: titleElement ? titleElement.textContent.trim() : null,
                    price: priceElement ? priceElement.textContent.trim() : null,
                    discountedPrice: discountedPriceElement ? discountedPriceElement.textContent.trim() : null,
                    itemLink: titleElement ? 'https://www.amazon.in' + titleElement.getAttribute('href') : null,
                    rating: ratingElement ? parseFloat(ratingElement.textContent.split(' ')[0]) : null,
                    ratingCount: ratingCountElement ? parseInt(ratingCountElement.textContent.replace(/[^0-9]/g, '')) : null
                };
            });
        });
        
        resolve(products)
    } catch (error) {
        console.error('Error scraping data:', error);
        throw error
    } finally {
        await browser.close();
    }
})

// async function scrapeMyntra() {
const scrapeMyntra = (query) => new Promise(async resolve => {
    let q = replaceSpaces(query,'+')
    console.log({query: q})
    const url = `https://www.myntra.com/${q}`;
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-http2']
    });
    
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector('.product-base');

        await autoScroll(page);
        await waitForImagesToLoad(page);

        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('.product-base');
            return Array.from(productElements).map(el => {
                const imageElement = el.querySelector('img');
                const titleElement = el.querySelector('.product-product');
                const discountedPriceElement = el.querySelector('.product-discountedPrice');
                const originalPriceElement = el.querySelector('.product-strike');
                const ratingElement = el.querySelector('.product-ratingsContainer span');
                const itemLink = el.querySelector("a");

                return {
                    imageUrl: imageElement ? imageElement.src : null,
                    productTitle: titleElement ? titleElement.innerText : null,
                    price: originalPriceElement ? originalPriceElement.innerText.replace('Rs. ', '') : null,
                    discountedPrice: discountedPriceElement ? discountedPriceElement.innerText.replace('Rs. ', '') : null,
                    rating: ratingElement ? parseFloat(ratingElement.innerText) : null,
                    itemLink: itemLink ? itemLink.href : null
                };
            });
        });

        resolve(products)
    } catch (error) {
        console.error('Error scraping data:', error);
        throw error
    } finally {
        await browser.close();
    }
})

const scrapeFlipkart = (query) => new Promise(async resolve => {
    let q = replaceSpaces(query,'+')
    console.log({query: q})
    const url = `https://www.flipkart.com/search?q=${q}`;
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-http2']
    });
    
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector('[data-id]'); 

        await autoScroll(page);
        await waitForImagesToLoad(page);

        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('[data-id]');
            return Array.from(productElements).map(el => {
                console.log(el);
                const imageElement = el.querySelector('div > div > div > div > img');
                const titleElement = el.querySelector('div:nth-child(2) > a:nth-child(2)');
                const discountedPriceElement = el.querySelector('div:nth-child(2) > a:nth-child(3) > div > div:nth-child(1)');
                const originalPriceElement = el.querySelector('div:nth-child(2) > a:nth-child(3) > div > div:nth-child(2)');
                const ratingElement = null; // No rating element in your example HTML
                const itemLink = el.querySelector('a.rPDeLR'); 

                return {
                    imageUrl: imageElement ? imageElement.src : null,
                    productTitle: titleElement ? titleElement.innerText : null,
                    price: originalPriceElement ? originalPriceElement.innerText.replace('₹', '') : null,
                    discountedPrice: discountedPriceElement ? discountedPriceElement.innerText.replace('₹', '') : null,
                    rating: ratingElement ? parseFloat(ratingElement.innerText) : null, // Will be null in this case
                    itemLink: itemLink ? itemLink.href : null
                };
            });
        });

        resolve(products)
    } catch (error) {
        console.error('Error scraping data:', error);
        throw error
    } finally {
        await browser.close();
    }
})

module.exports = {
    scrape: async (req) => {
        console.log(req.body)
        const { query, scpMTRA, scpAMZN, scpFLPKT } = req.body
        let items = []
        try {
            if (scpAMZN) {
                const response = await scrapeAmazon(query)
                items.push(...response)
                console.log("Amazon scraped")
            }
            if (scpMTRA) {
                const response = await scrapeMyntra(query)
                items.push(...response)
                console.log("Myntra scraped")
            }
            if (scpFLPKT) {
                const response = await scrapeFlipkart(query)
                items.push(...response)
                console.log("Flipkart scraped")
            }
            return { success: true, message: items };
        } catch(error) {
            return { success: false, message: error };
        }
        
        // scrapeAmazon();
        // scrapeMyntra();
    },
    // scrapeAmazon
}