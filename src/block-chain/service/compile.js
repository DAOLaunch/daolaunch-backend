'use strict';

const fs = require('fs');
const solc = require('solc');
const path = require('path');

const input = {
    language: 'Solidity',
    sources: {
		'common/Context.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/Context.sol')).toString()
		},
		'common/Ownable.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/Ownable.sol')).toString()
		},
		'common/SafeMath.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/SafeMath.sol')).toString()
		},
        'common/EnumerableSet.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/EnumerableSet.sol')).toString()
		},
        'common/ReentrancyGuard.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/ReentrancyGuard.sol')).toString()
		},
        'common/TransferHelper.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/TransferHelper.sol')).toString()
		},
		'ERC20.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/ethereum/ERC20.sol')).toString()
		},
		'IERC20.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/ethereum/IERC20.sol')).toString()
		},
		'BEP20.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/binance-smart-chain/BEP20.sol')).toString()
        },
        'IBEP20.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/binance-smart-chain/IBEP20.sol')).toString()
		},
		'Presale01.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/ethereum/Presale01.sol')).toString()
		},
        'common/PresaleFactory.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/PresaleFactory.sol')).toString()
		},
        'PresaleGenerator01.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/ethereum/PresaleGenerator01.sol')).toString()
		},
        'common/PresaleHelper.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/PresaleHelper.sol')).toString()
		},
        'PresaleLockForwarder.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/ethereum/PresaleLockForwarder.sol')).toString()
		},
        'common/PresaleSettings.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/PresaleSettings.sol')).toString()
		},
        'UniswapV2Locker.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/ethereum/UniswapV2Locker.sol')).toString()
        },
        'common/PresaleBSCSettings.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/common/PresaleBSCSettings.sol')).toString()
        },
        'BSCPresale01.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/binance-smart-chain/BSCPresale01.sol')).toString()
        },
        'BSCPresaleGenerator01.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/binance-smart-chain/BSCPresaleGenerator01.sol')).toString()
        },
        'BSCPresaleLockForwarder.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/binance-smart-chain/BSCPresaleLockForwarder.sol')).toString()
        },
        'PancakeSwapLocker.sol': {
			content: fs.readFileSync(path.join(__dirname, '../../../smart-contract/binance-smart-chain/PancakeSwapLocker.sol')).toString()
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        },
        optimizer: {
            enabled: true
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

class Compile {

    getERC20Interface() {
        try {
            return output.contracts['ERC20.sol']['ERC20'].abi;
        } catch (err) {
            console.log({ err });
            return "Cannot get interface";
        }
    }

    getERC20Bytecode() {
        try {
            return output.contracts['ERC20.sol']['ERC20'].evm.bytecode.object;
        } catch (err) {            
            return "Cannot get bytecode";
        }
	}
	
	getBEP20Interface() {
        try {
            return output.contracts['BEP20.sol']['BEP20'].abi;
        } catch (err) {
            return "Cannot get interface";
        }
    }

    getBEP20Bytecode() {
        try {
            return output.contracts['BEP20.sol']['BEP20'].evm.bytecode.object;
        } catch (err) {
            return "Cannot get bytecode";
        }
    }

    getPresaleInterface() {
        try {
            return output.contracts['Presale01.sol']['Presale01'].abi;
        } catch (err) {
            return "Cannot get interface";
        }
    }

    getPresaleBytecode() {
        try {
            return output.contracts['Presale01.sol']['Presale01'].evm.bytecode.object;
        } catch (err) {
            return "Cannot get bytecode";
        }
    }

    getPresaleSettingsInterface() {
        try {
            return output.contracts['PresaleSettings.sol']['PresaleSettings'].abi;
        } catch (err) {
            return "Cannot get interface";
        }
    }

    getPresaleSettingsBytecode() {
        try {
            return output.contracts['PresaleSettings.sol']['PresaleSettings'].evm.bytecode.object;
        } catch (err) {
            return "Cannot get bytecode";
        }
    }

    getPresaleGeneratorInterface() {
        try {
            return output.contracts['PresaleGenerator01.sol']['PresaleGenerator01'].abi;
        } catch (err) {
            return "Cannot get interface";
        }
    }

    getPresaleGeneratorBytecode() {
        try {
            return output.contracts['PresaleGenerator01.sol']['PresaleGenerator01'].evm.bytecode.object;
        } catch (err) {
            return "Cannot get bytecode";
        }
    }

    getPresaleLockForwarderInterface() {
        try {
            return output.contracts['PresaleLockForwarder.sol']['PresaleLockForwarder'].abi;
        } catch (err) {
            return "Cannot get interface";
        }
    }

    getPresaleLockForwarderBytecode() {
        try {
            return output.contracts['PresaleLockForwarder.sol']['PresaleLockForwarder'].evm.bytecode.object;
        } catch (err) {
            return "Cannot get bytecode";
        }
    }

    getUniswapV2LockerInterface() {
        try {
            return output.contracts['UniswapV2Locker.sol']['UniswapV2Locker'].abi;
        } catch (err) {
            return "Cannot get interface";
        }
    }

    getUniswapV2LockerBytecode() {
        try {
            return output.contracts['UniswapV2Locker.sol']['UniswapV2Locker'].evm.bytecode.object;
        } catch (err) {
            return "Cannot get bytecode";
        }
    }

    getPresaleFactoryInterface() {
        try {
            return output.contracts['common/PresaleFactory.sol']['PresaleFactory'].abi;
        } catch (err) {
            return "Cannot get interface";
        }
    }
}

module.exports = new Compile();
