import { useState, useMemo } from 'react';

/**
 * Hook to manage real-time fee calculations for both configuration and student views.
 */
export function useFeeCalculation(initialTotalFee = 0) {
    const [totalFee, setTotalFee] = useState(initialTotalFee);
    const [installments, setInstallments] = useState([]);

    // Calculate total explicitly allocated so far
    const allocatedAmount = useMemo(() => {
        return installments.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
    }, [installments]);

    const remainingToAllocate = Math.max(0, totalFee - allocatedAmount);

    // Status flag: exactly allocated?
    const isFullyAllocated = totalFee > 0 && Math.abs(totalFee - allocatedAmount) < 0.01;

    // --- Installment Actions ---

    const addInstallment = () => {
        setInstallments([
            ...installments,
            { id: Date.now().toString(), name: `Term ${installments.length + 1}`, dueDate: '', amount: remainingToAllocate }
        ]);
    };

    const updateInstallment = (id, field, value) => {
        setInstallments(prevInstallments => {
            let updated = prevInstallments.map(inst => {
                if (inst.id === id) {
                    if (field === 'amount' && Number(value) < 0) value = 0;
                    return { ...inst, [field]: value };
                }
                return inst;
            });

            // Auto-fill dates logic: if a date is set, cascade +1 month to subsequent empty dates
            if (field === 'dueDate' && value) {
                const changedIndex = prevInstallments.findIndex(inst => inst.id === id);
                if (changedIndex !== -1) {
                    let currentDate = new Date(value);
                    for (let i = changedIndex + 1; i < updated.length; i++) {
                        // Only auto-fill if the subsequent date is empty or was identical to the old date cascade
                        if (!updated[i].dueDate || updated[i].dueDate === prevInstallments[i].dueDate) {
                            currentDate.setMonth(currentDate.getMonth() + 1);
                            updated[i] = { ...updated[i], dueDate: currentDate.toISOString().split('T')[0] };
                        }
                    }
                }
            }

            return updated;
        });
    };

    const removeInstallment = (id) => {
        setInstallments(installments.filter(inst => inst.id !== id));
    };

    const autoSplit = (count) => {
        if (!totalFee || count <= 0) return;

        const splitAmount = Math.floor((totalFee / count) * 100) / 100;
        let remainder = totalFee - (splitAmount * count);

        const newInstallments = Array.from({ length: count }).map((_, i) => ({
            id: Date.now().toString() + i,
            name: `Term ${i + 1}`,
            dueDate: '',
            // Dump the remainder into the first installment to avoid rounding loss
            amount: i === 0 ? Number((splitAmount + remainder).toFixed(2)) : splitAmount
        }));

        setInstallments(newInstallments);
    };

    return {
        totalFee,
        setTotalFee,
        installments,
        setInstallments,
        allocatedAmount,
        remainingToAllocate,
        isFullyAllocated,
        actions: {
            addInstallment,
            updateInstallment,
            removeInstallment,
            autoSplit
        }
    };
}
