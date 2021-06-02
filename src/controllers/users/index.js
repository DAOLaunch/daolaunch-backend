import { ProjectController } from './project.controller';
import { TokenController } from './token.controller';
import { WalletController } from './wallet.controller';
import { NetworkController } from './network.controller';
import { PresaleController } from './presale.controller';
import { ExchangeController } from './exchange.controller';

const prefix = 'user';

const controllers = [
  ProjectController,
  TokenController,
  WalletController,
  NetworkController,
  PresaleController,
  ExchangeController,
];

export {
  prefix,
  controllers,
}
