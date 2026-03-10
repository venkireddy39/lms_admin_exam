import { useState } from 'react';
import { attendanceService } from '../services/attendanceService';

export const useCsvUpload = (selectedCourse, selectedBatch, selectedSessionId, selectedDate, students, refreshUploadJobs) => {
    const [uploadJob, setUploadJob] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const downloadTemplate = () => {
        const headers = ['studentId', 'status', 'remarks'];
        const rows = students.length > 0
            ? students.map(s => [s.studentId, 'PRESENT', ''])
            : [];

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_template_${selectedBatch || 'sample'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!['.csv', '.xls', '.xlsx'].includes(ext)) {
            alert('❌ Invalid File Type. Only .csv, .xls, and .xlsx files are allowed.');
            e.target.value = null;
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('❌ File too large. Max 5MB allowed.');
            e.target.value = null;
            return;
        }

        setIsUploading(true);
        try {
            const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
            const uploadedBy = authUser.id || 1;

            const job = await attendanceService.uploadCsvJob(
                selectedCourse,
                selectedBatch,
                selectedSessionId,
                selectedDate,
                uploadedBy,
                file
            );

            setUploadJob(job);
            refreshUploadJobs();

            if (window.confirm(`File uploaded successfully (ID: ${job.id}). Do you want to apply this data now?`)) {
                await handleProcessJob(job.id);
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert(`❌ Upload failed: ${err.message}`);
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    const handleProcessJob = async (jobId) => {
        setIsUploading(true);
        try {
            await attendanceService.processCsvJob(jobId);
            alert("✅ Data applied to database successfully.");
            refreshUploadJobs();
            // We could potentially update current uploadJob here if needed
        } catch (err) {
            console.error("Processing failed", err);
            alert(`❌ Application failed: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadJob, setUploadJob, isUploading, downloadTemplate, handleFileUpload, handleProcessJob };
};
