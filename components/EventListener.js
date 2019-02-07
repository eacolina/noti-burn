module.exports = {
    startPolling: startPolling
}

// This service will listen for transactions on the xDai network
if (process.env.NODE_ENV != 'production') {
    require('dotenv').load()
}

const DROP_AMOUNT = '0.02' // amount that should be droped to the new token holder

const accountSid = 'AC75b23858af4c26592925d8bcdcc4e9d4'
const authToken = '0f9713f579e1b162d75b5f2b967c5c38'
const client = require('twilio')(accountSid, authToken)
const fromNumber = "+12015914091"
const toNumber = "+593980470694"

const VENDOR_ACCOUNTS = ['0x4E7F7B105f838640F453Ce427eFEdA4E194CaC57']
const BURN_ACCOUNT = '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF'
const BURN_MESSAGE = 'VENDOR CASH OUT'

const CONTRACT_ARTIFACT = require('./../build/contracts/ERC20Vendable.json');
let TOKEN_ABI = CONTRACT_ARTIFACT.abi
var tokenContract
var lastEventBlock = 11
var doneFirstRun = false
var eth
var utils
var account

async function startPolling(web3Service) {
    eth = web3Service.eth
    utils = web3Service.utils
    account = (await eth.getAccounts())[0]
    dropAmount = utils.toWei(DROP_AMOUNT)
    console.log("Starting GasDrop component...")
    tokenContract = new web3Service.eth.Contract(TOKEN_ABI, process.env.TOKEN_ADDRESS, {
        from: account
    })
    console.log("Getting initial owners of the token")
    getTransferEvents() //
}

async function getTransferEvents() {
    tokenContract.getPastEvents("Transfer", {
        fromBlock: lastEventBlock + 1,
        toBlock: 'latest'
    }, TransferCB)
    if (doneFirstRun) { // do a first run to get all the token holders
        setTimeout(getTransferEvents, 150)// after that just poll every 150ms
    } else {
        setTimeout(getTransferEvents, 4000)
    }

}

// Callback function for the Transfer event listener
async function TransferCB(err, res) {
    if (err) {
        console.log("There was an error with the RPC endpoint")
    } else {
        if(res.length == 0) return;
        var latest_block = (res[res.length - 1]).blockNumber // get the latest event block number
        console.log(latest_block)
        console.log(lastEventBlock)
         if (latest_block > lastEventBlock) { // check if the recived block is actually higher that the previous one
            console.log(res)
            lastEventBlock = latest_block // so that next time we only get events starting from that block
            for (var i = 0; i < res.length; i++) { // loop through the most recent events
                console.log(lastEventBlock)
                var eventData = res[i].returnValues
                if(checkIfVendorBurn(eventData)){
                    let message = "There was a vendor burn of " + utils.fromWei(eventData.value) + " BUFF from account " + eventData.from
                    console.log(message)
                    sendSMSAlerts(message)
                }
            }
        }
        doneFirstRun = true // flag to stop start polling
    }
}

function checkIfVendorBurn(event){
    // if using transfer with data:
    // (utils.hexToString(event.data) == BURN_MESSAGE && VENDOR_ACCOUNTS.includes(event.from) && event.to == BURN_ACCOUNT)
    return (event.to == BURN_ACCOUNT && VENDOR_ACCOUNTS.includes(event.from))
}

function sendSMSAlerts(_message){
    client.messages
  .create({
     body: _message,
     from: fromNumber,
     to: toNumber,
   })
  .then(message => console.log("Sent SMS with SID:",message.sid))
  .done();
}

