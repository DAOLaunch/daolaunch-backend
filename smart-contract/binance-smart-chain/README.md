** Changes for mainnet release

1. WBNB.sol => 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd

2. PancakeV2Factory.sol => 0x6725F303b657a9451d8BA641348b6761A6CC7a17

3. Deploy PancakeSwapLocker.sol (adding in uniswap factory address) => 0x68e062D84bFb532e8011C3dD2C79793e1ADE5D43

4. Deploy PresaleBSCSettings.sol => 0x3Ad3888bBdA20F3CaE736662263fE836d7a23277

5. Deploy PresaleFactory.sol => 0x93493d415FB07B503ac7545cd40B8c22712d97f8

6. In PresaleBSCLockForwarder.sol => 0xbBc40799d3ad307453A81929b74b9B29a3066b0F
   -- add in the constructor hardcoded PresaleFactory UnicryptLocker, Uniswap factory address
   -- Deploy

7. In Presale01.sol =>
   -- Add in the constructor the hardcoded UniswapFactory, WETH, PresaleSettings, PresaleLockForwarder address, Any Dev address

8. In BSCPresaleGenerator01.sol => 0x8016cCE271EEabf3D2dfa863EB2Ced8BaAC7849B
  -- Add in the constructor hardcoded PresaleFactory, PresaleSettings address
  -- deploy PresaleGenerator01.sol

9. In PresaleFactory.sol
  -- call 'adminAllowPresaleGenerator' function passing in (address PresaleGenerator01, true)

10. In UniswapV2Locker.sol
  -- call 'whitelistFeeAccount' with args (address PresaleLockForwarder, true)


  ["100000000000000000000000","100000000000000000000","2000000000000000000","100000000000000000","1000000000000000000000","100000000000000000","500","90000000000000000000","8382872","8382972",3600, "8382973"]