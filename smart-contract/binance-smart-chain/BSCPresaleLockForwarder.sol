// SPDX-License-Identifier: UNLICENSED
// ALL RIGHTS RESERVED

/**
    This contract creates the lock on behalf of each presale. This contract will be whitelisted to bypass the flat rate
    ETH fee. Please do not use the below locking code in your own contracts as the lock will fail without the ETH fee
*/

pragma solidity 0.6.12;

import "../common/Ownable.sol";
import "../common/TransferHelper.sol";
import "./IBEP20.sol";

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

interface IPancakeFactory {
    function getPair(address tokenA, address tokenB)
        external
        view
        returns (address pair);

    function createPair(address tokenA, address tokenB)
        external
        returns (address pair);
}

interface IPancakePair {
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Transfer(address indexed from, address indexed to, uint256 value);

    function name() external pure returns (string memory);

    function symbol() external pure returns (string memory);

    function decimals() external pure returns (uint8);

    function totalSupply() external view returns (uint256);

    function balanceOf(address owner) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    function PERMIT_TYPEHASH() external pure returns (bytes32);

    function nonces(address owner) external view returns (uint256);

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(
        address indexed sender,
        uint256 amount0,
        uint256 amount1,
        address indexed to
    );
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    function MINIMUM_LIQUIDITY() external pure returns (uint256);

    function factory() external view returns (address);

    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves()
        external
        view
        returns (
            uint112 reserve0,
            uint112 reserve1,
            uint32 blockTimestampLast
        );

    function price0CumulativeLast() external view returns (uint256);

    function price1CumulativeLast() external view returns (uint256);

    function kLast() external view returns (uint256);

    function mint(address to) external returns (uint256 liquidity);

    function burn(address to)
        external
        returns (uint256 amount0, uint256 amount1);

    function swap(
        uint256 amount0Out,
        uint256 amount1Out,
        address to,
        bytes calldata data
    ) external;

    function skim(address to) external;

    function sync() external;

    function initialize(address, address) external;
}

contract PresaleLockForwarder is Ownable {
    IPresaleFactory public PRESALE_FACTORY;
    IPancakeLocker public UNICRYPT_LOCKER;
    IPancakeFactory public PANCAKE_FACTORY;

    constructor() public {
        PRESALE_FACTORY = IPresaleFactory(
            0xb3D71b568ED5f64D6E02bD65C290906e7f8A72f9
        );
        UNICRYPT_LOCKER = IPancakeLocker(
            0x8164fb2916C9ae9f3CCa90fad6d80AaEa007D048
        );
        PANCAKE_FACTORY = IPancakeFactory(
            0x6725F303b657a9451d8BA641348b6761A6CC7a17
        );
    }

    /**
        Send in _token0 as the PRESALE token, _token1 as the BASE token (usually WETH) for the check to work. As anyone can create a pair,
        and send WETH to it while a presale is running, but no one should have access to the presale token. If they do and they send it to
        the pair, scewing the initial liquidity, this function will return true
    */
    function pancakePairIsInitialised(address _token0, address _token1)
        public
        view
        returns (bool)
    {
        address pairAddress = PANCAKE_FACTORY.getPair(_token0, _token1);
        if (pairAddress == address(0)) {
            return false;
        }
        uint256 balance = IBEP20(_token0).balanceOf(pairAddress);
        if (balance > 0) {
            return true;
        }
        return false;
    }

    function lockLiquidity(
        IBEP20 _baseToken,
        IBEP20 _saleToken,
        uint256 _baseAmount,
        uint256 _saleAmount,
        uint256 _unlock_date,
        address payable _withdrawer
    ) external {
        require(
            PRESALE_FACTORY.presaleIsRegistered(msg.sender),
            "PRESALE NOT REGISTERED"
        );
        address pair = PANCAKE_FACTORY.getPair(
            address(_baseToken),
            address(_saleToken)
        );
        if (pair == address(0)) {
            PANCAKE_FACTORY.createPair(
                address(_baseToken),
                address(_saleToken)
            );
            pair = PANCAKE_FACTORY.getPair(
                address(_baseToken),
                address(_saleToken)
            );
        }

        TransferHelper.safeTransferFrom(
            address(_baseToken),
            msg.sender,
            address(pair),
            _baseAmount
        );
        TransferHelper.safeTransferFrom(
            address(_saleToken),
            msg.sender,
            address(pair),
            _saleAmount
        );
        IPancakePair(pair).mint(address(this));
        uint256 totalLPTokensMinted = IPancakePair(pair).balanceOf(
            address(this)
        );
        require(totalLPTokensMinted != 0, "LP creation failed");

        TransferHelper.safeApprove(
            pair,
            address(UNICRYPT_LOCKER),
            totalLPTokensMinted
        );
        uint256 unlock_date = _unlock_date > 9999999999
            ? 9999999999
            : _unlock_date;
        UNICRYPT_LOCKER.lockLPToken(
            pair,
            totalLPTokensMinted,
            unlock_date,
            address(0),
            true,
            _withdrawer
        );
    }
}
