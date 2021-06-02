import { Repository } from './Repository'
import { Project } from '../models/schema/project.model';

class ProjectRepository extends Repository {
  constructor() {
    super(Project);
  }
}

export { ProjectRepository };
