import { useState } from 'react';
import { Alert } from 'react-native';

export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  intent: string;
  personalityTags: string[];
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
    specialNeeds: boolean;
  };
}

export interface UsePetFormReturn {
  formData: PetFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  updateFormData: (field: string, value: any) => void;
  validateForm: () => boolean;
  handleSubmit: (photos: any[], navigation: any) => Promise<void>;
}

export const usePetForm = (): UsePetFormReturn => {
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    description: '',
    intent: '',
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
      specialNeeds: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Pet name is required';
    if (!formData.species) newErrors.species = 'Species is required';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 30) {
      newErrors.age = 'Age must be between 0 and 30 years';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.size) newErrors.size = 'Size is required';
    if (!formData.intent) newErrors.intent = 'Intent is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (photos: any[], navigation: any) => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please add at least one photo');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to create pet
      const petData = {
        ...formData,
        age: Number(formData.age),
        photos: photos.map((photo, index) => ({
          uri: photo.uri,
          type: photo.type,
          name: photo.fileName,
          isPrimary: photo.isPrimary || (index === 0 && photos.length === 1),
        })),
      };

      console.log('Creating pet:', petData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success!',
        'Pet profile created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MyPets'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating pet:', error);
      Alert.alert('Error', 'Failed to create pet profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    updateFormData,
    validateForm,
    handleSubmit,
  };
};
