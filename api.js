const {getSearchList , crawlingUpdateData, crawlingBatchData} = require('./manatoki_crawler');

exports.searchData = async (query)=> await getSearchList(query) || false;

exports.getUpdateData = async() => await crawlingUpdateData() || false;

exports.crawlingBatchData = async()=> await crawlingBatchData()