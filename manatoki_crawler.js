const axios = require('axios');
const cheerio = require('cheerio');
const Async = require('async');
const moment = require('moment');
const { sendSlackMsg } = require('./manatoki_scheduler');
const searchPage = 'https://manatoki87.net/bbs/search.php?'
const updatePage = 'https://manatoki87.net/page/update'
const { saveSuccessNo, getSuccssNo } = require('./util/files')
const { getManatokiBatchList } = require('./repository/repository');

//최근 성공했던 숫자 기준으로 총 3회 숫자올려서 검사 (사이트 주소가 자주 바뀌기 때문에)
async function checkSite(site, query, retryCount = 3) {

    const siteNo = await getSuccssNo();

    return retry(0, retryCount, connectSite, { site, siteNo, query })
        .then(data => data.page)
        .catch(e => {
            console.error(`getSiteInfo 에러 ${e}`)
            return false
        })
}

//오늘 데이터 뽑아오기(모든 페이지)
async function getTodayUpdateData(site, query, currentPage = 1, totalDataArr = []) {

    const page = await checkSite(site, query)

    if (page) {
        const todayPageData = await getTodayUpdatePageData(page)
        totalDataArr = [...totalDataArr, ...todayPageData]
        if (isTodayPage(page)) {
            query.page = ++currentPage
            return getTodayUpdateData(site, query, currentPage, totalDataArr)
        } else {
            return totalDataArr;
        }
    } else {
        console.error('getTodayUpdateData : 페이지 읽기 실패')
    }
}

//현재 업데이트 된 페이지 긁어오기
async function getUpdatePageData(page) {

    const $ = cheerio.load(page.data, { ignoreWhitespace: true })

    return Promise.all(Array.from($('div.post-row'))
        .map(data => $(data))
        .map(async data => {

            const comicLink = data.find('div.post-info a').attr('href')

            //자꾸 403 forbidden 걸림 천천히 긁어와야 하나...
            // const comicPageData = await getComicPageData(comicLink)

            const title = /.*화/.exec(data.find('div.post-subject a').text())
                ? /.*화/.exec(data.find('div.post-subject a').text().replace(/([\t|\n|\s])/gi, "")).toString()
                : data.find('div.post-subject a').text().replace(/([\t|\n|\s])/gi, "").toString()
            const link = data.find('div.post-subject a').attr('href') || ''
            const uploadDate = data.find('span.txt-normal').text() || moment(new Date()).format('MM-DD')
            const thumbnail = data.find('div.img-wrap img').attr('src')

            return { title, link, uploadDate, thumbnail, comicLink }
        }))
}

//현재 업데이트 된 페이지에서  배치 목록만 긁어오기
const filterBatchItem = (updateList, batchList) => updateList.filter(({ title }) => batchList.find(batch => title.includes(batch.title)))

async function getComicPageData(siteUrl) {

    const site = await axios.get(siteUrl)
        .catch(e => console.error(`axios err : ${e}`))

    if (site) {
        const $ = cheerio.load(site.data)

        const title = Array.from($('meta'))
            .filter(data => $(data).attr('name') === 'subject')
            .map(data => $(data).attr('content'))

        const test = Array.from($('div.col-md-10 div.view-content'))
            .filter(data => $(data).find('strong').text())
            .map(data => {
                return $(data).find('a')
            })
    }

}

//해당 페이지에서 오늘 데이터 뽑아오기
async function getTodayUpdatePageData(page) {

    const currentUpdatePage = await getUpdatePageData(page)

    return currentUpdatePage
        .filter(({ uploadDate }) => {
            const todayFormat = moment(new Date()).format('MM-DD')
            const isToday = uploadDate
                ? uploadDate.includes(todayFormat)
                : false
            return isToday
        })
}

//업데이트 페이지에서 오늘데이터가 없는지 체크
function isTodayPage(page) {

    const $ = cheerio.load(page.data, { ignoreWhitespace: true })

    return Array.from($('div.post-row'))
        .map(data => $(data))
        .every(data => {
            const todayFormat = moment(new Date()).format('MM-DD')
            const isToday = data.find('span.txt-normal').text()
                ? data.find('span.txt-normal').text().includes(todayFormat)
                : false
            return isToday
        })
}

//해당 주소로 접속 시도 
async function connectSite(params) {

    return new Promise(async (res, rej) => {

        setTimeout(async () => {

            const siteNo = params.siteNo + params.n
            const query = params.query
            let site = params.site
            site = site.replace(/\d+(?=\.net)/, siteNo)

            console.log(`접속 시도 사이트 ${site}`)
            const page = await axios.get(site, { params: query, timeout: 15000 })
                .catch(e => {
                    console.error(`axios 통신 에러 ${e}`)
                })
            if (page) {
                saveSuccessNo(siteNo)
                return res({ err: false, page: page })
            } else {
                rej({ err: true, errMsg: `오류 ${page}` })
            }
        }, 2000);
    })
}


//지정된 숫자만큼 사이트 접속시도
async function retry(n = 0, tryCount, promise, params) {

    return new Promise((res, rej) => {

        if (tryCount === n) return rej()

        promise({ ...params, n })
            .then(res)
            .catch(e => {
                retry(n + 1, tryCount, promise, { ...params, n })
                    .then(res)
                    .catch(e => rej)
            })
    })
}

//검색 페이지 리스트
async function getSearchPageInfo(page) {

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
    console.log(`검색페이지에서 나오는 만화 목록 : ${comicArr}`)

    return comicArr
}

//검색해서 클릭까지 햇을때 해당 만화 세부페이지
async function getDetailPageInfo(tempTitle, tempUrl) {

    const detailPage = await axios.get(tempUrl, { timeout: 10000 })

    const $ = cheerio.load(detailPage.data, { ignoreWhitespace: true })

    //해당 만화책의 세부목록
    const detailArr = Array.from($('div.wr-subject'))
        .map(raw => $(raw))
        .map(data => {
            const regex = new RegExp(tempTitle + '.*화', "gi")
            const title = regex.exec(data.find('a').text())
                ? regex.exec(data.find('a').text()).toString()
                : '제목없음'
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

//페이지가 바로 로딩이 안되서 스크롤로 조금씩 내려가서 이미지 로딩 유도
async function scrollAction(page) {
    const scrollHeight = 'document.body.scrollHeight';
    let previousHeight = await page.evaluate(scrollHeight);
    const per = previousHeight / 10

    await page.evaluate(async (per) => {
        let promise = Promise.resolve()
        for (let i = 0; i < 10; i++) {
            promise = promise.then(() => {
                return new Promise(res => {
                    setTimeout(() => {
                        window.scrollTo(i * per, (i + 1) * per)
                        res(i)
                    }, 100);
                })
            })
        }
        return promise
    }, (per));
}

//브라우저로 이미지가 로딩될때까지 기다림
async function browserWaitForImgLoading(page) {
    await scrollAction(page)
    await page.waitForSelector('div.view-padding');
}

//브라우저 시작 및 해당 url로 이동
async function loadingBrowser(url) {
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--window-size=500,500'] });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000)
    page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36WAIT_UNTIL=load")
    await page.goto(url, { waitUntil: 'networkidle0' })
    return page
}

//만화페이지에서 이미지 목록 받아오기
async function getImgs(title, url, count = 0, currentPage) {

    let downImgs = [];

    try {
        if (count === 3) throw new Error('3회 초과')

        const page = currentPage || await loadingBrowser(url)
        await browserWaitForImgLoading(page)
        const content = await page.content()
        const $ = cheerio.load(content)
        const imgArr = Array.from($('div.view-padding img')).map(data => $(data).attr('src'))

        const isLoading = imgArr.find(data => data.includes('loading-image'))
        //크롤링 햇을때 이미지가 아직 로딩중이라면...
        if (isLoading) {
            await page.reload({ waitUntil: ['networkidle0'] });
            return getImgs(title, url, ++count, page)
        } else {
            downImgs = Array.from($('div.view-padding div'))
                .filter(data => $(data).attr('id') !== 'html_encoder_div') // 다른 만화 이미지까지 추가되는 html이라 거름
                .map(data => {
                    //jquery 배열에서 일반 Array 로 수정해야 String 리스트가 뽑혀져 나옴
                    return Array.from($(data).find('img'))
                        .map(data => {
                            return $(data).attr('src')
                        })
                })
                .reduce((acc, imgs) => {
                    const divImgs = imgs || []
                    if (acc.length <= divImgs.length) return divImgs
                    return acc
                }, [])
        }
        if (page) page.browser().close()
        console.log(`downImg : ${downImgs}`)
        return { title: title, data: downImgs };
    } catch (err) {
        console.error(`이미지 불러오기 실패 ${err}`)
        return { title: title, data: [] }
    }
}

//만화 조회해서 총 만화목록 긁어오는 로직
async function crawlingSite(site, query) {

    try {
        const page = await checkSite(site, query)
        if (page) {
            const searchPage = await getSearchPageInfo(page)
            //지금은 임시로 지정 추후 클라쪽 개발하면 검색해서 해당 아이템 클릭하면 검색하는식으로 
            const tempUrl = searchPage[0].url || ''
            const tempTitle = searchPage[0].title || ''
            const detailSite = await getDetailPageInfo(tempTitle, tempUrl)

            const downloadImgArr = await Async
                .mapLimit(detailSite.splice(0, 10), 10, async ({ title, url }) => await getImgs(title, url))
                .catch(err => console.log(`downloadImgArr err : ${err}`))

            console.log(`총 다운 받은 이미지 리스트 : ${downloadImgArr}`)
        }
    } catch (err) {
        console.error(`crawlingSite err : ${err}`)
    }
}

const getSearchList = async (query) => {
    try {
        const page = await checkSite(searchPage, { stx: query })
        if (page) {
            const searchPage = await getSearchPageInfo(page)
            return searchPage
        }
    } catch (err) {
        console.error(`crawlingSite err : ${err}`)
    }
}

const crawlingUpdateData = async () => {
    const page = await checkSite(updatePage, { page: 1 })
    if (page) {
        const updatePageList = await getUpdatePageData(page)
        return updatePageList
    }
}

const crawlingBatchData = async () => {

    const batchList = await getManatokiBatchList()

    if (batchList && batchList.length > 0) {
        const page = await checkSite(updatePage, { page: 1 })
        if (page) {
            const updatePageList = await getUpdatePageData(page)
            const crawlingList = filterBatchItem(updatePageList, batchList)
            return crawlingList
        }
    } else {
        console.log('배치 목록 없음.')
    }
}


// (async () => {
//     await crawlingSite(searchPage,{stx:'아유무'})
//     const todayData = await getTodayUpdateData(updatePage, { page: 1 })
//     sendSlackMsg(todayData)
// })()


module.exports = {
    getSearchList: getSearchList,
    crawlingUpdateData: crawlingUpdateData,
    crawlingBatchData: crawlingBatchData
}