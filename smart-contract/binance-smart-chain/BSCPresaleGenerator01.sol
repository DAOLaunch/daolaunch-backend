// SPDX-License-Identifier: UNLICENSED
// ALL RIGHTS RESERVED

// This contract generates Presale01 contracts and registers them in the PresaleFactory.
// Ideally you should not interact with this contract directly, and use the Unicrypt presale app instead so warnings can be shown where necessary.

pragma solidity ^0.6.12;

import "./BSCPresale01.sol";
import "../common/SafeMath.sol";
import "../common/Ownable.sol";
import "./IBEP20.sol";
import "../common/TransferHelper.sol";
import "../common/PresaleHelper.sol";

interface IPresaleFactory {
    function registerPresale(address _presaleAddress) external;

    function presaleIsRegistered(address _presaleAddress)
        external
        view
        returns (bool);
}

interface IPancakeLocker {
    function lockLPToken(
        address _lpToken,
        uint256 _amount,
        uint256 _unlock_date,
        address payable _referral,
        bool _fee_in_eth,
        address payable _withdrawer
    ) external payable;
}

contract PresaleGenerator01 is Ownable {
    using SafeMath for uint256;

    IPresaleFactory public PRESALE_FACTORY;
    IPresaleSettings public PRESALE_SETTINGS;

    struct PresaleParams {
        uint256 amount;
        uint256 tokenPrice;
        uint256 maxSpendPerBuyer;
        uint256 minSpendPerBuyer;
        uint256 hardcap;
        uint256 softcap;
        uint256 liquidityPercent;
        uint256 listingRate; // sale token listing price on pancakeswap
        uint256 startblock;
        uint256 endblock;
        uint256 lockPeriod;
        uint256 pancakeListingTime;
    }

    constructor() public {
        PRESALE_FACTORY = IPresaleFactory(
            0x93493d415FB07B503ac7545cd40B8c22712d97f8
        );
        PRESALE_SETTINGS = IPresaleSettings(
            0x3Ad3888bBdA20F3CaE736662263fE836d7a23277
        );
    }

    /**
     * @notice Creates a new Presale contract and registers it in the PresaleFactory.sol.
     */
    function createPresale(
        address payable _presaleOwner,
        IBEP20 _presaleToken,
        IBEP20 _baseToken,
        address[] memory white_list,
        uint256[12] memory uint_params
    ) public payable {
        PresaleParams memory params;
        params.amount = uint_params[0];
        params.tokenPrice = uint_params[1];
        params.maxSpendPerBuyer = uint_params[2];
        params.minSpendPerBuyer = uint_params[3];
        params.hardcap = uint_params[4];
        params.softcap = uint_params[5];
        params.liquidityPercent = uint_params[6];
        params.listingRate = uint_params[7];
        params.startblock = uint_params[8];
        params.endblock = uint_params[9];
        params.lockPeriod = uint_params[10];
        params.pancakeListingTime = uint_params[11];

        if (params.lockPeriod < 4 weeks) {
            params.lockPeriod = 4 weeks;
        }

        require(params.pancakeListingTime > params.endblock, "INVALID PANCAKE LISTING TIME");
        // Charge ETH fee for contract creation
        require(
            msg.value == PRESALE_SETTINGS.getEthCreationFee(),
            "FEE NOT MET"
        );
        if (msg.value > 0)
            PRESALE_SETTINGS.getEthAddress().transfer(
                PRESALE_SETTINGS.getEthCreationFee()
            );

        require(params.amount >= 10000, "MIN DIVIS"); // minimum divisibility
        require(params.tokenPrice.mul(params.hardcap) > 0, "INVALID PARAMS"); // ensure no overflow for future calculations
        require(
            params.liquidityPercent >= 300 && params.liquidityPercent <= 1000,
            "MIN LIQUIDITY"
        ); // 30% minimum liquidity lock
        uint256 tokensRequiredForPresale = PresaleHelper
            .calculateAmountRequired(
            params.amount,
            params.tokenPrice,
            params.listingRate,
            params.liquidityPercent,
            PRESALE_SETTINGS.getTokenFee()
        );

        Presale01 newPresale = new Presale01(address(this));
        TransferHelper.safeTransferFrom(
            address(_presaleToken),
            address(msg.sender),
            address(newPresale),
            tokensRequiredForPresale
        );
        newPresale.init1(
            _presaleOwner,
            params.amount,
            params.tokenPrice,
            params.maxSpendPerBuyer,
            params.minSpendPerBuyer,
            params.hardcap,
            params.softcap,
            params.liquidityPercent,
            params.listingRate,
            params.startblock,
            params.endblock,
            params.lockPeriod
        );
        newPresale.init2(
            _baseToken,
            _presaleToken,
            PRESALE_SETTINGS.getBaseFee(),
            PRESALE_SETTINGS.getTokenFee(),
            params.pancakeListingTime,
            PRESALE_SETTINGS.getEthAddress(),
            PRESALE_SETTINGS.getTokenAddress()
        );
        newPresale.init3(white_list);
        PRESALE_FACTORY.registerPresale(address(newPresale));
    }
}

