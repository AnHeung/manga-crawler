const axios = require('axios');
const cheerio = require('cheerio')

// https://manatoki81.net/bbs/search.php?stx=%ED%82%B9%EB%8D%A4


async function test() {

    const arr = []
    let promise = Promise.resolve()

    for (let i = 0; i < 10; i++) {
        promise = promise
            .then(() => {
                return new Promise(res => {
                    setTimeout(() => {
                        res(i)
                    }, 1000);
                })
            })
    }
    return promise;
}


async function checkSite(query) {

    let promise = Promise.resolve()
    let siteNo = 82
    let errCount = 0
    let completeSign = false

    for (let i = 0; i < 3; i++) {

        promise = promise
            .then(async (resultArr = []) => {

                return new Promise((res, rej) => {

                    if (completeSign) return res(resultArr)

                    setTimeout(async () => {
                        let site = `https://manatoki${siteNo}.net/bbs/search.php?`
                        console.log(`접속 시도 사이트 ${site}`)
                        const page = await axios.get(site, { params: { stx: query }, timeout: 3000 })
                            .catch(err => {
                                console.error(`통신 에러 : ${err}`)
                                if (errCount === 3) {
                                    console.error('3회 오류')
                                    resultArr.push({ err: true, errMsg: `${errCount}회 오류` })
                                    return res(resultArr)
                                } else {
                                    errCount++
                                    siteNo++
                                }
                            })
                        if (page) {
                            resultArr.push({ err: false, page: page })
                            completeSign = true
                        } else {
                            resultArr.push({ err: true, errMsg: `${errCount}회 오류` })
                        }
                        res(resultArr)
                    }, 2000);
                })
            })
    }
    return promise
        .then(resultArr => resultArr.find(result => !result.err))
        .catch(err => {
            console.error(`getSiteInfo 에러 ${err}`)
            return false
        })
}

async function getSearchPageInfo(pageInfo) {

    const page = pageInfo.page
    const $ = cheerio.load(page.data, { ignoreWhitespace: true })

    //해당 쿼리로 검색시 나오는 목록
    const comicArr = Array.from($("div.search-media div.media"))
        .map(raw => $(raw))
        .map(data => {
            const url = data.find('div.media-content a').attr('href') || ''
            const imgUrl = data.find('img').attr('src') || ''
            const title = data.find('div.media-heading').text().trim() || ''
            const author = data.find('div.media-info').text().trim() || ''
            return { url, imgUrl, title, author }
        })
    console.log(`comicArr : ${comicArr}`)

    return comicArr
}

async function getDetailPageInfo(tempTitle, tempUrl) {

    const detailPage = await axios.get(tempUrl, { timeout: 3000 })

    const $ = cheerio.load(detailPage.data, { ignoreWhitespace: true })

    //해당 만화책의 세부목록
    const detailArr = Array.from($('div.wr-subject'))
        .map(raw => $(raw))
        .map(data => {
            const regex = new RegExp(tempTitle + '.*화', "gi")
            const title = regex.exec(data.find('a').text()) || ''
            const url = data.find('a').attr('href') || ''
            console.log(`title :${title} ,  url : ${url}`)
            return { title, url }
        })
    console.log(`세부 목록 ${JSON.stringify(detailArr)}`)
    return detailArr

}

async function getImgs(url) {

    const puppeteer = require('puppeteer')
    // const imgPage = await axios.get(url, { timeout: 3000 })
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('div.view-content');

    console.log(page)

}

async function crawlingSite(query) {

    try {
        const pageInfo = await checkSite(query)
        if (pageInfo) {
            const searchPage = await getSearchPageInfo(pageInfo)
            //지금은 임시로 지정 추후 클라쪽 개발하면 검색해서 해당 아이템 클릭하면 검색하는식으로 
            const tempUrl = searchPage[0].url || ''
            const tempTitle = searchPage[0].title || ''
            const detailSite = await getDetailPageInfo(tempTitle, tempUrl)

            await getImgs(detailSite[0].url)
        }
    } catch (err) {
        console.error(err)
    }
}

(async () => {
    crawlingSite('킹덤')
})()