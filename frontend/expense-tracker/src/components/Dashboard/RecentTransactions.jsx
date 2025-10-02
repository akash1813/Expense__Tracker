import React from 'react';
import { LuArrowRight } from 'react-icons/lu';
import moment from 'moment';
import TransactionInfoCard from '../Cards/TransactionInfoCard';
import { addThousandsSeperator } from '../../utils/helper';
import { FiDollarSign, FiCreditCard, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const RecentTransactions = ({transactions,  onSeeMore}) => {
  return (
    <div className='card'>

        <div className='flex items-center justify-between '>
            <h5 className='text-lg'>Recent Transactions</h5>
            <button className='card-btn' onClick={onSeeMore}>
                See All <LuArrowRight className='text-base'/>
            </button>
        </div>

        <div className='mt-6'>
            {transactions?.slice(0,5)?.map((item) => (
                <TransactionInfoCard
                  key={item.id}
                  title={item.name}
                  icon={item.icon || (item.type === 'income' ? '💰' : '💸')}
                  date={moment(item.date).format("Do MMM YYYY")}
                  amount={addThousandsSeperator(item.amount)}
                  type={item.type}
                  hideDeleteBtn
                />
            ))}
        </div>

    </div>
  )
}

export default RecentTransactions