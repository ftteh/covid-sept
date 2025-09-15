import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { healthDeclarationSchema, HealthDeclarationFormData } from '@/lib/validations';
import { healthDeclarationApi } from '@/lib/api';

interface HealthDeclarationFormProps {
  onSuccess?: () => void;
}

const SYMPTOMS_LIST = [
  'Cough',
  'Smell/taste impairment', 
  'Fever',
  'Breathing difficulties',
  'Body aches',
  'Headaches',
  'Fatigue',
  'Sore throat',
  'Diarrhea',
  'Runny nose'
];

export default function HealthDeclarationForm({ onSuccess }: HealthDeclarationFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HealthDeclarationFormData>({
    resolver: zodResolver(healthDeclarationSchema),
    defaultValues: {
      hasSymptoms: false,
      hasContact: false,
    },
  });

  const hasSymptoms = watch('hasSymptoms');
  const hasContact = watch('hasContact');

  const createMutation = useMutation({
    mutationFn: healthDeclarationApi.create,
    onSuccess: () => {
      toast.success('Health declaration submitted successfully!');
      reset();
      queryClient.invalidateQueries({ queryKey: ['health-declarations'] });
      queryClient.invalidateQueries({ queryKey: ['health-declaration-stats'] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to submit health declaration:', error);
      // Error is already handled by the API interceptor
    },
  });

  const onSubmit = (data: HealthDeclarationFormData) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Alert Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This health declaration is required for COVID-19 screening purposes. 
                Please answer all questions truthfully. Your information will be kept confidential.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            {...register('name')}
            className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter your full name"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Temperature Field */}
      <div>
        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
          Temperature (°C) <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="number"
            step="0.1"
            min="30"
            max="45"
            id="temperature"
            {...register('temperature', { valueAsNumber: true })}
            className={`form-input ${errors.temperature ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="e.g., 36.5"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Please enter your current body temperature in Celsius (normal range: 36-37°C)
        </p>
        {errors.temperature && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            {errors.temperature.message}
          </p>
        )}
      </div>

      {/* Symptoms Question */}
      <div>
        <fieldset>
          <legend className="text-sm font-medium text-gray-700">
            Do you have any of the following symptoms now or within the last 14 days? <span className="text-red-500">*</span>
          </legend>
          <p className="text-xs text-gray-500 mt-1">
            {SYMPTOMS_LIST.join(', ')} (even if symptoms are mild)
          </p>
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <input
                id="hasSymptoms-no"
                type="radio"
                value="false"
                {...register('hasSymptoms')}
                className="form-radio"
              />
              <label htmlFor="hasSymptoms-no" className="ml-2 text-sm text-gray-700">
                No, I do not have any of these symptoms
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="hasSymptoms-yes"
                type="radio"
                value="true"
                {...register('hasSymptoms')}
                className="form-radio"
              />
              <label htmlFor="hasSymptoms-yes" className="ml-2 text-sm text-gray-700">
                Yes, I have one or more of these symptoms
              </label>
            </div>
          </div>
          
          {errors.hasSymptoms && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.hasSymptoms.message}
            </p>
          )}
        </fieldset>
      </div>

      {/* Symptoms Details (conditional) */}
      {hasSymptoms && (
        <div className="animate-slide-up">
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
            Please describe your symptoms <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <textarea
              id="symptoms"
              rows={3}
              {...register('symptoms')}
              className={`form-textarea ${errors.symptoms ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Please describe your symptoms in detail..."
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Include which symptoms you have and when they started
          </p>
          {errors.symptoms && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.symptoms.message}
            </p>
          )}
        </div>
      )}

      {/* Contact Question */}
      <div>
        <fieldset>
          <legend className="text-sm font-medium text-gray-700">
            Have you been in contact with anyone suspected or diagnosed with COVID-19 within the last 14 days? <span className="text-red-500">*</span>
          </legend>
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <input
                id="hasContact-no"
                type="radio"
                value="false"
                {...register('hasContact')}
                className="form-radio"
              />
              <label htmlFor="hasContact-no" className="ml-2 text-sm text-gray-700">
                No, I have not been in contact
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="hasContact-yes"
                type="radio"
                value="true"
                {...register('hasContact')}
                className="form-radio"
              />
              <label htmlFor="hasContact-yes" className="ml-2 text-sm text-gray-700">
                Yes, I have been in contact
              </label>
            </div>
          </div>
          
          {errors.hasContact && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.hasContact.message}
            </p>
          )}
        </fieldset>
      </div>

      {/* Contact Details (conditional) */}
      {hasContact && (
        <div className="animate-slide-up">
          <label htmlFor="contactDetails" className="block text-sm font-medium text-gray-700">
            Please provide contact details <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <textarea
              id="contactDetails"
              rows={3}
              {...register('contactDetails')}
              className={`form-textarea ${errors.contactDetails ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Please provide details about the contact (when, where, relationship, etc.)..."
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Include when and where the contact occurred, and your relationship to the person
          </p>
          {errors.contactDetails && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.contactDetails.message}
            </p>
          )}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="flex">
          <CheckCircleIcon className="h-5 w-5 text-gray-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">Privacy & Data Protection</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                By submitting this form, you acknowledge that your information will be used for 
                health screening purposes only and will be handled in accordance with applicable 
                data protection regulations. Your IP address and browser information will be logged for audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary btn-lg min-w-[200px] justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="spinner h-4 w-4 mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Submit Declaration
            </>
          )}
        </button>
      </div>
    </form>
  );
} 