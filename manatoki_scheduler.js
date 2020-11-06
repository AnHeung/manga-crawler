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

const messageBody2 = {
    "text": "Danny Torrence left a 1 star review for your property.",
    "blocks": [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Danny Torrence left the following review for your property:"
            }
        },
        {
            "type": "section",
            "block_id": "section567",
            "text": {
                "type": "mrkdwn",
                "text": "<https://example.com|Overlook Hotel> \n :star: \n Doors had too many axe holes, guest in room 237 was far too rowdy, whole place felt stuck in the 1920s."
            },
            "accessory": {
                "type": "image",
                "image_url": "https://is5-ssl.mzstatic.com/image/thumb/Purple3/v4/d3/72/5c/d3725c8f-c642-5d69-1904-aa36e4297885/source/256x256bb.jpg",
                "alt_text": "Haunted hotel image"
            }
        },
        {
            "type": "section",
            "block_id": "section789",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": "*Average Rating*\n1.0"
                }
            ]
        }
    ]
}

const messageBody = {
    "username": "Order notifier",
    "text": "New order <!everyone> <!here> <@hpeinar>", // <> are used for linking
    "icon_emoji": ":moneybag:",
    "attachments": [ // attachments, here we also use long attachment to use more space
        {
            "color": "#2eb886",
            "fields": [
                {
                    "title": "Environment",
                    "value": "Production",
                    "short": true
                },
                {
                    "title": "Value",
                    "value": "4€",
                    "short": true
                },
                {
                    "title": "User ID",
                    "value": "6",
                    "short": true
                },
                {
                    "title": "Product",
                    "value": "Awesome Product",
                    "short": true
                },
                {
                    "title": "Additional notes from user",
                    "value": "Extra long notes from the user about important things.",
                    "short": false // marks this to be wide attachment
                }
            ],
            "actions": [ // Slack supports many kind of different types, we'll use buttons here
                {
                    "type": "button",
                    "text": "Show order", // text on the button 
                    "url": "http://example.com" // url the button will take the user if clicked
                },
                {
                    "type": "button",
                    "text": "Handle delivery",
                    "style": "primary", // you can have buttons styled either primary or danger
                    "url": "http://example.com"
                },
                {
                    "type": "button",
                    "text": "Cancel order",
                    "style": "danger",
                    "url": "http://example.com/order/1/cancel"
                }
            ]
        }
    ]
};
