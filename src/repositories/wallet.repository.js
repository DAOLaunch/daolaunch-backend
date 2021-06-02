import { Repository } from './Repository'
import { Wallet } from '../models/schema/wallet.model';

class WalletRepository extends Repository {
  constructor() {
    super(Wallet);
  }
}

export { WalletRepository };
