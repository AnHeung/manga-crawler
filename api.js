const {getSearchList , crawlingUpdateData, schedulingBatchComics} = require('./manatoki_crawler');

const searchData = async (query)=> await getSearchList(query) || false;

const getUpdateData = async() => await crawlingUpdateData() || false;

const schedulingManatokiBatch = async()=>{
    console.log('*** 마나토끼 배치 목록 긁어오기 시작 ***')
    await schedulingBatchComics()
    console.log('*** 마나토끼 배치 목록 긁어오기 끝  ***')
}

module.exports = {
    searchData:searchData,
    getUpdateData:getUpdateData,
    schedulingManatokiBatch:schedulingManatokiBatch
}
