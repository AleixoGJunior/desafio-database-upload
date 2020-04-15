import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

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
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Transaction refused! Insufficient balance.');
    }

    let categoryToAdd = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryToAdd) {
      categoryToAdd = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(categoryToAdd);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryToAdd.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
