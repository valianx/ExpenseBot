import { Repository } from 'typeorm';
import { Expense } from '../entity/Expense';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BotRepository {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async save(expense: Expense): Promise<Expense> {
    return this.expenseRepository.save(expense);
  }
}
