module.exports = {
    init:init,
    sendOffRampNotification:sendOffRampNotifcation
}

if (process.env.NODE_ENV != 'production') {
    require('dotenv').load()
}

var nodemailer = require('nodemailer')
var adminList = require('./../AdminIdentities')
var transport
let emails = ["educolina2@gmail.com", "eacolina@uwaterloo.ca"]
const accountSid = process.env.TWILIO_ACCOUT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_FROM_NUMBER
const twilioClient = require('twilio')(accountSid, authToken)
// Initalize the service, create a transport object for nodemailer
function init(){
    transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth:{ // extract this
            user: "edu.side.projects@gmail.com",
            pass: process.env.GMAIL_PASSWORD
        }
    })
    console.log("Notification Service started")
}
// Identity: Vendor indentity object, check VendorIdentites.json for format
// This will trigger the send of the email notification with nodemailer and the SMS notification using Twilio
function sendOffRampNotifcation(identity, offRampValue,txHash){
    let html = generateOffRampHTML(identity, offRampValue,txHash)
    let plainText = `The vendor ${identity.name} with address ${identity.address} has requested to initate a Wyre transfer for ${offRampValue} USD. Please check your email`
    let SMSText = `${identity.name} (${identity.address}) requested Wyre transfer for ${offRampValue} USD`
    for(var i = 0; i < adminList.length; i++){ // iterate through admin list and send notifications
        let admin = adminList[i]
        sendOffRampEmail(html, plainText, admin.email)
        sendSMSAlerts(SMSText,admin.phoneNumber)
    }
}
// Sends the notifiaction via email to every email inthe to_list array
function sendOffRampEmail(html, plainText,to_email){
    // build email message
    var message = {
        from: "sender@server.com",
        to: to_email,
        subject: "ETHDenver - Vendor Cashout Request",
        text: plainText,
        html: html
      };
      // send mail
      transport.sendMail(message, (err, res) => {
          if(err != undefined){
              console.log(err)
          }
          if(res.rejected.length != 0){ // res.rejected contains the list of emails that couldn't receive the sent email
              console.log("An email address was incorrect")
          } else {
              console.log("Succesfully delivered email")
          }
      })
}
// Send the SMS alert, check Twilio DOCSs
function sendSMSAlerts(_message,toNumber){
    twilioClient.messages
  .create({
     body: _message,
     from: fromNumber,
     to: toNumber,
   })
  .then(message => console.log("Sent SMS with SID:",message.sid))
  .done();
}


// Refactor this ugly thing!! 😭 Genrate the stringified HTML used for the pretty email notitication
function generateOffRampHTML(identity, offRampValue,txHash){
    let html = `
<html>
<div class="_rp_D5 ms-font-weight-regular ms-font-color-neutralDark isMessageBodyInPopout" tabindex="-1" role="presentation" id="Item.MessageNormalizedBody" style="font-family: wf_segoe-ui_normal, &quot;Segoe UI&quot;, &quot;Segoe WP&quot;, Tahoma, Arial, sans-serif, serif, EmojiFont;">
    <div class="rps_d46f">
    <div>
    <div id="x_banner"><img data-imagetype="External" src="https://ethdenver.taigamarket.io/assets/ethdenver/banners/ETHDenver_email_banner_600x200_v5.jpg" alt="ETH Denver Banner">
    <div id="x_body">Hi Admin!<br>
    <br>
    The vendor ${identity.name} with address ${identity.address} has requested to initate a Wyre transfer for ${offRampValue} USD.
    <br>
    <br>
    You can confirm the transaction on Blockscout using the following <a href="https://blockscout.com/poa/dai/tx/${txHash}">link</a>
    <br>
    Please authorize the transfer  <a href="https://www.ethdenver.com/waiver" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable">
    here</a> 
    <br>
    <br>
    <table style="border:none; border-collapse:collapse">
    <tbody>
    <tr style="height:85.5pt">
    <td style="vertical-align:top; padding:5pt">
    <p dir="ltr" style="line-height:1.38; margin-top:0pt; margin-bottom:0pt"><span style="font-size: 11pt; font-family: Arial, serif, EmojiFont; vertical-align: baseline; white-space: pre-wrap;"><img data-imagetype="External" src="https://ethdenver.taigamarket.io/assets/ethdenver/banners/eth-logo_V1.png" width="112" height="115" class="x_CToWUd" style="border:none">
    </span></p>
    </td>
    <td style="vertical-align:top; padding:5pt"><br>
    <br>
    <p dir="ltr" style="line-height:1.44; margin-top:0pt; margin-bottom:0pt"><span style="font-size: 12pt; font-family: Comfortaa, serif, EmojiFont; color: rgb(53, 28, 117); font-weight: 700; vertical-align: baseline; white-space: pre-wrap;">The Burner Wallet Team</span>
    </p>
    <p dir="ltr" style="line-height:1.656; margin-top:0pt; margin-bottom:0pt"></p>
    <p dir="ltr" style="line-height:1.656; margin-top:0pt; margin-bottom:0pt"><a href="http://www.ethdenver.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="color:rgb(17,85,204)"><span style="font-size: 10pt; font-family: Comfortaa, serif, EmojiFont; color: rgb(53, 28, 117); vertical-align: baseline; white-space: pre-wrap;">www.ethdenver.com</span></a></p>
    <p dir="ltr" style="line-height:1.38; margin-top:0pt; margin-bottom:0pt"><a href="https://twitter.com/EthereumDenver" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="color:rgb(17,85,204)"><span style="font-size: 12pt; font-family: Comfortaa, serif, EmojiFont; vertical-align: baseline; white-space: pre-wrap;"><img data-imagetype="External" src="https://ethdenver.taigamarket.io/assets/ethdenver/banners/twitter.png" width="29" height="29" class="x_CToWUd" style="border:none"></span></a>
    <span style="font-size: 12pt; font-family: Comfortaa, serif, EmojiFont; color: rgb(136, 136, 136); vertical-align: baseline; white-space: pre-wrap;">
    </span><a href="https://www.instagram.com/ethdenver/?hl=en" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="color:rgb(17,85,204)"><span style="font-size: 12pt; font-family: Comfortaa, serif, EmojiFont; vertical-align: baseline; white-space: pre-wrap;"><img data-imagetype="External" src="https://ethdenver.taigamarket.io/assets/ethdenver/banners/instagram.png" width="29" height="29" class="x_CToWUd" style="border:none"></span></a>
    <span style="font-size: 12pt; font-family: Comfortaa, serif, EmojiFont; color: rgb(136, 136, 136); vertical-align: baseline; white-space: pre-wrap;">
    </span><a href="https://www.facebook.com/ETHDenver/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="color:rgb(17,85,204)"><span style="font-size: 12pt; font-family: Comfortaa, serif, EmojiFont; vertical-align: baseline; white-space: pre-wrap;"><img data-imagetype="External" src="https://ethdenver.taigamarket.io/assets/ethdenver/banners/facebook.png" width="30" height="30" class="x_CToWUd" style="border:none"></span></a>
    </p>
    </td>
    </tr>
    </tbody>
    </table>
    <img data-imagetype="External" src="https://ethdenver.taigamarket.io/assets/ethdenver/banners/ETHDenver_email_banner_20x200.jpg" alt="Footer&quot;">
    </div>
    </div>
    </div>
    </div>
</div>
</html>
`
    return html
}


