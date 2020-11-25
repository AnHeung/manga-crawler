const {getSearchList , crawlingUpdateData, schedulingBatchComics} = require('./manatoki_crawler');

const searchData = async (query)=> await getSearchList(query) || false;

const getUpdateData = async() => await crawlingUpdateData() || false;

const schedulingManatokiBatch = async()=> await schedulingBatchComics()

module.exports = {
    searchData:searchData,
    getUpdateData:getUpdateData,
    schedulingManatokiBatch:schedulingManatokiBatch
}
