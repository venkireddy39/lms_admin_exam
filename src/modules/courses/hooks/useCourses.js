
import { useState } from 'react';
import { INITIAL_FORM_DATA } from '../constants/courseConstants';
import { validateCourseForm } from '../utils/validators';

export const useCourses = () => {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                img: file,
                imgPreview: URL.createObjectURL(file)
            }));
        }
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
        setEditIndex(null);
        setStep(1);
    };

    const openModal = (index = null) => {
        if (index !== null) {
            const c = courses[index];
            setFormData({
                name: c.name,
                desc: c.desc,
                price: c.price,
                trainer: c.trainer,
                courseType: c.courseType,
                mentorName: c.mentorName,
                mentorId: c.mentorId,
                mentorPhone: c.mentorPhone,
                img: null,
                imgPreview: c.img
            });
            setEditIndex(index);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSave = () => {
        // Validation check
        const errors = validateCourseForm(formData);
        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        const imgURL = formData.img ? URL.createObjectURL(formData.img) : formData.imgPreview;

        const newCourse = {
            ...formData,
            img: imgURL
        };

        if (editIndex !== null) {
            setCourses(courses.map((c, i) => (i === editIndex ? newCourse : c)));
        } else {
            setCourses([...courses, newCourse]);
        }

        setShowModal(false);
        resetForm();
    };

    const handleDelete = (index) => {
        if (window.confirm("Delete this course?")) {
            setCourses(courses.filter((_, i) => i !== index));
        }
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
        editIndex
    };
};
