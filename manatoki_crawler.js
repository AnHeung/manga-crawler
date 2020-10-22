const axios = require('axios');
const cheerio = require('cheerio');

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
    //나중에 몽고디비에서 조회할 예정
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

function wait(time) {
    return new Promise(res => {
        setTimeout(() => {
            res()
        }, time);
    })
}

async function scrollAction(page) {
    //페이지가 바로 로딩이 안되서 스크롤 액션 실행
    const scrollHeight = 'document.body.scrollHeight';
    let previousHeight = await page.evaluate(scrollHeight);
    const per = previousHeight/10
    console.log(`scrollHeight : ${previousHeight}`)

    await page.evaluate(async (per)=>{
    let promise = Promise.resolve()
        for(let i = 0; i < 10; i++){
            promise = promise.then(()=>{
                return new Promise(res=>{
                    setTimeout(() => {
                        window.scrollTo(i*per, (i+1)*per)
                        res(i)
                    }, 500);
                })
            })
        }
        return promise
    },(per));
}

async function browserWaitForImgLoading(page, time) {
    await scrollAction(page)
    await page.waitForSelector('div.view-padding');
}

async function loadingBrowser(url) {
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--window-size=500,500'] });
    const page = await browser.newPage();
    page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36WAIT_UNTIL=load")
    await page.goto(url, { waitUntil: 'networkidle0' })
    return page
}


async function getImgs(url, count = 0, currentPage) {

    try {
        if (count === 3) throw new Error('3회 초과')

        const page = currentPage || await loadingBrowser(url)
        await browserWaitForImgLoading(page, 3000)
        const imgArr = await page.evaluate(() => Array.from(document.querySelectorAll('div.view-padding img')).map(data=>data.src))

        const result = imgArr.find(data => data.includes('loading-image'))
        //크롤링 햇을때 이미지가 아직 로딩중이라면...
        if (result) {
            await page.reload({ waitUntil: ['networkidle2'] });
            getImgs(url, ++count, page)
        }else{
            imgArr.filter(img=>{
                return false
            })
        }
    } catch (err) {
        console.error(`이미지 불러오기 실패 ${err}`)
    }
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