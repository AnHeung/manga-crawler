require('dotenv-flow').config({
    node_env: process.env.NODE_ENV || 'dev',
    silent: true
});

const SLACK_API_URL = process.env.SLACK_API_URL
const BATCH_API_URL = `${process.env.MANATOKI_API_URL}batch/`
const COMPLETE_API_URL = `${process.env.MANATOKI_API_URL}complete/`
const CONFIG_API_URL = `${process.env.MANATOKI_API_URL}config/`
const type = 'manatoki';



module.exports = {
    type:type,
    SLACK_API_URL:SLACK_API_URL,
    BATCH_API_URL:BATCH_API_URL,
    COMPLETE_API_URL:COMPLETE_API_URL,
    CONFIG_API_URL:CONFIG_API_URL,
}