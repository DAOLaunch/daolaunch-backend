import { Repository } from './Repository'
import { Token } from '../models/schema/token.model';

class TokenRepository extends Repository {
  constructor() {
    super(Token);
  }
}

export { TokenRepository };
