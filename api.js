const {getSearchList , crawlingUpdateData, crawlingBatchData} = require('./manatoki_crawler');

const searchData = async (query)=> await getSearchList(query) || false;

const getUpdateData = async() => await crawlingUpdateData() || false;

const crawlingBatch = async()=> await crawlingBatchData()

module.exports = {
    searchData:searchData,
    getUpdateData:getUpdateData,
    crawlingBatch:crawlingBatch
}
