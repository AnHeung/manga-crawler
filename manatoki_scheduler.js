const webHookUrl = 'https://hooks.slack.com/services/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'
const channel = '#manatoki_scheduler'
const username = "tester"
const Slack = require('slack-node');
const Axios = require('axios');


const slack = new Slack();
slack.setWebhook(webHookUrl);
const send = async (message) => {
    slack.webhook({
        channel, // 전송될 슬랙 채널
        username, //슬랙에 표시될 이름
        text: message
    }, function (err, response) {
        console.log(response);
    });
}

exports.sendSlackMsg = async (mangaData) => {

    const result = await Axios.post(webHookUrl, JSON.stringify(configMessageBody(mangaData)))
        .catch(err => {
            console.error(err)
        })
    if(result){
        console.log(`만화책 업데이트 완료 :${mangaData}`)
    }
}

function makeBlocks(mangaData) {

    return blocks = mangaData.reduce((acc, data) => {

        const { title, link, date, thumbnail, comicLink } = data
        acc.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `<${link}> \n ${title} \n ${date}`  
            },
            "accessory": {
                "type": "image",
                "image_url": thumbnail,
                "alt_text": title
            }
        })
        return acc;
    }, [])
}

//링크보내기가 get 방식으로 밖에 안되서 조립하는 로직
function makeUrlLink (params){

    const batchLink = 'https://5e401b8b8eb0.ngrok.io/manatoki/batch'
    
    const keyArr = Object.keys(params)
    
    let isFirst = true

    const url =  keyArr.reduce((acc, key)=>{
        
        const value = params[key]

        if(isFirst){
           acc = `${acc}?${key}=${value}`
           isFirst = false
        }else{
            acc = `${acc}&${key}=${value}`
        }
        return acc
    },batchLink)

    return encodeURI(url)
}

function makeAttachment(mangaData) {

    return mangaData.reduce((acc, data) => {

        const { title, link, date, thumbnail ,comicLink} = data
       
        const registerBatchLink = makeUrlLink(data)

        const attchment =  // attachments, here we also use long attachment to use more space
        {
            "color": "#2eb886",
            "title_link": link,
            "fields": [
                {
                    "title": "제목",
                    "value": title,
                    "short": false,
                },
                {
                    "title": "업데이트 날짜",
                    "value": date,
                    "short": false,
                },
            ],
            "thumb_url": thumbnail,
            "actions": [ // Slack supports many kind of different types, we'll use buttons here
                {
                    "type": "button",
                    "text": "보러가기", // text on the button 
                    "url": link // url the button will take the user if clicked
                },
                {
                    "type": "button",
                    "text": "전편보기", // text on the button 
                    "style": "danger",
                    "url": comicLink // url the button will take the user if clicked
                },
                {
                    "type": "button",
                    "text": "다운로드", // text on the button 
                    "style": "primary",
                    "url": link // url the button will take the user if clicked
                },
                {
                    "type": "button",
                    "text": "배치추가", // text on the button 
                    "style": "danger",
                    "url": registerBatchLink // url the button will take the user if clicked
                }
            ]
        }
        
        acc.push(attchment)
        return acc;
    }, [])
}

function configMessageBody(mangaData) {

    const attchment = makeAttachment(mangaData  )

    return {
        "attachments": attchment
    }
}