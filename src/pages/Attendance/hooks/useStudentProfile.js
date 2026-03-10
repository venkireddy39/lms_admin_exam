import { useState, useEffect } from 'react';
import { userService } from '../../Users/services/userService';

const useStudentProfile = (student) => {
    const [extendedDetails, setExtendedDetails] = useState(null);

    useEffect(() => {
        if (!student) return;

        const sid = student.studentId || student.id;
        if (sid) {
            userService.getStudentById(sid)
                .then(data => {
                    const userData = data?.user || data;
                    setExtendedDetails(prev => ({
                        ...prev,
                        email: userData?.email,
                        phone: userData?.phone || userData?.mobile || userData?.phoneNumber,
                        enrolledDate: data?.enrolledDate || data?.createdAt || data?.joinDate
                    }));
                })
                .catch(() => {
                    const uid = student.userId || student.uid;
                    if (uid) {
                        userService.getUserById(uid)
                            .then(data => {
                                setExtendedDetails(prev => ({
                                    ...prev,
                                    email: data?.email,
                                    phone: data?.phone || data?.mobile
                                }));
                            })
                            .catch(() => { });
                    }
                });
        }

        const bid = student.batchId || student.studentBatchId;
        if (bid) {
            import('../../Batches/services/batchService').then(({ batchService }) => {
                batchService.getBatchById(bid)
                    .then(batch => setExtendedDetails(prev => ({
                        ...prev,
                        batchName: batch.batchName,
                        courseName: batch.courseName
                    })))
                    .catch(() => { });
            });
        }
    }, [student]);

    const studentInfo = {
        email: extendedDetails?.email || student.email || student.studentEmail || 'No email provided',
        phone: extendedDetails?.phone || extendedDetails?.mobile || extendedDetails?.phoneNumber || extendedDetails?.contact || student.phone || student.contact || 'N/A',
        course: extendedDetails?.courseName || student.courseName || student.batchName || "N/A",
        enrolled: extendedDetails?.enrolledDate || student.enrolledDate || student.joinDate
    };

    return { extendedDetails, studentInfo };
};

export default useStudentProfile;
