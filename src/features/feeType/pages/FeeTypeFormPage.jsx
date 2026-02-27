import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feeTypeService } from '../api';
import FormInput from '../../../components/common/FormInput';

const feeTypeSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    displayOrder: z.coerce.number().min(0, 'Must be a positive number'),
});

const FeeTypeFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(feeTypeSchema),
        defaultValues: {
            name: '',
            description: '',
            displayOrder: 0,
        },
    });

    useEffect(() => {
        if (isEditMode) {
            fetchFeeType();
        }
    }, [id]);

    const fetchFeeType = async () => {
        try {
            const response = await feeTypeService.getById(id);
            const data = response.data;
            setValue('name', data.name);
            setValue('description', data.description || '');
            setValue('displayOrder', data.displayOrder || 0);
        } catch (error) {
            toast.error('Failed to load fee type data');
            navigate('/admin/fee-types');
        }
    };

    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                await feeTypeService.update(id, data);
                toast.success('Fee type updated successfully');
            } else {
                await feeTypeService.create({ ...data, active: true });
                toast.success('Fee type created successfully');
            }
            navigate('/admin/fee-types');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error occurred while saving');
        }
    };

    return (
        <div className="container py-4 col-md-8 col-lg-6 mx-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 text-dark">
                    {isEditMode ? 'Edit Fee Type' : 'Add Fee Type'}
                </h2>
                <button
                    onClick={() => navigate('/admin/fee-types')}
                    className="btn btn-outline-secondary btn-sm"
                >
                    <i className="bi bi-arrow-left me-1"></i> Back
                </button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormInput
                            label="Name *"
                            {...register('name')}
                            error={errors.name}
                            placeholder="e.g. Tuition Fee"
                        />

                        <FormInput
                            label="Description"
                            {...register('description')}
                            error={errors.description}
                            placeholder="Description for this fee"
                        />

                        <FormInput
                            label="Display Order"
                            type="number"
                            {...register('displayOrder')}
                            error={errors.displayOrder}
                        />

                        <div className="mt-4 d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/fee-types')}
                                className="btn btn-light border"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary d-flex align-items-center gap-2"
                            >
                                {isSubmitting && (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                )}
                                {isEditMode ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeeTypeFormPage;
