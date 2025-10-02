import React from 'react';
import { LuArrowRight } from 'react-icons/lu';
import TransactionInfoCard from '../Cards/TransactionInfoCard';
import moment from 'moment';
import { addThousandsSeperator } from '../../utils/helper';

const ExpenseTransactions = ({ transactions = [], onSeeMore }) => {
  const displayedTransactions = transactions.slice(0, 5);

  return (
    <div className='card'>
      <div className='flex items-center justify-between'>
            <h5 className='text-lg'>Recent Expenses</h5>
            <button 
              className='card-btn flex items-center gap-1'
              onClick={(e) => {
                e.preventDefault();
                onSeeMore && onSeeMore('/expense');
              }}
            >
              See All <LuArrowRight className='text-base' />
            </button>
      </div>
      
      <div className='mt-6 space-y-4'>
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map((expense) => (
            <TransactionInfoCard
              key={expense._id || expense.id || Math.random().toString(36).substr(2, 9)}
              title={expense.category || 'Uncategorized'}
              icon={expense.icon || '💰'}
              date={expense.date ? moment(expense.date).format("Do MMM YYYY") : 'No date'}
              amount={addThousandsSeperator(expense.amount || 0)}
              type="expense"
              hideDeleteBtn
            />  
          ))
        ) : (
          <div className='text-center py-4 text-gray-500'>
            No recent expenses found
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTransactions;