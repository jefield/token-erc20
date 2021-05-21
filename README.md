### Running the tests

Install the dependencies:

```bash
yarn install
```

Create the .env file:

```bash
cp -v .env.example .env
```

Run the ganache-cli test rpc with a predefined mnemonic phrase:

```bash
yarn testrpc
```

Run the tests in a new terminal session:

```bash
truffle test
```

# Deploy contract 

Config deploy account 

If .env not exit please
```
cp .env.example .env
```
Find the .env to find TRUSTED_ACCOUNT config key input the deploy account private key


Config gasPrice on network 

Find the truffle-config.js file get  export object  in  follow path and default gasPrice is 1gwei

```
networks ->  live -> gasPrice
```

Deploy contract to rinkeby test network 

```bash
./node_modules/.bin/truffle migrate --reset --network rinkeby
```
Deploy contract to  main net network 

```bash
./node_modules/.bin/truffle migrate --reset --network live
```
