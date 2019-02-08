# Burn and shout! A tool that will simply burn tokens and will send an SMS or email alert.

#Instructions:
- Clone this repo
- Set your the following environment variables or .env file:
    ```
    WALLET_MNEMONIC=xxxxxx
    TOKEN_ADDRESS=xxxxx
    RPC_ENDPOINT=https://dai.poa.network
    TWILIO_ACCOUT_SID=xxxxxxx
    TWILIO_AUTH_TOKEN=xxxxxxxxx
    TWILIO_FROM_NUMBER=xxxxxx
    GMAIL_PASSWORD=xxxxxxxx
    GMAIL_USER_NAME=xxxxxxx@gmail.com
    ```
    Where:
    - WALLET_MNEMONIC is the mnemonic of the account used to talk to the network.
    - TOKEN_ADDRESS is the address of the token you want to track
    - Get the TWILIO_ variables from your Twilio console and don't forget to use the +Country_Code format
    - The Gmail variables are used for email notifications. Rembember to allow less secure apps on your Gmail security settings.
- Create a file: `AdminIdentitites.json` and load the identities of the people who will receive notifiactions using the following schema:
    ```
    [
        {
            "name": "Satoshi",
            "email": "satoshi@bitcoin.com",
            "phoneNumber": "+12345678" 
        },...
    ]
    ```
- Load the `VendorIdentites.json` file with the schema in that file
- Run: 
    - `npm i`
    - `truffle compile`
    - `npm start`
