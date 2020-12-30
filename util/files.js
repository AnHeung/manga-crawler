const fs = require('fs');
const defaultPath = './manatoki_config.json';

exports.saveConfig = async (config) => {

    const searchPage = config.searchPage
    const updatePage = config.updatePage
    const successNo = config.successNo

    return new Promise(res => {
        fs.writeFile(defaultPath, JSON.stringify({searchPage:searchPage , updatePage:updatePage , successNo:successNo}), e => {
            if (e) {
                throw new Error()
            }
            console.log('파일 저장 성공')
            res()
        })
    })
}

async function isFileExist() {
    return new Promise((res, rej) => {
        fs.stat(defaultPath, e => {
            if (e) return res(false)
            res(true)
        })
    })
}

exports.getConfig = async () => {

    const fileExist = await isFileExist()
    
    if (fileExist) {
        const json = fs.readFileSync(defaultPath, 'utf-8')
        if (json) return JSON.parse(json)
        return {}
    } else {
        await this.saveSuccessNo()
        return {}
    }
}


