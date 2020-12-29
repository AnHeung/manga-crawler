const fs = require('fs');
const defaultPath = './succssNo.json';

exports.saveSuccessNo = async (successNo) => {

    const data = JSON.stringify({successNo: successNo || 92})

    return new Promise(res => {
        fs.writeFile(defaultPath, data, e => {
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

exports.getSuccssNo = async () => {

    const fileExist = await isFileExist()
    
    if (fileExist) {
        const json = fs.readFileSync(defaultPath, 'utf-8')
        if (json) return JSON.parse(json).successNo
        return 92
    } else {
        await this.saveSuccessNo()
        return 92
    }
}


