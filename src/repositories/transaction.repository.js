import { Repository } from './Repository'
import { Transaction } from '../models/schema/transaction.model';

class TransactionRepository extends Repository {
  constructor() {
    super(Transaction);
  }
}

export { TransactionRepository };
