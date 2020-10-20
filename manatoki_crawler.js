const axios = require('axios');
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


async function getSiteInfo(query) {

    let promise = Promise.resolve()
    let siteNo = 80
    let errCount = 0

    for (let i = 0; i < 3; i++) {

        promise = promise
            .then(async (resultArr = []) => {
                return new Promise((res, rej) => {
                    setTimeout(async () => {
                        let site = `https://manatoki${siteNo}.net/bbs/search.php?`
                        console.log(`접속 시도 사이트 ${site}`)
                        const params = { stx: query, timeout: 3000 }
                        const page = await axios.get(site, params)
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
                        if (page) resultArr.push({ err: false, page: page })
                        else resultArr.push({ err: true, errMsg: `${errCount}회 오류` })
                        res(resultArr)
                    }, 2000);
                })
            })
    }
    return promise
        .then(resultArr =>resultArr.find(result =>!result.err))
        .catch(err => {
            console.error(`getSiteInfo 에러 ${err}`)
            return false
        })
}

async function getSite(query) {

    try {
        const pageInfo = await getSiteInfo(query)
        if(pageInfo){
            console.log(`가져온 페이지 ${pageInfo.page}`)
        }

    } catch (err) {
        console.error(err)
    }

}

(async () => {
    getSite('킹덤')

})()