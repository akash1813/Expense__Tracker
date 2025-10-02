import React from 'react'

const Modal = ({ children, isOpen, onClose, title }) => {

    if(!isOpen)
        return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[1px] overflow-y-auto'>
            <div className='relative w-full max-w-md mx-auto animate-[fadeIn_0.12s_ease-out] my-8'>
                <div className='relative rounded-2xl shadow-xl border border-slate-200 bg-white max-h-[90vh] overflow-y-auto'>
                    <div className='sticky top-0 z-10 bg-white flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 rounded-t-2xl'>
                        <h3 className='text-base sm:text-lg font-semibold text-slate-800'>{title}</h3>
                        <button
                            type="button"
                            className='text-slate-400 hover:text-slate-600 rounded-full w-8 h-8 inline-flex items-center justify-center hover:bg-slate-100 transition'
                            onClick={onClose}
                            aria-label='Close'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </button>
                    </div>
                    <div className='p-4 sm:p-6'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal