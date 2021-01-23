import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid transaction type');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('You do not have enough balance');
    }

    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const existsCategory = await categoriesRepository.findCategorySameTitle(
      category,
    );

    if (existsCategory) {
      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: existsCategory.id,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    }
    // criar a categoria antes de salvar a transação
    const newCategory = categoriesRepository.create({
      title: category,
    });

    const { id } = await categoriesRepository.save(newCategory);

    // salvar a transação com o id da categoria nova gerada

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: id,
    });

    await transactionsRepository.save(transaction);

    return transaction;

    // Verifica se exite uma categoria com o mesmo, se exitir utiliza o id existe
    // caso não exista é criado uma nova  categoria
  }
}

export default CreateTransactionService;
