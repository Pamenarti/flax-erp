import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credit } from './entities/credit.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { UseCreditsDto } from './dto/use-credits.dto';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Credit)
    private creditsRepository: Repository<Credit>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserCredits(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Kullanıcının toplam kredisini bul
    const creditRecord = await this.creditsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!creditRecord) {
      // Kullanıcı için kredi kaydı yoksa oluştur
      const newCredit = this.creditsRepository.create({
        user,
        amount: 0,
      });
      await this.creditsRepository.save(newCredit);
      return { amount: 0 };
    }

    return { amount: creditRecord.amount };
  }

  async purchaseCredits(userId: string, purchaseCreditsDto: PurchaseCreditsDto): Promise<any> {
    const { amount, paymentMethod } = purchaseCreditsDto;

    if (amount <= 0) {
      throw new BadRequestException('Kredi miktarı pozitif olmalıdır');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Kullanıcının mevcut kredi kaydını bul veya oluştur
    let creditRecord = await this.creditsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!creditRecord) {
      creditRecord = this.creditsRepository.create({
        user,
        amount: 0,
      });
    }

    // Krediyi artır
    creditRecord.amount += amount;
    await this.creditsRepository.save(creditRecord);

    // İşlem kaydı oluştur
    const transaction = this.transactionRepository.create({
      user,
      amount,
      type: 'credit_purchase',
      description: `${amount} kredi satın alındı (${paymentMethod})`,
    });
    await this.transactionRepository.save(transaction);

    return { success: true, newAmount: creditRecord.amount };
  }

  async useCredits(userId: string, useCreditsDto: UseCreditsDto): Promise<any> {
    const { amount, moduleId, description } = useCreditsDto;

    if (amount <= 0) {
      throw new BadRequestException('Kredi miktarı pozitif olmalıdır');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Kullanıcının kredi kaydını bul
    const creditRecord = await this.creditsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!creditRecord || creditRecord.amount < amount) {
      throw new BadRequestException('Yetersiz kredi bakiyesi');
    }

    // Krediyi azalt
    creditRecord.amount -= amount;
    await this.creditsRepository.save(creditRecord);

    // İşlem kaydı oluştur
    const transaction = this.transactionRepository.create({
      user,
      amount,
      module_id: moduleId,
      type: 'module_purchase',
      description: description || `${amount} kredi kullanıldı`,
    });
    await this.transactionRepository.save(transaction);

    return { success: true, remainingAmount: creditRecord.amount };
  }

  async getTransactionHistory(userId: string, page: number, limit: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getLastTransaction(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const transaction = await this.transactionRepository.findOne({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });

    if (!transaction) {
      return null;
    }

    return transaction;
  }

  async getCreditPackages(): Promise<any> {
    // Statik paketler listesi, gerçek uygulamada veritabanından gelebilir
    return [
      {
        id: 1,
        name: 'Başlangıç Paketi',
        credits: 100,
        price: 100,
        features: [
          'Tek seferlik modül alımı için uygun',
          'Anında kredi aktarımı',
          '1 ay geçerlilik süresi',
        ],
      },
      {
        id: 2,
        name: 'Standart Paket',
        credits: 500,
        price: 450,
        isBestValue: true,
        features: [
          '%10 indirimli paket',
          'Çoklu modül aktivasyonu için uygun',
          'Anında kredi aktarımı',
          '3 ay geçerlilik süresi',
        ],
      },
      {
        id: 3,
        name: 'Premium Paket',
        credits: 1000,
        price: 850,
        features: [
          '%15 indirimli paket',
          'Tüm modülleri kullanmak için ideal',
          'Anında kredi aktarımı',
          '6 ay geçerlilik süresi',
          '7/24 öncelikli destek',
        ],
      },
    ];
  }
}
