export const calculateStatus = (student) => {
    const total = student.totalFee || 0;
    const paid = student.paidAmount || 0;
    const due = total - paid;

    let status = student.status ? student.status.toUpperCase() : 'PENDING';

    if (!student.status) {
        if (paid === 0) status = 'PENDING';
        else if (paid < total) status = 'PARTIAL';
        else if (paid >= total) status = 'PAID';
    }

    return { total, paid, due, status };
};
