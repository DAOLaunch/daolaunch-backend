import { Repository } from './Repository'
import { Presale } from '../models/schema/presale.model';

class PresaleRepository extends Repository {
  constructor() {
    super(Presale);
  }
}

export { PresaleRepository };
