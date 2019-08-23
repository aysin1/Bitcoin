# API Document

### BITCOIN WALLET INTEGRATION
API resources for integration of bitcoin wallet, a synced bitcoin client needs to be installed and running to use the API.

You can download and install bitcoin wallet from [Bitcon client](https://bitcoin.org/en/download)


#### Get/Generate BTC Address

Returns the current bitcoin address for receiving payments to this account. If `[account]` does not exist, it will be created along with an associated new address that will be returned.

--- | ---
--- | ---
**End Point** | /btc/address/[account]
**Parameter** | `account`
**Method** | `GET`

###### Response

```json
{
    "code": 200,
    "address": "2NEMjovyGXXHFmsmWCV2nRwuwyfCgxKUmG8"
}
```

#### Get BTC Balance

Returns the unspent balance in the provided `address`.

--- | ---
--- | ---
**End Point** | /btc/balance/[address]
**Parameter** | `address`
**Method** | `GET`

###### Response

```json
{
    "code": 200,
    "balance": 99.47731949
}
```

#### Get BTC Deposits

Returns transactions for account `[account]`. If `[account]` not provided it'll return recent transactions from all accounts.

--- | ---
--- | ---
**End Point** | /btc/deposits/[account]
**Parameter** | `account`
**Method** | `GET`

###### Response

```json
{
    "code": 200,
    "deposits": [
        {
            "account": "Faucets",
            "address": "2N8qpcyuZYMtNxASfyCcEVZBrDAFoJJv3pd",
            "category": "receive",
            "amount": 12.64105053,
            "label": "Faucets",
            "vout": 0,
            "confirmations": 158,
            "blockhash": "00000000000000e88491e76ad927799511fbfb10c3764b215f4371405d4b338e",
            "blockindex": 142,
            "blocktime": 1524581617,
            "txid": "294d904729ba75e9767b813c1b05bcff75f8a07cd43063f2197a0822436bc948",
            "walletconflicts": [],
            "time": 1524581380,
            "timereceived": 1524581380,
            "bip125-replaceable": "no"
        },
        {
            "account": "Faucets",
            "address": "2N8qpcyuZYMtNxASfyCcEVZBrDAFoJJv3pd",
            "category": "receive",
            "amount": 0.49999834,
            "label": "Faucets",
            "vout": 1,
            "confirmations": 158,
            "blockhash": "00000000000000e88491e76ad927799511fbfb10c3764b215f4371405d4b338e",
            "blockindex": 140,
            "blocktime": 1524581617,
            "txid": "4eb4ba8a2fcbb035fe6992bedd5bbf82565c649e4c52d384e948a54b9bf8a80b",
            "walletconflicts": [],
            "time": 1524581571,
            "timereceived": 1524581571,
            "bip125-replaceable": "no"
        }
    ]
}
```


#### BTC Fund transfer

Initiate a fund transfer, use it for transferring fund from different wallet address to main pool addresss.

--- | ---
--- | ---
**End Point** | /btc/transfer
**Parameters** | `SendFrom`, `SendTo`
**Method** | `POST`

> `SendFrom` is a valid bitcoin wallet address from which to send the transaction (Own wallet address)
> `SendTo`, a valid bitcoin wallet address where you want to send the spendable amount (Could be any valid address)

###### Request

```json
{
    "SendTo":"2N9vec6R8emPvmW7hpYRdPYUv4zNKdSVUtX",
    "SendFrom":"2N8qpcyuZYMtNxASfyCcEVZBrDAFoJJv3pd"
}
```

###### Response

```json
{
    "code": 200,
    "tx-hash": "61cca6105d5cbb880b73db5d71c8538a6be2b0db387c6304381ce280b8168c3d",
    "fee": 0.00000166
}
```

#### BTC Fund Withdraw

Initiate a fund transfer, use it for transferring fund from main pool addresss to external address, leftover BTC will be credited back to the ChangeAddress provided.

--- | ---
--- | ---
**End Point** | /btc/withdraw
**Parameters** | `AmountToTransfer`, `SendTo`, `ChangeAddress`
**Method** | `POST`

> `AmountToTransfer` amount to transfer from the sending address
> `SendTo`, a valid bitcoin wallet address where you want to send the spendable amount (Could be any valid address)
> `ChangeAddress` BTC address where leftover BTC from the selected inputs of unspent transactions will be sent.

###### Request

```json
{
    "SendTo":"2N8qpcyuZYMtNxASfyCcEVZBrDAFoJJv3pd",
    "ChangeAddress": "2N8qpcyuZYMtNxASfyCcEVZBrDAFoJJv3pd",
    "AmountToTransfer": "1"
}
```

###### Response

```json
{
    "code": 200,
    "tx-hash": "61cca6105d5cbb880b73db5d71c8538a6be2b0db387c6304381ce280b8168c3d",
    "fee": 0.00000166
}
```
