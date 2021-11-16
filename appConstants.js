require('dotenv-flow').config({
    node_env: process.env.NODE_ENV || 'dev',
    silent: true
});
const os = require('os');

const SLACK_API_URL = process.env.SLACK_API_URL
const BATCH_API_URL = `${process.env.MANATOKI_API_URL}batch/`
const COMPLETE_API_URL = `${process.env.MANATOKI_API_URL}complete/`
const CONFIG_API_URL = `${process.env.MANATOKI_API_URL}config/`
const API_KEY = process.env.API_KEY
const API_KEY_VALUE = process.env.API_KEY_VALUE
const PROCESS_COUNT = os.cpus().length > 2 ? 2 : os.cpus()
const type = 'manatoki';



module.exports = {
    type:type,
    SLACK_API_URL:SLACK_API_URL,
    BATCH_API_URL:BATCH_API_URL,
    COMPLETE_API_URL:COMPLETE_API_URL,
    CONFIG_API_URL:CONFIG_API_URL,
    PROCESS_COUNT:PROCESS_COUNT,
    API_KEY_VALUE:API_KEY_VALUE,
    API_KEY:API_KEY,
}