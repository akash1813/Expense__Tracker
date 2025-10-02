import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard';
import moment from 'moment';
import { addThousandsSeperator } from '../../utils/helper';

const RecentIncome = ({ transactions = [], onSeeMore }) => {
  // Ensure transactions is an array and has items
  const hasTransactions = Array.isArray(transactions) && transactions.length > 0;

  return (
    <div className='card'>
        <div className='flex items-center justify-between'>
            <h5 className='text-lg'>Income</h5>

            <button className='card-btn' onClick={onSeeMore}>
                See All <LuArrowRight className='text-base' /> 
            </button>
        </div>

        <div className='mt-6'>
            {hasTransactions ? (
                transactions.slice(0, 5).map((item) => (
                    <TransactionInfoCard
                        key={item._id || `income-${Math.random().toString(36).substr(2, 9)}`}
                        title={item.source || 'Income'}
                        icon={item.icon || '💵'}
                        date={item.date ? moment(item.date).format("Do MMM YYYY") : 'No date'}
                        amount={addThousandsSeperator(Number(item.amount) || 0)}
                        type="income"
                        hideDeleteBtn
                    />
                ))
            ) : (
                <div className="text-center py-4 text-gray-500">
                    No income transactions found
                </div>
            )}
        </div>

    </div>
  );
}

export default RecentIncome