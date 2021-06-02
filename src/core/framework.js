import { s as projectScheme } from '../models/schema/project.model';
import { s as saleScheme } from '../models/schema/sale.model';
import { s as walletScheme } from '../models/schema/wallet.model';
import { s as networkScheme } from '../models/schema/network.model';
import { s as whitelistScheme } from '../models/schema/whitelist.model';
import { s as tokenScheme } from '../models/schema/token.model';
import { s as transactionScheme } from '../models/schema/transaction.model';
import { s as presaleScheme } from '../models/schema/presale.model';

const environments = ['LCL', 'PRO', 'STG', 'DEV'];

const services = {};

const schemas = {
  projectScheme,
  saleScheme,
  walletScheme,
  networkScheme,
  whitelistScheme,
  tokenScheme,
  transactionScheme,
  presaleScheme,
}

export {
  environments,
  services,
  schemas,
}
