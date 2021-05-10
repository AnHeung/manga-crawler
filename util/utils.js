const wait = (time)=>{
    return new Promise(res => {
        setTimeout(() => {
            res()
        }, time);
    })
}

const isEmpty = value => {
    if (!value || (!value && typeof value == "object" && !Object.keys(value).length)) {
        return true
    } else {
        return false
    }
};

const cleanText = (text)=>{
    if(isEmpty(text) || !isEmpty(text) && typeof text !== 'string') return ''
    return text.replace(/([\t|\n])/gi, "").toString().trim()
}


const cleanTextWithNoNumber = (text)=>{
    if(isEmpty(text) || !isEmpty(text) && typeof text !== 'string') return ''
    return text.replace(/[0-9]/gi ,"").toString().trim()
}


module.exports = {
    wait: wait,
    cleanText:cleanText,
    cleanTextWithNoNumber:cleanTextWithNoNumber
}
