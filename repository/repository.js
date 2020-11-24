require('dotenv-flow').config({
    node_env: process.env.NODE_ENV || 'dev',
    silent: true
});

const Axios = require('axios');

const getManatokiBatchList = async () => {

    return await Axios.get(process.env.BATCH_URL)
        .then(res=>res.data.data)
        .catch(e => { throw new Error(`getManatokiBatchList 에러 : ${e}`) })
}

module.exports = {
    getManatokiBatchList:getManatokiBatchList
}