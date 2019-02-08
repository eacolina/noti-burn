module.exports = {
    startPolling: startPolling
}

// This service will listen for transactions on the xDai network
if (process.env.NODE_ENV != 'production') {
    require('dotenv').load()
}

var NotificationService = require('./../services/NotificationService')

const DROP_AMOUNT = '0.02' // amount that should be droped to the new token holder
const BURN_ACCOUNT = '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF'
const CONTRACT_ARTIFACT = require('./../build/contracts/ERC20Vendable.json');
const vendors = require('./../VendorIdentities.json')

let TOKEN_ABI = CONTRACT_ARTIFACT.abi
var tokenContract
var lastEventBlock = 2067260
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
         if (latest_block > lastEventBlock) { // check if the recived block is actually higher that the previous one
            lastEventBlock = latest_block // so that next time we only get events starting from that block
            for (var i = 0; i < res.length; i++) { // loop through the most recent events
                var eventData = res[i].returnValues
                if(checkIfVendorBurn(eventData)){ // check is this transaction corresponds to a vendor cash out
                    let value = utils.fromWei(eventData.value)
                    let message = `There was a vendor burn of ${value} USD from account ${eventData.from}`
                    console.log(message)
                    let vendor = vendors[eventData.from]
                    NotificationService.sendOffRampNotification(vendor, value)
                }
            }
        }
        doneFirstRun = true // flag to stop start polling
    }
}
// Check for conditions of a vendor cashout
function checkIfVendorBurn(event){
    // if using transfer with data:
    // (utils.hexToString(event.data) == BURN_MESSAGE && VENDOR_ACCOUNTS.includes(event.from) && event.to == BURN_ACCOUNT)
    return (event.to == BURN_ACCOUNT && (event.from in vendors))
}


