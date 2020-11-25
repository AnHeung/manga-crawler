const {BATCH_API_URL, SLACK_API_URL} = require('../appConstants');
const Axios = require('axios');

const getManatokiBatchList = async () => {

    return await Axios.get(BATCH_API_URL)
        .then(res=>res.data.data)
        .catch(e => { throw new Error(`getManatokiBatchList 에러 : ${e}`) })
}

const sendSlackMsg = async (type,data)=>{
    
    const params = { type, data}

    return await Axios.post(SLACK_API_URL, params)
        .then(true)
        .catch(e => {
            console.error(e)
            return false
        })
}

const addManatokiBatch = async (comic)=>{

    const params = {comic}

    return await Axios.post(BATCH_API_URL, params)
        .then(true)
        .catch(e => {
            console.error(e)
            return false
        })
}

module.exports = {
    getManatokiBatchList:getManatokiBatchList,
    sendSlackMsg : sendSlackMsg,
    addManatokiBatch:addManatokiBatch
}