export const STATUS = {
    PAID: 0,
    AWAITING_PAYMENT: 1,
    PARTIALLY_PAID: 2
};

export const STATUS_LABELS = {
    [STATUS.PAID]: 'Ödendi',
    [STATUS.AWAITING_PAYMENT]: 'Ödeme Bekliyor',
    [STATUS.PARTIALLY_PAID]: 'Kısmi Ödendi'
};

export const STATUS_COLORS = {
    [STATUS.PAID]: 'bg-green-100 text-green-800',
    [STATUS.AWAITING_PAYMENT]: 'bg-blue-100 text-blue-800',
    [STATUS.PARTIALLY_PAID]: 'bg-yellow-100 text-yellow-800'
};

/**
 * @param {number} paidAmount 
 * @param {number} remainingAmount 
 * @returns {number} 
 */
export const calculateStatus = (paidAmount, remainingAmount) => {
    if (remainingAmount === 0) {
        return STATUS.PAID;
    } else if (paidAmount > 0 && remainingAmount > 0) {
        return STATUS.PARTIALLY_PAID;
    }
    return STATUS.AWAITING_PAYMENT;
};

/**
 * @param {number} status
 * @returns {Object}
 */
export const getStatusBadge = (status = STATUS.AWAITING_PAYMENT) => {
    return {
        label: STATUS_LABELS[status],
        color: STATUS_COLORS[status]
    };
};

