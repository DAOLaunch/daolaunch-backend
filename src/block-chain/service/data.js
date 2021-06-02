'use strict';

import Web3 from 'web3';
import contracts from './compile';
import { PROVIDERS } from '../../utils/constants';


export default {
    getWeb3Instance: (abi, network_id) => {
        const provider = PROVIDERS[network_id] || 0;
        if (provider === 0) throw new Error('INVALID_NEWORK_ID');

        const web3Instance = new Web3(Web3.givenProvider || provider);
        return new web3Instance.eth.Contract(abi);
    },

    getData: async (instance, data, params, from) => {
        const result = instance.deploy({ data, arguments: params });

        return {
            data: result.encodeABI(),
            gas: await result.estimateGas({ from }),
        };
    },

    getERC20Data: async function (params, network_id, from) {
        return await this.getData(this.getWeb3Instance(contracts.getERC20Interface(), network_id), contracts.getERC20Bytecode(), params, from);
    },

    getBEP20Data: async function (params, network_id, from) {
        return await this.getData(this.getWeb3Instance(contracts.getBEP20Interface(), network_id), contracts.getBEP20Bytecode(), params, from);
    }
}