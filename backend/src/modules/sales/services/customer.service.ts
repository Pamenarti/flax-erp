import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ 
      where: { id },
      relations: ['orders', 'invoices']
    });
    
    if (!customer) {
      throw new NotFoundException(`Müşteri #${id} bulunamadı`);
    }
    
    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    
    const updatedCustomer = {
      ...customer,
      ...updateCustomerDto,
    };
    
    return this.customerRepository.save(updatedCustomer);
  }

  async remove(id: string): Promise<void> {
    const result = await this.customerRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Müşteri #${id} bulunamadı`);
    }
  }
}
