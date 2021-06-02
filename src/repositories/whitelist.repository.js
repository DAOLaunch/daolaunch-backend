import { Repository } from './Repository'
import { Whitelist } from '../models/schema/whitelist.model';

class WhitelistRepository extends Repository {
  constructor() {
    super(Whitelist);
  }
}

export { WhitelistRepository };
