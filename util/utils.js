const wait = (time)=>{
    return new Promise(res => {
        setTimeout(() => {
            res()
        }, time);
    })
}

const isEmpty = value => {
    if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
        return true
    } else {
        return false
    }
};

const cleanText = (text)=>{
    if(isEmpty(text) || !isEmpty(text) && typeof text !== 'string') return ''
    return text.replace(/([\t|\n])/gi, "").toString().trim()
}

module.exports = {
    wait: wait,
    cleanText:cleanText
}
