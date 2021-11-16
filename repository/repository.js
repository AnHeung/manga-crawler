const { CONFIG_API_URL, BATCH_API_URL, SLACK_API_URL, COMPLETE_API_URL ,API_KEY, API_KEY_VALUE} = require('../appConstants');
const Axios = require('axios');
Axios.defaults.headers[API_KEY] = API_KEY_VALUE

const getManatokiBatchList = async () => {

    return await Axios.get(BATCH_API_URL)
        .then(res => res.data.data)
        .catch(e => { throw new Error(`getManatokiBatchList 에러 : ${e}`) })
}


const getManatokiConfig = async () => {

    return await Axios.get(CONFIG_API_URL)
        .then(res => res.data.data)
        .catch(e => { throw new Error(`getManatokiBatchList 에러 : ${e}`) })
}


const saveManatokiConfig = async (config) => {

    const params = { config: config }

    return await Axios.post(CONFIG_API_URL, params)
        .then(true)
        .catch(e => {
            console.error(`saveManatokiConfig error : ${e}`)
            return false
        })
}

const sendSlackMsg = async (type, data) => {

    const params = { type, data }

    return await Axios.post(SLACK_API_URL, params)
        .then(true)
        .catch(e => {
            console.error(`sendSlackMsg error : ${e}`)
            return false
        })
}

const addManatokiComplete = async (complete) => {
    const params = { complete }

    return await Axios.post(COMPLETE_API_URL, params)
        .then(true)
        .catch(e => {
            console.error(`sendSlackMsg error : ${e}`)
            return false
        })
}

const getManatokiComplete = async () => {

    return await Axios.get(COMPLETE_API_URL)
        .then(res => res.data.data)
        .catch(e => {
            console.error(`sendSlackMsg error : ${e}`)
            return false
        })
}


const addManatokiBatch = async (comic) => {

    const params = { comic }

    return await Axios.post(BATCH_API_URL, params)
        .then(true)
        .catch(e => {
            console.error(e)
            return false
        })
}

module.exports = {
    getManatokiBatchList: getManatokiBatchList,
    sendSlackMsg: sendSlackMsg,
    addManatokiBatch: addManatokiBatch,
    getManatokiComplete: getManatokiComplete,
    addManatokiComplete: addManatokiComplete,
    getManatokiConfig: getManatokiConfig,
    saveManatokiConfig:saveManatokiConfig
}