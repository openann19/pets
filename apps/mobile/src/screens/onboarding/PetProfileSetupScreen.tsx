import { logger } from '@pawfectmatch/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import type { OnboardingScreenProps } from '../../navigation/types';

import { api } from '../../services/api';

type PetProfileSetupScreenProps = OnboardingScreenProps<'PetProfileSetup'>;

const PetProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  species: z.enum(['dog', 'cat', 'bird', 'small_furry']),
  breed: z.string().min(2, 'Breed is required'),
  age: z.number().positive('Age must be a positive number'),
  gender: z.enum(['male', 'female']),
  size: z.enum(['small', 'medium', 'large']),
  description: z.string().optional(),
  intent: z.enum(['adoption', 'foster', 'playdate', 'all']),
  personalityTags: z.array(z.string()).min(1, 'Select at least one personality tag'),
  healthInfo: z.object({
    vaccinated: z.boolean(),
    spayedNeutered: z.boolean(),
    microchipped: z.boolean(),
  }),
});

type PetFormData = z.infer<typeof PetProfileSchema>;

// Options for dropdowns
type Option = {
  label: string;
  value: string;
};

const SPECIES_OPTIONS: Option[] = [
  { label: 'Dog', value: 'dog' },
  { label: 'Cat', value: 'cat' },
  { label: 'Bird', value: 'bird' },
  { label: 'Small & Furry', value: 'small_furry' },
];

const SIZE_OPTIONS: Option[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const INTENT_OPTIONS: Option[] = [
  { label: 'Adoption', value: 'adoption' },
  { label: 'Foster', value: 'foster' },
  { label: 'Playdate', value: 'playdate' },
];

const PERSONALITY_TAGS: string[] = [
  'Friendly', 'Shy', 'Energetic', 'Calm', 'Playful',
  'Affectionate', 'Independent', 'Loyal', 'Smart', 'Curious',
  'Gentle', 'Protective', 'Social', 'Vocal', 'Quiet',
];

const PetProfileSetupScreen = ({ route, navigation }: PetProfileSetupScreenProps) => {
  const { userIntent } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [formErrors, setFormErrors] = useState<z.ZodFormattedError<PetFormData, string> | null>(null);
  const [formData, setFormData] = useState<Partial<PetFormData>>({
    intent: userIntent === 'list' ? 'adoption' : 'all',
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
    },
  });

  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming((currentStep + 1) / 4, { duration: 300 });
  }, [currentStep, progressValue]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%` as any,
  }));

  const getStepSchema = useMemo(() => {
    switch (currentStep) {
      case 0:
        return PetProfileSchema.pick({ name: true, species: true, breed: true });
      case 1:
        return PetProfileSchema.pick({ age: true, gender: true, size: true });
      case 2:
        return PetProfileSchema.pick({ intent: true, personalityTags: true });
      case 3:
        return PetProfileSchema.pick({ healthInfo: true });
      default:
        return z.object({});
    }
  }, [currentStep]);

  const isStepValid = useMemo(() => getStepSchema.safeParse(formData).success, [formData, getStepSchema]);

  const updateFormData = useCallback(<K extends keyof PetFormData>(field: K, value: PetFormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const updateHealthInfo = useCallback((field: keyof PetFormData['healthInfo'], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      healthInfo: {
        ...(prev.healthInfo || { vaccinated: false, spayedNeutered: false, microchipped: false }),
        [field]: value,
      },
    }));
  }, []);

  const togglePersonalityTag = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTags: prev.personalityTags?.includes(tag)
        ? prev.personalityTags.filter((t) => t !== tag)
        : [...(prev.personalityTags || []), tag],
    }));
  }, []);

  const validateStep = useCallback((): boolean => {
    const result = getStepSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.format());
    } else {
      setFormErrors(null);
    }
    return result.success;
  }, [formData, getStepSchema]);

  const handleNext = (): void => {
    if (!validateStep()) {
      Alert.alert('Missing Information', 'Please fill in all required fields correctly to continue.');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = (): void => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    const result = PetProfileSchema.safeParse(formData);
    if (!result.success) {
      Alert.alert('Validation Error', 'Please review all steps and fill in the required information.');
      setFormErrors(result.error.format());
      // Find the first step with an error and navigate to it
      const errorFields = Object.keys(result.error.flatten().fieldErrors) as (keyof PetFormData)[];
      const errorField = errorFields[0];
      if (errorField) {
        if (['name', 'species', 'breed'].includes(errorField as string)) setCurrentStep(0);
        else if (['age', 'gender', 'size'].includes(errorField as string)) setCurrentStep(1);
        else if (['intent', 'personalityTags'].includes(errorField as string)) setCurrentStep(2);
        else setCurrentStep(3);
      }
      return;
    }

    try {
      logger.info('Creating pet profile:', { formData: result.data });
      const newPet = await api.createPet(result.data);
      navigation.navigate('PreferencesSetup', { userIntent, petId: newPet._id });
    } catch (error) {
      logger.error('Failed to create pet profile', { error });
      Alert.alert('Error', 'Failed to create pet profile. Please try again.');
    }
  };

  const renderStep = (): React.ReactElement => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderPhysicalInfoStep();
      case 2:
        return renderPersonalityStep();
      case 3:
        return renderHealthInfoStep();
      default:
        return <View />;
    }
  };

  const renderBasicInfoStep = (): React.ReactElement => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your pet</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name || ''}
          onChangeText={(text) => updateFormData('name', text)}
          placeholder="e.g., Buddy, Luna, Max"
        />
        {formErrors?.name?._errors && <Text style={styles.errorText}>{formErrors.name._errors.join(', ')}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Species *</Text>
        <View style={styles.optionsGrid}>
          {SPECIES_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.species === option.value && styles.selectedOption,
              ]}
              onPress={() => updateFormData('species', option.value as 'dog' | 'cat' | 'bird' | 'small_furry')}
            >
              <Text style={[
                styles.optionText,
                formData.species === option.value && styles.selectedOptionText,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {formErrors?.species?._errors && <Text style={styles.errorText}>{formErrors.species._errors.join(', ')}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Breed *</Text>
        <TextInput
          style={styles.input}
          value={formData.breed || ''}
          onChangeText={(text) => updateFormData('breed', text)}
          placeholder="e.g., Golden Retriever, Persian Cat"
        />
        {formErrors?.breed?._errors && <Text style={styles.errorText}>{formErrors.breed._errors.join(', ')}</Text>}
      </View>
    </View>
  );

  const renderPhysicalInfoStep = (): React.ReactElement => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Physical Details</Text>
      <Text style={styles.stepSubtitle}>Help others find the perfect match</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age (years) *</Text>
        <TextInput
          style={styles.input}
          value={formData.age?.toString() || ''}
          onChangeText={(text) => updateFormData('age', Number(text) || 0)}
          placeholder="e.g., 2"
          keyboardType="numeric"
        />
        {formErrors?.age?._errors && <Text style={styles.errorText}>{formErrors.age._errors.join(', ')}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.optionsRow}>
          {['male', 'female'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.optionButton,
                formData.gender === gender && styles.selectedOption,
              ]}
              onPress={() => updateFormData('gender', gender as 'male' | 'female')}
            >
              <Text style={[
                styles.optionText,
                formData.gender === gender && styles.selectedOptionText,
              ]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {formErrors?.gender?._errors && <Text style={styles.errorText}>{formErrors.gender._errors.join(', ')}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Size *</Text>
        <View style={styles.optionsGrid}>
          {SIZE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.size === option.value && styles.selectedOption,
              ]}
              onPress={() => updateFormData('size', option.value as 'small' | 'medium' | 'large')}
            >
              <Text style={[
                styles.optionText,
                formData.size === option.value && styles.selectedOptionText,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {formErrors?.size?._errors && <Text style={styles.errorText}>{formErrors.size._errors.join(', ')}</Text>}
      </View>
    </View>
  );

  const renderPersonalityStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personality & Intent</Text>
      <Text style={styles.stepSubtitle}>What makes your pet special?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Primary Goal</Text>
        <View style={styles.optionsRow}>
          {INTENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.intent === option.value && styles.selectedOption,
              ]}
              onPress={() => updateFormData('intent', option.value as 'adoption' | 'foster' | 'playdate' | 'all')}
            >
              <Text style={[
                styles.optionText,
                formData.intent === option.value && styles.selectedOptionText,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {formErrors?.intent?._errors && <Text style={styles.errorText}>{formErrors.intent._errors.join(', ')}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Personality Tags (select at least one)</Text>
        <View style={styles.tagCloud}>
          {PERSONALITY_TAGS.slice(0, 12).map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                formData.personalityTags?.includes(tag) && styles.selectedTag,
              ]}
              onPress={() => togglePersonalityTag(tag)}
            >
              <Text style={[
                styles.tagText,
                formData.personalityTags?.includes(tag) && styles.selectedTagText,
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {formErrors?.personalityTags?._errors && <Text style={styles.errorText}>{formErrors.personalityTags._errors.join(', ')}</Text>}
      </View>
    </View>
  );

  const renderHealthInfoStep = (): React.ReactElement => {
    const healthOptions: Array<{ key: keyof PetFormData['healthInfo']; label: string; icon: string }> = [
      { key: 'vaccinated', label: 'Vaccinated', icon: '💉' },
      { key: 'spayedNeutered', label: 'Spayed/Neutered', icon: '🏥' },
      { key: 'microchipped', label: 'Microchipped', icon: '🔍' },
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Health Information</Text>
        <Text style={styles.stepSubtitle}>Help potential matches know your pet's health status</Text>

        <View style={styles.healthOptions}>
          {healthOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.healthOption,
                formData.healthInfo?.[option.key] && styles.selectedHealthOption,
              ]}
              onPress={() => updateHealthInfo(option.key, !formData.healthInfo?.[option.key])}
            >
              <Text style={styles.healthIcon}>{option.icon}</Text>
              <Text style={[
                styles.healthLabel,
                formData.healthInfo?.[option.key] && styles.selectedHealthLabel,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.healthNote}>
          💡 Providing health information helps build trust with potential adopters and ensures better matches.
        </Text>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.nextButton, !isStepValid && styles.disabledButton]}
        onPress={handleNext}
        disabled={!isStepValid}
      >
        <Text style={styles.nextButtonText}>{currentStep < 3 ? 'Next' : 'Complete'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, progressStyle]} />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Footer */}
        {renderFooter()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagButton: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectedTag: {
    backgroundColor: '#4A90E2',
  },
  tagText: {
    color: '#333',
    fontSize: 14,
  },
  selectedTagText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  healthOptions: {
    gap: 16,
    marginBottom: 24,
  },
  healthOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  selectedHealthOption: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  healthIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  healthLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedHealthLabel: {
    color: '#10b981',
    fontWeight: '600',
  },
  healthNote: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  backButton: {
    backgroundColor: '#D3D3D3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginLeft: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A9C9E8',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PetProfileSetupScreen;
