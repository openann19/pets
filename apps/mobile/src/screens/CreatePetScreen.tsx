import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

type RootStackParamList = {
  CreatePet: undefined;
  MyPets: undefined;
  Home: undefined;
};

type CreatePetScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatePet'>;

interface PhotoData {
  uri: string;
  type: string;
  fileName: string;
  isPrimary: boolean;
}

export default function CreatePetScreen({ navigation }: CreatePetScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    description: '',
    intent: '',
    personalityTags: [] as string[],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
      specialNeeds: false
    }
  });

  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const speciesOptions = [
    { value: 'dog', label: 'Dog', emoji: '🐕' },
    { value: 'cat', label: 'Cat', emoji: '🐱' },
    { value: 'bird', label: 'Bird', emoji: '🐦' },
    { value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
    { value: 'other', label: 'Other', emoji: '🐾' }
  ];

  const intentOptions = [
    { value: 'adoption', label: 'Available for Adoption', emoji: '🏠' },
    { value: 'mating', label: 'Looking for Mates', emoji: '💕' },
    { value: 'playdate', label: 'Playdates Only', emoji: '🎾' },
    { value: 'all', label: 'Open to All', emoji: '🌟' }
  ];

  const sizeOptions = [
    { value: 'tiny', label: 'Tiny', desc: '< 5 lbs' },
    { value: 'small', label: 'Small', desc: '5-20 lbs' },
    { value: 'medium', label: 'Medium', desc: '20-50 lbs' },
    { value: 'large', label: 'Large', desc: '50-100 lbs' },
    { value: 'extra-large', label: 'Extra Large', desc: '> 100 lbs' }
  ];

  const personalityTags = [
    'friendly', 'energetic', 'playful', 'calm', 'shy', 'protective',
    'good-with-kids', 'good-with-pets', 'trained', 'house-trained', 'intelligent'
  ];

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 10 - photos.length,
    });

    if (!result.canceled) {
      const newPhotos: PhotoData[] = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: 'image/jpeg',
        fileName: `pet-photo-${Date.now()}-${index}.jpg`,
        isPrimary: photos.length === 0 && index === 0 // First photo is primary
      }));

      setPhotos(prev => [...prev, ...newPhotos]);
      setErrors(prev => ({ ...prev, photos: '' }));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      // If we removed the primary photo, make the first remaining photo primary
      if (prev[index].isPrimary && newPhotos.length > 0) {
        newPhotos[0].isPrimary = true;
      }
      return newPhotos;
    });
  };

  const setPrimaryPhoto = (index: number) => {
    setPhotos(prev => prev.map((photo, i) => ({
      ...photo,
      isPrimary: i === index
    })));
  };

  const togglePersonalityTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter(t => t !== tag)
        : [...prev.personalityTags, tag]
    }));
  };

  const validateForm = () => {
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
    if (photos.length === 0) newErrors.photos = 'At least one photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
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
          isPrimary: photo.isPrimary || (index === 0 && photos.length === 1)
        }))
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
            onPress: () => navigation.navigate('MyPets')
          }
        ]
      );

    } catch (error) {
      console.error('Error creating pet:', error);
      Alert.alert('Error', 'Failed to create pet profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Pet Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pet Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => { updateFormData('name', value); }}
                placeholder="Enter your pet's name"
                placeholderTextColor="#9CA3AF"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Species *</Text>
              <View style={styles.optionsGrid}>
                {speciesOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      formData.species === option.value && styles.optionButtonSelected
                    ]}
                    onPress={() => { updateFormData('species', option.value); }}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.optionText,
                      formData.species === option.value && styles.optionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.species && <Text style={styles.errorText}>{errors.species}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Breed *</Text>
              <TextInput
                style={[styles.input, errors.breed && styles.inputError]}
                value={formData.breed}
                onChangeText={(value) => { updateFormData('breed', value); }}
                placeholder="e.g., Golden Retriever, Siamese"
                placeholderTextColor="#9CA3AF"
              />
              {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Age (years) *</Text>
                <TextInput
                  style={[styles.input, errors.age && styles.inputError]}
                  value={formData.age}
                  onChangeText={(value) => { updateFormData('age', value); }}
                  placeholder="0-30"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.label}>Gender *</Text>
                <View style={styles.genderOptions}>
                  {[
                    { value: 'male', label: 'Male', emoji: '♂️' },
                    { value: 'female', label: 'Female', emoji: '♀️' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderButton,
                        formData.gender === option.value && styles.genderButtonSelected
                      ]}
                      onPress={() => { updateFormData('gender', option.value); }}
                    >
                      <Text style={styles.genderEmoji}>{option.emoji}</Text>
                      <Text style={[
                        styles.genderText,
                        formData.gender === option.value && styles.genderTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Size *</Text>
              <View style={styles.sizeOptions}>
                {sizeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sizeButton,
                      formData.size === option.value && styles.sizeButtonSelected
                    ]}
                    onPress={() => { updateFormData('size', option.value); }}
                  >
                    <Text style={[
                      styles.sizeLabel,
                      formData.size === option.value && styles.sizeLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.sizeDesc,
                      formData.size === option.value && styles.sizeDescSelected
                    ]}>
                      {option.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.size && <Text style={styles.errorText}>{errors.size}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.textArea]}
                value={formData.description}
                onChangeText={(value) => { updateFormData('description', value); }}
                placeholder="Tell us about your pet's personality, habits, and what makes them special..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Personality */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personality & Traits</Text>
            <Text style={styles.sectionDesc}>Select all that apply to help us find better matches:</Text>

            <View style={styles.tagsContainer}>
              {personalityTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    formData.personalityTags.includes(tag) && styles.tagSelected
                  ]}
                  onPress={() => { togglePersonalityTag(tag); }}
                >
                  <Text style={[
                    styles.tagText,
                    formData.personalityTags.includes(tag) && styles.tagTextSelected
                  ]}>
                    {tag.replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Intent & Health */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intent & Health</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>What are you looking for? *</Text>
              <View style={styles.intentOptions}>
                {intentOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.intentButton,
                      formData.intent === option.value && styles.intentButtonSelected
                    ]}
                    onPress={() => { updateFormData('intent', option.value); }}
                  >
                    <Text style={styles.intentEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.intentText,
                      formData.intent === option.value && styles.intentTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.intent && <Text style={styles.errorText}>{errors.intent}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Health Information</Text>
              <View style={styles.healthOptions}>
                {[
                  { key: 'vaccinated', label: 'Vaccinated' },
                  { key: 'spayedNeutered', label: 'Spayed/Neutered' },
                  { key: 'microchipped', label: 'Microchipped' },
                  { key: 'specialNeeds', label: 'Has Special Needs' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.checkboxContainer}
                    onPress={() => { updateFormData(`healthInfo.${item.key}`, !formData.healthInfo[item.key as keyof typeof formData.healthInfo]); }}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.healthInfo[item.key as keyof typeof formData.healthInfo] && styles.checkboxChecked
                    ]}>
                      {formData.healthInfo[item.key as keyof typeof formData.healthInfo] && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>

            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={pickImage}
              disabled={photos.length >= 10}
            >
              <Ionicons name="camera" size={24} color="#6B7280" />
              <Text style={styles.addPhotoText}>
                {photos.length === 0 ? 'Add Photos' : `Add More Photos (${photos.length}/10)`}
              </Text>
            </TouchableOpacity>

            {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}

            {photos.length > 0 && (
              <View style={styles.photosGrid}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo.uri }} style={styles.photo} />

                    {photo.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}

                    <View style={styles.photoActions}>
                      {!photo.isPrimary && (
                        <TouchableOpacity
                          style={styles.photoActionButton}
                          onPress={() => { setPrimaryPhoto(index); }}
                        >
                          <Ionicons name="star" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.photoActionButton, styles.deleteButton]}
                        onPress={() => { removePhoto(index); }}
                      >
                        <Ionicons name="trash" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.photoHint}>
              • Upload up to 10 photos (max 5MB each){'\n'}
              • First photo will be set as primary{'\n'}
              • Supported formats: JPG, PNG, GIF
            </Text>
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.submitContent}>
                  <Ionicons name="sync" size={20} color="#FFFFFF" style={{ transform: [{ rotate: '45deg' }] }} />
                  <Text style={styles.submitButtonText}>Creating Profile...</Text>
                </View>
              ) : (
                <View style={styles.submitContent}>
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Create Pet Profile</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    height: 100,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flex: 1,
    minWidth: (screenWidth - 40 - 16) / 2,
    justifyContent: 'center',
  },
  optionButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#8B5CF6',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  genderButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  genderEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  genderText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#8B5CF6',
  },
  sizeOptions: {
    gap: 8,
  },
  sizeButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  sizeButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  sizeLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  sizeLabelSelected: {
    color: '#8B5CF6',
  },
  sizeDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sizeDescSelected: {
    color: '#7C3AED',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  tagSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
  },
  tagTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  intentOptions: {
    gap: 12,
  },
  intentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  intentButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  intentEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  intentText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  intentTextSelected: {
    color: '#8B5CF6',
  },
  healthOptions: {
    gap: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  photoContainer: {
    width: (screenWidth - 40 - 24) / 3,
    height: (screenWidth - 40 - 24) / 3,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  photoActions: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  photoActionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  photoHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 18,
  },
  submitContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
