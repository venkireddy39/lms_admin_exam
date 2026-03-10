import { useState, useEffect } from 'react';
import { INITIAL_FORM_DATA } from '../constants/courseConstants';
import { courseService } from '../services/courseService';

export const useCourses = () => {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [currentCourseId, setCurrentCourseId] = useState(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    // ──────────────────────────────────────────
    // Load on mount
    // ──────────────────────────────────────────
    useEffect(() => {
        loadCourses();
    }, []);

    // ──────────────────────────────────────────
    // Image URL helper (strips hard-coded LAN IPs)
    // ──────────────────────────────────────────
    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.includes('192.168.')) {
            const rel = url.replace(/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?/, '');
            return rel.startsWith('/') ? rel : `/${rel}`;
        }
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
        return `${url.startsWith('/') ? '' : '/'}${url}`;
    };

    // ──────────────────────────────────────────
    // Map backend → frontend model
    // Backend field          Frontend field
    // courseId           →   id
    // courseName         →   name  (also kept as courseName)
    // description        →   description
    // duration           →   duration
    // toolsCovered       →   toolsCovered
    // courseFee          →   courseFee
    // courseImageUrl     →   img  (display URL)
    // certificateProvided→   certificateProvided
    // showValidity       →   showValidity
    // validityInDays     →   validityInDays
    // allowOfflineMobile →   allowOfflineMobile
    // allowBookmark      →   allowBookmark
    // status             →   status
    // shareCode          →   shareCode
    // shareLink          →   shareLink
    // shareEnabled       →   shareEnabled
    // ──────────────────────────────────────────
    const mapCourseFromBackend = (c) => ({
        id: c.courseId,
        name: c.courseName,
        courseName: c.courseName,
        description: c.description || '',
        duration: c.duration || '',
        toolsCovered: c.toolsCovered || '',
        courseFee: c.courseFee ?? 0,
        img: getFullImageUrl(c.courseImageUrl) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
        certificateProvided: c.certificateProvided ?? false,
        showValidity: c.showValidity ?? false,
        validityInDays: c.validityInDays ?? '',
        allowOfflineMobile: c.allowOfflineMobile ?? false,
        allowBookmark: c.allowBookmark ?? false,
        status: c.status || 'ACTIVE',
        shareCode: c.shareCode || null,
        shareLink: c.shareLink || null,
        shareEnabled: c.shareEnabled !== false,
    });

    const loadCourses = async () => {
        try {
            const data = await courseService.getCourses();
            setCourses(data.map(mapCourseFromBackend));
        } catch (error) {
            console.error('Failed to load courses', error);
        }
    };

    // ──────────────────────────────────────────
    // Form handlers
    // ──────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        // Custom toggle type from Toggle component
        if (type === 'toggle') {
            setFormData(prev => ({ ...prev, [name]: value }));
            return;
        }

        // Boolean radio fields
        let val = value;
        if (value === 'true') val = true;
        else if (value === 'false') val = false;

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                img: file,
                imgPreview: URL.createObjectURL(file),
            }));
        }
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
        setCurrentCourseId(null);
        setEditIndex(null);
        setStep(1);
    };

    // ──────────────────────────────────────────
    // Open modal (create or edit)
    // ──────────────────────────────────────────
    const openModal = (courseId = null) => {
        if (courseId !== null) {
            const c = courses.find(course => course.id === courseId);
            if (!c) return;

            setCurrentCourseId(c.id);
            setEditIndex(courses.findIndex(x => x.id === courseId));

            // Populate form with entity-aligned fields
            setFormData({
                courseName: c.courseName || c.name || '',
                description: c.description || '',
                duration: c.duration || '',
                toolsCovered: c.toolsCovered || '',
                courseFee: c.courseFee ?? '',
                img: null,
                imgPreview: c.img || null,
                certificateProvided: c.certificateProvided ?? false,
                showValidity: c.showValidity ?? false,
                validityInDays: c.validityInDays ?? '',
                allowOfflineMobile: c.allowOfflineMobile ?? false,
                allowBookmark: c.allowBookmark ?? false,
                status: c.status || 'ACTIVE',
                shareEnabled: c.shareEnabled !== false,
                shareCode: c.shareCode || null,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    // ──────────────────────────────────────────
    // Save (create or update)
    // ──────────────────────────────────────────
    const handleSave = async () => {
        const fee = formData.courseFee ? parseFloat(formData.courseFee) : 0.0;
        const validity = (formData.showValidity && formData.validityInDays)
            ? parseInt(formData.validityInDays)
            : null;

        // Build clean payload — precisely matching the external API fields (8 total)
        const payload = {
            courseName: (formData.courseName || '').trim() || 'Untitled Course',
            description: formData.description || '',
            duration: formData.duration || 'Self Paced',
            toolsCovered: formData.toolsCovered || '',
            courseFee: fee,
            certificateProvided: formData.certificateProvided === true,
            showValidity: formData.showValidity === true,
            validityInDays: validity,
        };

        // If editing with no new file, preserve existing image URL
        if (currentCourseId && !formData.img && formData.imgPreview) {
            payload.courseImageUrl = formData.imgPreview;
        }

        try {
            let savedCourse;
            if (currentCourseId) {
                savedCourse = await courseService.updateCourse(currentCourseId, payload);
            } else {
                savedCourse = await courseService.createCourse(payload);
            }

            // Upload image if a new file was selected
            if (formData.img) {
                const targetId = savedCourse?.courseId || currentCourseId;
                if (targetId) {
                    await courseService.uploadCourseImage(targetId, formData.img);
                }
            }

            await loadCourses();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Save failed', error);
            throw error; // Let modal display the error
        }
    };

    // ──────────────────────────────────────────
    // Status toggle
    // ──────────────────────────────────────────
    const toggleCourseStatus = async (id, status) => {
        try {
            await courseService.updateCourseStatus(id, status);
            setCourses(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update course status');
        }
    };

    // ──────────────────────────────────────────
    // Delete (soft disable)
    // ──────────────────────────────────────────
    const handleDelete = async (id) => {
        const c = courses.find(course => course.id === id);
        if (!c) return;

        if (window.confirm(`Disable "${c.name}"?\n(Contact admin for permanent deletion)`)) {
            try {
                await toggleCourseStatus(c.id, 'DISABLED');
            } catch (error) {
                console.error('Disable failed', error);
                alert('Failed to disable course.');
            }
        }
    };

    // ──────────────────────────────────────────
    // Bookmark toggle (local only)
    // ──────────────────────────────────────────
    const toggleBookmark = (courseId) => {
        setCourses(prev => prev.map(course =>
            course.id === courseId
                ? { ...course, isBookmarked: !course.isBookmarked }
                : course
        ));
    };

    return {
        courses,
        showModal,
        setShowModal,
        openModal,
        handleDelete,
        handleSave,
        handleInputChange,
        handleImageChange,
        formData,
        step,
        setStep,
        editIndex,
        setFormData,
        toggleBookmark,
        toggleCourseStatus,
    };
};
