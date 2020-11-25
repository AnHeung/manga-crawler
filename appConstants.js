require('dotenv-flow').config({
    node_env: process.env.NODE_ENV || 'dev',
    silent: true
});

const SLACK_API_URL = process.env.SLACK_API_URL
const BATCH_API_URL = `${process.env.MANATOKI_API_URL}batch/`
const COMPLETE_API_URL = `${process.env.MANATOKI_API_URL}complete/`
const type = 'manatoki';


const SEARCH_PAGE = 'https://manatoki87.net/bbs/search.php?'
const UPDATE_PAGE = 'https://manatoki87.net/page/update'

module.exports = {
    type:type,
    SEARCH_PAGE:SEARCH_PAGE,
    UPDATE_PAGE:UPDATE_PAGE,
    SLACK_API_URL:SLACK_API_URL,
    BATCH_API_URL:BATCH_API_URL,
    COMPLETE_API_URL:COMPLETE_API_URL
}