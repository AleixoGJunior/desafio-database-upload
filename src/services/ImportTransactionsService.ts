import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  public async execute({ filename }: Request): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);

    const transactions: Transaction[] = [];
    const createTransaction = new CreateTransactionService();

    const fileStream = fs.createReadStream(filePath);
    const csvStream = csvParse({ delimiter: ',', columns: true, trim: true })
      .on('data', async data => {
        const [title, type, value, category] = data;
        const transaction = await createTransaction.execute({
          title,
          type,
          value,
          category,
        });
        transactions.push(transaction);
      })
      .on('end', () => {
        fs.promises.unlink(filePath);
      });

    fileStream.pipe(csvStream);

    return transactions;
  }
}

export default ImportTransactionsService;
