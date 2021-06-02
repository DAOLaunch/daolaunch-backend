import { Repository } from './Repository'
import { Sale } from '../models/schema/sale.model';

class SaleRepository extends Repository {
  constructor() {
    super(Sale);
  }
}

export { SaleRepository };
