import { Repository } from './Repository'
import { Network } from '../models/schema/network.model';

class NetworkRepository extends Repository {
  constructor() {
    super(Network);
  }
}

export { NetworkRepository };
