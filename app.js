var GasDropComponent = require('./components/EventListener')
var Web3Service = require('./services/Web3Service')
var NotificationService = require('./services/NotificationService')
async function main() {
    console.log("Starting application...")
    var web3Service = await Web3Service.init()
    NotificationService.init()
    GasDropComponent.startPolling(web3Service)
}

main()
