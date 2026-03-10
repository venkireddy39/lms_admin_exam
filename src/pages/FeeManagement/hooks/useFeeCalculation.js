import { useMemo } from 'react';

export const useFeeCalculation = (configuringStudent, configuringBatch, adminDiscount, additionalDiscount, advancePaid, modalGST) => {
    
    const totals = useMemo(() => {
        const base = Number(configuringStudent?.totalFee || configuringBatch?.standardFee || 0);
        const adminDisc = Number(adminDiscount || 0);
        const addDisc = Number(additionalDiscount || 0);
        const advance = Number(advancePaid || 0);
        const gstRate = Number(modalGST || 0);

        const totalDiscount = adminDisc + addDisc;
        const netAfterDiscount = Math.max(0, base - totalDiscount);
        const gstAmount = Number(((netAfterDiscount * gstRate) / 100).toFixed(2));
        const totalPayable = Number((netAfterDiscount + gstAmount).toFixed(2));
        const remainingToSplit = Math.max(0, totalPayable - advance);

        return {
            base,
            adminDisc,
            addDisc,
            totalDiscount,
            netAfterDiscount,
            gstAmount,
            totalPayable,
            advance,
            remainingToSplit
        };
    }, [configuringStudent, configuringBatch, adminDiscount, additionalDiscount, advancePaid, modalGST]);

    const calculateTotalsSync = (overrides = {}) => {
        const base = overrides.base !== undefined ? overrides.base : Number(configuringStudent?.totalFee || configuringBatch?.standardFee || 0);
        const adminDisc = overrides.adminDisc !== undefined ? overrides.adminDisc : Number(adminDiscount || 0);
        const addDisc = overrides.addDisc !== undefined ? overrides.addDisc : Number(additionalDiscount || 0);
        const advance = overrides.advance !== undefined ? overrides.advance : Number(advancePaid || 0);
        const gst = overrides.gst !== undefined ? overrides.gst : Number(modalGST || 0);

        const totalDiscount = adminDisc + addDisc;
        const netAfterDiscount = Math.max(0, base - totalDiscount);
        const gstAmount = Number(((netAfterDiscount * gst) / 100).toFixed(2));
        const totalPayable = Number((netAfterDiscount + gstAmount).toFixed(2));
        const remainingToSplit = Math.max(0, totalPayable - advance);

        return {
            base,
            adminDisc,
            addDisc,
            totalDiscount,
            netAfterDiscount,
            gstAmount,
            totalPayable,
            advance,
            remainingToSplit
        };
    };

    return { totals, calculateTotalsSync };
};
