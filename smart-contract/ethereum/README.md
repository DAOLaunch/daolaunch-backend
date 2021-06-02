** Changes for mainnet release

1. WETH.sol => 0xd0A1E359811322d97991E03f863a0C30C2cF029C

2. UniswapV2Factory.sol => 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f

3. Deploy UniswapV2Locker.sol (adding in uniswap factory address) => 0xa7523284Cb31558B7086833F09Cfb0f2f9168761

4. Deploy PresaleSettings.sol => 0x5B60d47c3b40C3EdDED894A66eAd577E3bF89513

5. Deploy PresaleFactory.sol => 0xEc71fa78F127Ef84DD16575B6634c74C95056Df6

6. In PresaleLockForwarder.sol => 0xBC8907dDd3b103f95521A0BdF4D04d9c9df00710
   -- add in the constructor hardcoded PresaleFactory UnicryptLocker, Uniswap factory address
   -- Deploy

7. In Presale01.sol =>
   -- Add in the constructor the hardcoded UniswapFactory, WETH, PresaleSettings, PresaleLockForwarder address, Any Dev address

8. In PresaleGenerator01.sol => 0x6656a96f840762c39A6b9874688E95D0E3cADFCc
  -- Add in the constructor hardcoded PresaleFactory, PresaleSettings address
  -- deploy PresaleGenerator01.sol

9. In PresaleFactory.sol
  -- call 'adminAllowPresaleGenerator' function passing in (address PresaleGenerator01, true)

10. In UniswapV2Locker.sol
  -- call 'whitelistFeeAccount' with args (address PresaleLockForwarder, true)


  ["100000000000000000000000","100000000000000000000","2000000000000000000","100000000000000000","1000000000000000000000","100000000000000000","500","90000000000000000000","24580106","24580166",3600, "24580167"]

  100000000000000000
  10000000000000000

  send DaoLaunch Fee :75,403
  listing On Uniswap: 3327479
  3,128,781

  "0x68D4c1Ca4beD732D2BeC9EEa732859c60c95A51b","0xC110177c628713DCC34919Bf9622D07cACB13D37","0xd0A1E359811322d97991E03f863a0C30C2cF029C",[],["100000000000000000000000","100000000000000000000","2000000000000000000","10000000000000000","1000000000000000000000","100000000000000000","500","90000000000000000000","24585191","24585291","3600", "24585292"],"0xEc61cD9195790A8BF88713391833C916810EB72c"

  eth: 0x4818029D68Aa3DaEe67F28dF8c7D4895BAB029B6
  bsc: 0xD521a10c012D3AF25Bd8c06eD4326736077a9490

  ** Changes for mainnet release

1. WETH.sol => 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

2. UniswapV2Factory.sol => 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f

3. Deploy UniswapV2Locker.sol (adding in uniswap factory address) => 0xa7523284Cb31558B7086833F09Cfb0f2f9168761

4. Deploy PresaleSettings.sol => 0x5B60d47c3b40C3EdDED894A66eAd577E3bF89513

5. Deploy PresaleFactory.sol => 0xEc71fa78F127Ef84DD16575B6634c74C95056Df6

6. In PresaleLockForwarder.sol => 0xBC8907dDd3b103f95521A0BdF4D04d9c9df00710
   -- add in the constructor hardcoded PresaleFactory UnicryptLocker, Uniswap factory address
   -- Deploy

7. In Presale01.sol =>
   -- Add in the constructor the hardcoded UniswapFactory, WETH, PresaleSettings, PresaleLockForwarder address, Any Dev address

8. In PresaleGenerator01.sol => 0x6656a96f840762c39A6b9874688E95D0E3cADFCc
  -- Add in the constructor hardcoded PresaleFactory, PresaleSettings address
  -- deploy PresaleGenerator01.sol

9. In PresaleFactory.sol
  -- call 'adminAllowPresaleGenerator' function passing in (address PresaleGenerator01, true)

10. In UniswapV2Locker.sol
  -- call 'whitelistFeeAccount' with args (address PresaleLockForwarder, true)