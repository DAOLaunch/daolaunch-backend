// SPDX-License-Identifier: UNLICENSED
// ALL RIGHTS RESERVED

/**
  Allows a decentralised presale to take place, and on success creates a pancake pair and locks liquidity on Unicrypt.
  B_TOKEN, or base token, is the token the presale attempts to raise. (Usally ETH).
  S_TOKEN, or sale token, is the token being sold, which investors buy with the base token.
  If the base currency is set to the WETH9 address, the presale is in ETH.
  Otherwise it is for an ERC20 token - such as DAI, USDC, WBTC etc.
  For the Base token - It is advised to only use tokens such as ETH (WETH), DAI, USDC or tokens that have no rebasing, or complex fee on transfers. 1 token should ideally always be 1 token.
  Token withdrawls are done on a percent of total contribution basis (opposed to via a hardcoded 'amount'). This allows
  fee on transfer, rebasing, or any magically changing balances to still work for the Sale token.
*/

pragma solidity ^0.6.12;

import "../common/TransferHelper.sol";
import "../common/EnumerableSet.sol";
import "../common/SafeMath.sol";
import "../common/ReentrancyGuard.sol";
import "./IBEP20.sol";

interface IPancakeFactory {
    function getPair(address tokenA, address tokenB)
        external
        view
        returns (address pair);

    function createPair(address tokenA, address tokenB)
        external
        returns (address pair);
}

interface IPresaleLockForwarder {
    function lockLiquidity(
        IBEP20 _baseToken,
        IBEP20 _saleToken,
        uint256 _baseAmount,
        uint256 _saleAmount,
        uint256 _unlock_date,
        address payable _withdrawer
    ) external;

    function pancakePairIsInitialised(address token0, address token1)
        external
        view
        returns (bool);
}

interface IWBNB {
    function deposit() external payable;

    function transfer(address to, uint256 value) external returns (bool);

    function withdraw(uint256) external;
}

interface IPresaleSettings {
    function getMaxPresaleLength() external view returns (uint256);

    function getBaseFee() external view returns (uint256);

    function getTokenFee() external view returns (uint256);

    function getEthAddress() external view returns (address payable);

    function getTokenAddress() external view returns (address payable);

    function getEthCreationFee() external view returns (uint256);
}

contract Presale01 is ReentrancyGuard {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct PresaleInfo {
        address payable PRESALE_OWNER;
        IBEP20 S_TOKEN; // sale token
        IBEP20 B_TOKEN; // base token // usually WBNB (ETH)
        uint256 TOKEN_PRICE; // 1 base token = ? s_tokens, fixed price
        uint256 MAX_SPEND_PER_BUYER; // maximum base token BUY amount per account
        uint256 MIN_SPEND_PER_BUYER; // maximum base token BUY amount per account
        uint256 AMOUNT; // the amount of presale tokens up for presale
        uint256 HARDCAP;
        uint256 SOFTCAP;
        uint256 LIQUIDITY_PERCENT; // divided by 1000
        uint256 LISTING_RATE; // fixed rate at which the token will list on uniswap
        uint256 START_BLOCK;
        uint256 END_BLOCK;
        uint256 LOCK_PERIOD; // unix timestamp -> e.g. 2 weeks
        uint256 PANCAKE_LISTING_TIME;
        bool PRESALE_IN_BNB; // if this flag is true the presale is raising ETH, otherwise an ERC20 token such as DAI
    }

    struct PresaleFeeInfo {
        uint256 UNICRYPT_BASE_FEE; // divided by 1000
        uint256 UNICRYPT_TOKEN_FEE; // divided by 1000
        address payable BASE_FEE_ADDRESS;
        address payable TOKEN_FEE_ADDRESS;
    }

    struct PresaleStatus {
        bool WHITELIST_ONLY; // if set to true only whitelisted members may participate
        bool LIST_ON_PANCAKESWAP;
        bool FORCE_FAILED; // set this flag to force fail the presale
        bool IS_TRANSFERED_FEE;
        bool IS_OWNER_WITHDRAWN;
        uint256 TOTAL_BASE_COLLECTED; // total base currency raised (usually ETH)
        uint256 TOTAL_TOKENS_SOLD; // total presale tokens sold
        uint256 TOTAL_TOKENS_WITHDRAWN; // total tokens withdrawn post successful presale
        uint256 TOTAL_BASE_WITHDRAWN; // total base tokens withdrawn on presale failure
        uint256 NUM_BUYERS; // number of unique participants
    }

    struct BuyerInfo {
        uint256 baseDeposited; // total base token (usually ETH) deposited by user, can be withdrawn on presale failure
        uint256 tokensOwed; // num presale tokens a user is owed, can be withdrawn on presale success
        bool isWithdrawn;
    }

    PresaleInfo private PRESALE_INFO;
    PresaleFeeInfo public PRESALE_FEE_INFO;
    PresaleStatus public STATUS;
    address public PRESALE_GENERATOR;
    IPresaleLockForwarder public PRESALE_LOCK_FORWARDER;
    IPresaleSettings public PRESALE_SETTINGS;
    address UNICRYPT_DEV_ADDRESS;
    IPancakeFactory public PANCAKE_FACTORY;
    IWBNB public WBNB;
    mapping(address => BuyerInfo) public BUYERS;
    EnumerableSet.AddressSet private WHITELIST;

    constructor(address _presaleGenerator) public {
        PRESALE_GENERATOR = _presaleGenerator;
        PANCAKE_FACTORY = IPancakeFactory(
            0x6725F303b657a9451d8BA641348b6761A6CC7a17
        );
        WBNB = IWBNB(0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd);
        PRESALE_SETTINGS = IPresaleSettings(
            0x3Ad3888bBdA20F3CaE736662263fE836d7a23277
        );
        PRESALE_LOCK_FORWARDER = IPresaleLockForwarder(
            0xbBc40799d3ad307453A81929b74b9B29a3066b0F
        );
        UNICRYPT_DEV_ADDRESS = 0xa84fB214aB9250c0be7312C9FFa6275F6746bee4;
    }

    function init1(
        address payable _presaleOwner,
        uint256 _amount,
        uint256 _tokenPrice,
        uint256 _maxEthPerBuyer,
        uint256 _minEthPerBuyer,
        uint256 _hardcap,
        uint256 _softcap,
        uint256 _liquidityPercent,
        uint256 _listingRate,
        uint256 _startblock,
        uint256 _endblock,
        uint256 _lockPeriod
    ) external {
        require(msg.sender == PRESALE_GENERATOR, "FORBIDDEN");
        PRESALE_INFO.PRESALE_OWNER = _presaleOwner;
        PRESALE_INFO.AMOUNT = _amount;
        PRESALE_INFO.TOKEN_PRICE = _tokenPrice;
        PRESALE_INFO.MAX_SPEND_PER_BUYER = _maxEthPerBuyer;
        PRESALE_INFO.MIN_SPEND_PER_BUYER = _minEthPerBuyer;
        PRESALE_INFO.HARDCAP = _hardcap;
        PRESALE_INFO.SOFTCAP = _softcap;
        PRESALE_INFO.LIQUIDITY_PERCENT = _liquidityPercent;
        PRESALE_INFO.LISTING_RATE = _listingRate;
        PRESALE_INFO.START_BLOCK = _startblock;
        PRESALE_INFO.END_BLOCK = _endblock;
        PRESALE_INFO.LOCK_PERIOD = _lockPeriod;
    }

    function init2(
        IBEP20 _baseToken,
        IBEP20 _presaleToken,
        uint256 _unicryptBaseFee,
        uint256 _unicryptTokenFee,
        uint256 _pancakeListingTime,
        address payable _baseFeeAddress,
        address payable _tokenFeeAddress
    ) external {
        require(msg.sender == PRESALE_GENERATOR, "FORBIDDEN");

        PRESALE_INFO.PRESALE_IN_BNB = address(_baseToken) == address(WBNB);
        PRESALE_INFO.S_TOKEN = _presaleToken;
        PRESALE_INFO.B_TOKEN = _baseToken;
        PRESALE_INFO.PANCAKE_LISTING_TIME = _pancakeListingTime;
        PRESALE_FEE_INFO.UNICRYPT_BASE_FEE = _unicryptBaseFee;
        PRESALE_FEE_INFO.UNICRYPT_TOKEN_FEE = _unicryptTokenFee;

        PRESALE_FEE_INFO.BASE_FEE_ADDRESS = _baseFeeAddress;
        PRESALE_FEE_INFO.TOKEN_FEE_ADDRESS = _tokenFeeAddress;
    }

    function init3(address[] memory _white_list) external {
        require(msg.sender == PRESALE_GENERATOR, "FORBIDDEN");
        if (_white_list.length > 0) STATUS.WHITELIST_ONLY = true;

        for (uint256 i = 0; i < _white_list.length; i++) {
            WHITELIST.add(_white_list[i]);
        }
    }

    modifier onlyPresaleOwner() {
        require(PRESALE_INFO.PRESALE_OWNER == msg.sender, "NOT PRESALE OWNER");
        _;
    }

    function presaleStatus() public view returns (uint256) {
        if (STATUS.FORCE_FAILED) {
            return 3; // FAILED - force fail
        }
        if (
            (block.number > PRESALE_INFO.END_BLOCK) &&
            (STATUS.TOTAL_BASE_COLLECTED < PRESALE_INFO.SOFTCAP)
        ) {
            return 3; // FAILED - softcap not met by end block
        }
        if (STATUS.TOTAL_BASE_COLLECTED >= PRESALE_INFO.HARDCAP) {
            return 2; // SUCCESS - hardcap met
        }
        if (
            (block.number > PRESALE_INFO.END_BLOCK) &&
            (STATUS.TOTAL_BASE_COLLECTED >= PRESALE_INFO.SOFTCAP)
        ) {
            return 2; // SUCCESS - endblock and soft cap reached
        }
        if (
            (block.number >= PRESALE_INFO.START_BLOCK) &&
            (block.number <= PRESALE_INFO.END_BLOCK)
        ) {
            return 1; // ACTIVE - deposits enabled
        }
        return 0; // QUED - awaiting start block
    }

    // accepts msg.value for eth or _amount for ERC20 tokens
    function userDeposit(uint256 _amount) external payable nonReentrant {
        require(presaleStatus() == 1, "NOT ACTIVE"); // ACTIVE
        if (STATUS.WHITELIST_ONLY) {
            require(WHITELIST.contains(msg.sender), "NOT WHITELISTED");
        }

        BuyerInfo storage buyer = BUYERS[msg.sender];
        uint256 amount_in = PRESALE_INFO.PRESALE_IN_BNB ? msg.value : _amount;
        require(
            amount_in >= PRESALE_INFO.MIN_SPEND_PER_BUYER,
            "NOT ENOUGH VALUE"
        );
        uint256 allowance = PRESALE_INFO.MAX_SPEND_PER_BUYER.sub(
            buyer.baseDeposited
        );
        uint256 remaining = PRESALE_INFO.HARDCAP - STATUS.TOTAL_BASE_COLLECTED;
        allowance = allowance > remaining ? remaining : allowance;
        if (amount_in > allowance) {
            amount_in = allowance;
        }
        uint256 tokensSold = amount_in.mul(PRESALE_INFO.TOKEN_PRICE).div(
            10**uint256(PRESALE_INFO.B_TOKEN.decimals())
        );
        require(tokensSold > 0, "ZERO TOKENS");
        if (buyer.baseDeposited == 0) {
            STATUS.NUM_BUYERS++;
        }
        buyer.baseDeposited = buyer.baseDeposited.add(amount_in);
        buyer.tokensOwed = buyer.tokensOwed.add(tokensSold);
        STATUS.TOTAL_BASE_COLLECTED = STATUS.TOTAL_BASE_COLLECTED.add(
            amount_in
        );
        STATUS.TOTAL_TOKENS_SOLD = STATUS.TOTAL_TOKENS_SOLD.add(tokensSold);

        // return unused ETH
        if (PRESALE_INFO.PRESALE_IN_BNB && amount_in < msg.value) {
            msg.sender.transfer(msg.value.sub(amount_in));
        }
        // deduct non ETH token from user
        if (!PRESALE_INFO.PRESALE_IN_BNB) {
            TransferHelper.safeTransferFrom(
                address(PRESALE_INFO.B_TOKEN),
                msg.sender,
                address(this),
                amount_in
            );
        }
    }

    // withdraw presale tokens
    // percentile withdrawls allows fee on transfer or rebasing tokens to still work
    function userWithdrawTokens() external nonReentrant {
        require(presaleStatus() == 2, "NOT SUCCESS"); // SUCCESS
        require(
            STATUS.TOTAL_TOKENS_SOLD.sub(STATUS.TOTAL_TOKENS_WITHDRAWN) > 0,
            "ALL TOKEN HAS BEEN WITHDRAWN"
        );

        BuyerInfo storage buyer = BUYERS[msg.sender];

        require(!buyer.isWithdrawn, "NOTHING TO WITHDRAW");
        uint256 tokensOwed = buyer.tokensOwed;

        STATUS.TOTAL_TOKENS_WITHDRAWN = STATUS.TOTAL_TOKENS_WITHDRAWN.add(
            tokensOwed
        );
        buyer.isWithdrawn = true;
        TransferHelper.safeTransfer(
            address(PRESALE_INFO.S_TOKEN),
            msg.sender,
            tokensOwed
        );
    }

    // on presale failure
    // percentile withdrawls allows fee on transfer or rebasing tokens to still work
    function userWithdrawBaseTokens() external nonReentrant {
        require(presaleStatus() == 3, "NOT FAILED"); // FAILED
        BuyerInfo storage buyer = BUYERS[msg.sender];
        require(!buyer.isWithdrawn, "NOTHING TO REFUND");

        uint256 baseRemainingDenominator = STATUS.TOTAL_BASE_COLLECTED.sub(
            STATUS.TOTAL_BASE_WITHDRAWN
        );
        uint256 remainingBaseBalance = PRESALE_INFO.PRESALE_IN_BNB
            ? address(this).balance
            : PRESALE_INFO.B_TOKEN.balanceOf(address(this));
        uint256 tokensOwed = remainingBaseBalance.mul(buyer.baseDeposited).div(
            baseRemainingDenominator
        );
        require(tokensOwed > 0, "NOTHING TO WITHDRAW");
        STATUS.TOTAL_BASE_WITHDRAWN = STATUS.TOTAL_BASE_WITHDRAWN.add(
            buyer.baseDeposited
        );
        buyer.isWithdrawn = true;
        TransferHelper.safeTransferBaseToken(
            address(PRESALE_INFO.B_TOKEN),
            msg.sender,
            tokensOwed,
            !PRESALE_INFO.PRESALE_IN_BNB
        );
    }

    // on presale failure
    // allows the owner to withdraw the tokens they sent for presale & initial liquidity
    function ownerRefundTokens() external onlyPresaleOwner {
        require(presaleStatus() == 3); // FAILED
        require(!STATUS.IS_OWNER_WITHDRAWN, "NOTHING TO WITHDRAW");
        TransferHelper.safeTransfer(
            address(PRESALE_INFO.S_TOKEN),
            PRESALE_INFO.PRESALE_OWNER,
            PRESALE_INFO.S_TOKEN.balanceOf(address(this))
        );
        STATUS.IS_OWNER_WITHDRAWN = true;
    }

    // Can be called at any stage before or during the presale to cancel it before it ends.
    // If the pair already exists on uniswap and it contains the presale token as liquidity
    // the final stage of the presale 'addLiquidity()' will fail. This function
    // allows anyone to end the presale prematurely to release funds in such a case.
    function forceFailIfPairExists() external {
        require(!STATUS.FORCE_FAILED);
        if (
            PRESALE_LOCK_FORWARDER.pancakePairIsInitialised(
                address(PRESALE_INFO.S_TOKEN),
                address(PRESALE_INFO.B_TOKEN)
            )
        ) {
            STATUS.FORCE_FAILED = true;
        }
    }

    // if something goes wrong in LP generation
    function forceFailByUnicrypt() external {
        require(msg.sender == UNICRYPT_DEV_ADDRESS);
        STATUS.FORCE_FAILED = true;
    }

    // on presale success, this is the final step to end the presale, lock liquidity and enable withdrawls of the sale token.
    // This function does not use percentile distribution. Rebasing mechanisms, fee on transfers, or any deflationary logic
    // are not taken into account at this stage to ensure stated liquidity is locked and the pool is initialised according to
    // the presale parameters and fixed prices.

    function listOnUniswap() external nonReentrant {
        require(
            block.number >= PRESALE_INFO.PANCAKE_LISTING_TIME,
            "Call listOnUniswap too early"
        );
        require(presaleStatus() == 2, "NOT SUCCESS"); // SUCCESS
        require(!STATUS.IS_TRANSFERED_FEE, "TRANSFERED FEE");

        uint256 unicryptBaseFee = STATUS
            .TOTAL_BASE_COLLECTED
            .mul(PRESALE_FEE_INFO.UNICRYPT_BASE_FEE)
            .div(1000);
        // base token liquidity
        uint256 baseLiquidity = STATUS
            .TOTAL_BASE_COLLECTED
            .sub(unicryptBaseFee)
            .mul(PRESALE_INFO.LIQUIDITY_PERCENT)
            .div(1000);
        if (PRESALE_INFO.PRESALE_IN_BNB) {
            WBNB.deposit{value: baseLiquidity}();
        }
        TransferHelper.safeApprove(
            address(PRESALE_INFO.B_TOKEN),
            address(PRESALE_LOCK_FORWARDER),
            baseLiquidity
        );

        // // sale token liquidity
        uint256 tokenLiquidity = baseLiquidity
            .mul(PRESALE_INFO.LISTING_RATE)
            .div(10**uint256(PRESALE_INFO.B_TOKEN.decimals()));

        // // transfer fees
        uint256 unicryptTokenFee = STATUS
            .TOTAL_TOKENS_SOLD
            .mul(PRESALE_FEE_INFO.UNICRYPT_TOKEN_FEE)
            .div(1000);
        if (unicryptBaseFee > 0) {
            TransferHelper.safeTransferBaseToken(
                address(PRESALE_INFO.B_TOKEN),
                PRESALE_FEE_INFO.BASE_FEE_ADDRESS,
                unicryptBaseFee,
                !PRESALE_INFO.PRESALE_IN_BNB
            );
        }
        if (unicryptTokenFee > 0) {
            TransferHelper.safeTransfer(
                address(PRESALE_INFO.S_TOKEN),
                PRESALE_FEE_INFO.TOKEN_FEE_ADDRESS,
                unicryptTokenFee
            );
        }
        STATUS.IS_TRANSFERED_FEE = true;

        // Fail the presale if the pair exists and contains presale token liquidity
        if (
            PRESALE_LOCK_FORWARDER.pancakePairIsInitialised(
                address(PRESALE_INFO.S_TOKEN),
                address(PRESALE_INFO.B_TOKEN)
            )
        ) {
            STATUS.FORCE_FAILED = true;
            STATUS.LIST_ON_PANCAKESWAP = true;
            return;
        }

        TransferHelper.safeApprove(
            address(PRESALE_INFO.S_TOKEN),
            address(PRESALE_LOCK_FORWARDER),
            tokenLiquidity
        );
        PRESALE_LOCK_FORWARDER.lockLiquidity(
            PRESALE_INFO.B_TOKEN,
            PRESALE_INFO.S_TOKEN,
            baseLiquidity,
            tokenLiquidity,
            block.timestamp + PRESALE_INFO.LOCK_PERIOD,
            PRESALE_INFO.PRESALE_OWNER
        );
        STATUS.LIST_ON_PANCAKESWAP = true;
    }

    function ownerWithdrawTokens() external nonReentrant onlyPresaleOwner {
        require(!STATUS.IS_OWNER_WITHDRAWN, "GENERATION COMPLETE");
        require(presaleStatus() == 2, "NOT SUCCESS"); // SUCCESS

        uint256 unicryptBaseFee = STATUS
            .TOTAL_BASE_COLLECTED
            .mul(PRESALE_FEE_INFO.UNICRYPT_BASE_FEE)
            .div(1000);
        uint256 baseLiquidity = STATUS
            .TOTAL_BASE_COLLECTED
            .sub(unicryptBaseFee)
            .mul(PRESALE_INFO.LIQUIDITY_PERCENT)
            .div(1000);
        uint256 unicryptTokenFee = STATUS
            .TOTAL_TOKENS_SOLD
            .mul(PRESALE_FEE_INFO.UNICRYPT_TOKEN_FEE)
            .div(1000);
        uint256 tokenLiquidity = baseLiquidity
            .mul(PRESALE_INFO.LISTING_RATE)
            .div(10**uint256(PRESALE_INFO.B_TOKEN.decimals()));

        // send remain unsold tokens to presale owner
        uint256 remainingSBalance = PRESALE_INFO
            .S_TOKEN
            .balanceOf(address(this))
            .add(STATUS.TOTAL_TOKENS_WITHDRAWN)
            .sub(STATUS.TOTAL_TOKENS_SOLD);

        // send remaining base tokens to presale owner
        uint256 remainingBaseBalance = PRESALE_INFO.PRESALE_IN_BNB
            ? address(this).balance
            : PRESALE_INFO.B_TOKEN.balanceOf(address(this));
        if (!STATUS.IS_TRANSFERED_FEE) {
            remainingBaseBalance = remainingBaseBalance.sub(unicryptBaseFee);
            remainingSBalance = remainingSBalance.sub(unicryptTokenFee);
        }
        if (!STATUS.LIST_ON_PANCAKESWAP) {
            remainingBaseBalance = remainingBaseBalance.sub(baseLiquidity);
            remainingSBalance = remainingSBalance.sub(tokenLiquidity);
        }

        if (remainingSBalance > 0) {
            TransferHelper.safeTransfer(
                address(PRESALE_INFO.S_TOKEN),
                PRESALE_INFO.PRESALE_OWNER,
                remainingSBalance
            );
        }

        TransferHelper.safeTransferBaseToken(
            address(PRESALE_INFO.B_TOKEN),
            PRESALE_INFO.PRESALE_OWNER,
            remainingBaseBalance,
            !PRESALE_INFO.PRESALE_IN_BNB
        );
        STATUS.IS_OWNER_WITHDRAWN = true;
    }

    function updateMaxSpendLimit(uint256 _maxSpend) external onlyPresaleOwner {
        PRESALE_INFO.MAX_SPEND_PER_BUYER = _maxSpend;
    }

    // postpone or bring a presale forward, this will only work when a presale is inactive.
    // i.e. current start block > block.number
    function updateBlocks(uint256 _startBlock, uint256 _endBlock)
        external
        onlyPresaleOwner
    {
        require(PRESALE_INFO.START_BLOCK > block.number);
        require(_endBlock.sub(_startBlock) > 0);
        PRESALE_INFO.START_BLOCK = _startBlock;
        PRESALE_INFO.END_BLOCK = _endBlock;
    }

    // editable at any stage of the presale
    function setWhitelistFlag(bool _flag) external onlyPresaleOwner {
        STATUS.WHITELIST_ONLY = _flag;
    }

    // editable at any stage of the presale
    function editWhitelist(address[] memory _users, bool _add)
        external
        onlyPresaleOwner
    {
        if (_add) {
            for (uint256 i = 0; i < _users.length; i++) {
                WHITELIST.add(_users[i]);
            }
        } else {
            for (uint256 i = 0; i < _users.length; i++) {
                WHITELIST.remove(_users[i]);
            }
        }
    }

    // whitelist getters
    function getWhitelistedUsersLength() external view returns (uint256) {
        return WHITELIST.length();
    }

    function getWhitelistedUserAtIndex(uint256 _index)
        external
        view
        returns (address)
    {
        return WHITELIST.at(_index);
    }

    function getUserWhitelistStatus(address _user)
        external
        view
        returns (bool)
    {
        return WHITELIST.contains(_user);
    }
}
