import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findCategorySameTitle(title: string): Promise<Category | null> {
    const foundCategory = await this.findOne({
      where: { title },
    });

    return foundCategory || null;
  }
}

export default CategoriesRepository;
