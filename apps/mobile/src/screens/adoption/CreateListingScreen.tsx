/**
 * CreateListingScreen - Adoption Listing Creation
 * Multi-step form for creating adoption listings
 */
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Image,
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

import { api } from '../../services/api';

type RootStackParamList = {
    CreateListing: { petId?: string };
    AdoptionManager: undefined;
};

type CreateListingScreenProps = NativeStackScreenProps<
    RootStackParamList,
    'CreateListing'
>;

const AdoptionListingSchema = z.object({
    petId: z.string().min(1, 'Please select a pet'),
    adoptionFee: z.number().min(0, 'Adoption fee must be 0 or greater'),
    requirements: z.array(z.string()).min(1, 'Add at least one requirement'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    availableFrom: z.string().optional(),
    contactPreference: z.enum(['email', 'phone', 'both']),
    homeVisitRequired: z.boolean(),
    referencesRequired: z.boolean(),
    photos: z.array(z.string()).min(1, 'Add at least one photo'),
    termsAgreed: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
});

type AdoptionListingFormData = z.infer<typeof AdoptionListingSchema>;

interface Pet {
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    photos: Array<{ url: string }>;
}

const REQUIREMENT_SUGGESTIONS = [
    'Indoor living only',
    'Fenced yard required',
    'No other pets',
    'Experience with breed',
    'Adult-only household',
    'Home office/work from home',
    'Regular exercise commitment',
    'Veterinary care commitment',
];

const CreateListingScreen = ({ route, navigation }: CreateListingScreenProps) => {
    const { petId: initialPetId } = route.params || {};
    const [currentStep, setCurrentStep] = useState(0);
    const [myPets, setMyPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<z.ZodFormattedError<AdoptionListingFormData, string> | null>(null);
    const [formData, setFormData] = useState<Partial<AdoptionListingFormData>>({
        petId: initialPetId || '',
        adoptionFee: 0,
        requirements: [],
        description: '',
        contactPreference: 'both',
        homeVisitRequired: true,
        referencesRequired: true,
        photos: [],
        termsAgreed: false,
    });

    const progressValue = useSharedValue(0);

    useEffect(() => {
        progressValue.value = withTiming((currentStep + 1) / 4, { duration: 300 });
    }, [currentStep, progressValue]);

    useEffect(() => {
        loadMyPets();
    }, []);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progressValue.value * 100}%` as any,
    }));

    const loadMyPets = async () => {
        try {
            const pets = await api.getPets();
            setMyPets(pets);
        } catch (error) {
            logger.error('Failed to load pets', { error });
            Alert.alert('Error', 'Failed to load your pets. Please try again.');
        }
    };

    const getStepSchema = useMemo(() => {
        switch (currentStep) {
            case 0:
                return AdoptionListingSchema.pick({ petId: true });
            case 1:
                return AdoptionListingSchema.pick({
                    adoptionFee: true,
                    requirements: true,
                    homeVisitRequired: true,
                    referencesRequired: true,
                });
            case 2:
                return AdoptionListingSchema.pick({
                    description: true,
                    contactPreference: true,
                    photos: true,
                });
            case 3:
                return AdoptionListingSchema.pick({ termsAgreed: true });
            default:
                return z.object({});
        }
    }, [currentStep]);

    const isStepValid = useMemo(() => getStepSchema.safeParse(formData).success, [formData, getStepSchema]);

    const updateFormData = useCallback(<K extends keyof AdoptionListingFormData>(
        field: K,
        value: AdoptionListingFormData[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const toggleRequirement = useCallback((requirement: string) => {
        setFormData((prev) => ({
            ...prev,
            requirements: prev.requirements?.includes(requirement)
                ? prev.requirements.filter((r) => r !== requirement)
                : [...(prev.requirements || []), requirement],
        }));
    }, []);

    const addCustomRequirement = useCallback(() => {
        Alert.prompt(
            'Add Requirement',
            'Enter a custom requirement for adopters:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add',
                    onPress: (text) => {
                        if (text && text.trim()) {
                            setFormData((prev) => ({
                                ...prev,
                                requirements: [...(prev.requirements || []), text.trim()],
                            }));
                        }
                    },
                },
            ],
            'plain-text'
        );
    }, []);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera roll permissions to add photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [4, 3],
            });

            if (!result.canceled) {
                const newPhotos = result.assets.map((asset) => asset.uri);
                setFormData((prev) => ({
                    ...prev,
                    photos: [...(prev.photos || []), ...newPhotos],
                }));
            }
        } catch (error) {
            logger.error('Failed to pick image', { error });
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const removePhoto = useCallback((photoUri: string) => {
        setFormData((prev) => ({
            ...prev,
            photos: prev.photos?.filter((uri) => uri !== photoUri) || [],
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
            setCurrentStep((prev) => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = (): void => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleComplete = async () => {
        const result = AdoptionListingSchema.safeParse(formData);
        if (!result.success) {
            Alert.alert('Validation Error', 'Please review all steps and fill in the required information.');
            setFormErrors(result.error.format());
            const errorFields = Object.keys(result.error.flatten().fieldErrors) as (keyof AdoptionListingFormData)[];
            const errorField = errorFields[0];
            if (errorField) {
                if (errorField === 'petId') setCurrentStep(0);
                else if (['adoptionFee', 'requirements', 'homeVisitRequired', 'referencesRequired'].includes(errorField as string)) setCurrentStep(1);
                else if (['description', 'contactPreference', 'photos'].includes(errorField as string)) setCurrentStep(2);
                else setCurrentStep(3);
            }
            return;
        }

        try {
            setIsLoading(true);
            logger.info('Creating adoption listing:', { formData: result.data });

            // Create listing via API
            await api.request('/adoption/listings', {
                method: 'POST',
                body: JSON.stringify(result.data),
            });

            Alert.alert(
                'Success!',
                'Your adoption listing has been created successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('AdoptionManager'),
                    },
                ]
            );
        } catch (error) {
            logger.error('Failed to create adoption listing', { error });
            Alert.alert('Error', 'Failed to create adoption listing. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = (): React.ReactElement => {
        switch (currentStep) {
            case 0:
                return renderPetSelectionStep();
            case 1:
                return renderAdoptionDetailsStep();
            case 2:
                return renderDescriptionStep();
            case 3:
                return renderTermsStep();
            default:
                return <View />;
        }
    };

    const renderPetSelectionStep = (): React.ReactElement => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Pet</Text>
            <Text style={styles.stepSubtitle}>Which pet would you like to list for adoption?</Text>

            <View style={styles.petList}>
                {myPets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="paw-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyStateText}>No pets found</Text>
                        <Text style={styles.emptyStateSubtext}>Please add a pet first</Text>
                    </View>
                ) : (
                    myPets.map((pet) => (
                        <TouchableOpacity
                            key={pet._id}
                            style={[
                                styles.petCard,
                                formData.petId === pet._id && styles.selectedPetCard,
                            ]}
                            onPress={() => updateFormData('petId', pet._id)}
                        >
                            {pet.photos[0] && (
                                <Image source={{ uri: pet.photos[0].url }} style={styles.petCardImage} />
                            )}
                            <View style={styles.petCardInfo}>
                                <Text style={styles.petCardName}>{pet.name}</Text>
                                <Text style={styles.petCardDetails}>
                                    {pet.breed} • {pet.age} years
                                </Text>
                            </View>
                            {formData.petId === pet._id && (
                                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </View>
            {formErrors?.petId?._errors && (
                <Text style={styles.errorText}>{formErrors.petId._errors.join(', ')}</Text>
            )}
        </View>
    );

    const renderAdoptionDetailsStep = (): React.ReactElement => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Adoption Details</Text>
            <Text style={styles.stepSubtitle}>Set requirements and fees</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Adoption Fee ($)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.adoptionFee?.toString() || '0'}
                    onChangeText={(text) => updateFormData('adoptionFee', Number(text) || 0)}
                    placeholder="0"
                    keyboardType="numeric"
                />
                <Text style={styles.helpText}>Set to 0 for free adoption</Text>
                {formErrors?.adoptionFee?._errors && (
                    <Text style={styles.errorText}>{formErrors.adoptionFee._errors.join(', ')}</Text>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Requirements (select at least one)</Text>
                <View style={styles.requirementsGrid}>
                    {REQUIREMENT_SUGGESTIONS.map((req) => (
                        <TouchableOpacity
                            key={req}
                            style={[
                                styles.requirementButton,
                                formData.requirements?.includes(req) && styles.selectedRequirement,
                            ]}
                            onPress={() => toggleRequirement(req)}
                        >
                            <Text
                                style={[
                                    styles.requirementText,
                                    formData.requirements?.includes(req) && styles.selectedRequirementText,
                                ]}
                            >
                                {req}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.addButton} onPress={addCustomRequirement}>
                    <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
                    <Text style={styles.addButtonText}>Add Custom Requirement</Text>
                </TouchableOpacity>
                {formErrors?.requirements?._errors && (
                    <Text style={styles.errorText}>{formErrors.requirements._errors.join(', ')}</Text>
                )}
            </View>

            <View style={styles.checkboxGroup}>
                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => updateFormData('homeVisitRequired', !formData.homeVisitRequired)}
                >
                    <Ionicons
                        name={formData.homeVisitRequired ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={formData.homeVisitRequired ? '#10b981' : '#999'}
                    />
                    <Text style={styles.checkboxLabel}>Home visit required</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => updateFormData('referencesRequired', !formData.referencesRequired)}
                >
                    <Ionicons
                        name={formData.referencesRequired ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={formData.referencesRequired ? '#10b981' : '#999'}
                    />
                    <Text style={styles.checkboxLabel}>References required</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDescriptionStep = (): React.ReactElement => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Description & Photos</Text>
            <Text style={styles.stepSubtitle}>Tell adopters about your pet</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description || ''}
                    onChangeText={(text) => updateFormData('description', text)}
                    placeholder="Describe your pet's personality, habits, health, and why they need a new home..."
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                    {formData.description?.length || 0} / 500 (minimum 50)
                </Text>
                {formErrors?.description?._errors && (
                    <Text style={styles.errorText}>{formErrors.description._errors.join(', ')}</Text>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Preference</Text>
                <View style={styles.optionsRow}>
                    {['email', 'phone', 'both'].map((pref) => (
                        <TouchableOpacity
                            key={pref}
                            style={[
                                styles.optionButton,
                                formData.contactPreference === pref && styles.selectedOption,
                            ]}
                            onPress={() => updateFormData('contactPreference', pref as 'email' | 'phone' | 'both')}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    formData.contactPreference === pref && styles.selectedOptionText,
                                ]}
                            >
                                {pref.charAt(0).toUpperCase() + pref.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Photos (at least 1 required)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                    <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                        <Ionicons name="camera-outline" size={32} color="#4A90E2" />
                        <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                    {formData.photos?.map((photoUri, index) => (
                        <View key={index} style={styles.photoContainer}>
                            <Image source={{ uri: photoUri }} style={styles.photo} />
                            <TouchableOpacity
                                style={styles.removePhotoButton}
                                onPress={() => removePhoto(photoUri)}
                            >
                                <Ionicons name="close-circle" size={24} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
                {formErrors?.photos?._errors && (
                    <Text style={styles.errorText}>{formErrors.photos._errors.join(', ')}</Text>
                )}
            </View>
        </View>
    );

    const renderTermsStep = (): React.ReactElement => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Terms & Conditions</Text>
            <Text style={styles.stepSubtitle}>Review and agree to the terms</Text>

            <View style={styles.termsContainer}>
                <ScrollView style={styles.termsScroll}>
                    <Text style={styles.termsTitle}>Adoption Listing Agreement</Text>

                    <Text style={styles.termsSection}>1. Accuracy of Information</Text>
                    <Text style={styles.termsText}>
                        You certify that all information provided about the pet is accurate and complete to the best of your knowledge.
                    </Text>

                    <Text style={styles.termsSection}>2. Pet Welfare</Text>
                    <Text style={styles.termsText}>
                        You confirm that the pet is in good health, properly vaccinated, and has received appropriate veterinary care.
                    </Text>

                    <Text style={styles.termsSection}>3. Screening Process</Text>
                    <Text style={styles.termsText}>
                        You agree to thoroughly screen potential adopters and conduct home visits if required.
                    </Text>

                    <Text style={styles.termsSection}>4. No Breeding</Text>
                    <Text style={styles.termsText}>
                        The pet must not be adopted for breeding purposes unless explicitly stated.
                    </Text>

                    <Text style={styles.termsSection}>5. Platform Fees</Text>
                    <Text style={styles.termsText}>
                        PawfectMatch does not charge platform fees. Any adoption fee goes directly to you.
                    </Text>

                    <Text style={styles.termsSection}>6. Liability</Text>
                    <Text style={styles.termsText}>
                        You assume full responsibility for the pet until officially transferred to the adopter.
                    </Text>
                </ScrollView>

                <TouchableOpacity
                    style={styles.termsCheckbox}
                    onPress={() => updateFormData('termsAgreed', !formData.termsAgreed)}
                >
                    <Ionicons
                        name={formData.termsAgreed ? 'checkbox' : 'square-outline'}
                        size={28}
                        color={formData.termsAgreed ? '#10b981' : '#999'}
                    />
                    <Text style={styles.termsCheckboxLabel}>
                        I have read and agree to the terms and conditions
                    </Text>
                </TouchableOpacity>
                {formErrors?.termsAgreed?._errors && (
                    <Text style={styles.errorText}>{formErrors.termsAgreed._errors.join(', ')}</Text>
                )}
            </View>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.nextButton, !isStepValid && styles.disabledButton]}
                onPress={handleNext}
                disabled={!isStepValid || isLoading}
            >
                {isLoading ? (
                    <Text style={styles.nextButtonText}>Creating...</Text>
                ) : (
                    <Text style={styles.nextButtonText}>
                        {currentStep < 3 ? 'Next' : 'Create Listing'}
                    </Text>
                )}
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
                    <Text style={styles.stepIndicator}>
                        Step {currentStep + 1} of 4
                    </Text>
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
    keyboardView: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#10b981',
        borderRadius: 4,
    },
    stepIndicator: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontWeight: '600',
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
        marginBottom: 24,
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
    textArea: {
        height: 120,
        paddingTop: 12,
    },
    helpText: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
    characterCount: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
        textAlign: 'right',
    },
    errorText: {
        color: '#ef4444',
        marginTop: 4,
        fontSize: 14,
    },
    petList: {
        gap: 12,
    },
    petCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    selectedPetCard: {
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4',
    },
    petCardImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    petCardInfo: {
        flex: 1,
    },
    petCardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    petCardDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#CCC',
        marginTop: 4,
    },
    requirementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    requirementButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    selectedRequirement: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    requirementText: {
        fontSize: 14,
        color: '#333',
    },
    selectedRequirementText: {
        color: '#FFF',
        fontWeight: '600',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        padding: 8,
    },
    addButtonText: {
        fontSize: 14,
        color: '#4A90E2',
        marginLeft: 8,
        fontWeight: '600',
    },
    checkboxGroup: {
        gap: 12,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#444',
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    optionButton: {
        flex: 1,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    selectedOptionText: {
        color: '#FFF',
    },
    photoScroll: {
        marginTop: 8,
    },
    addPhotoButton: {
        width: 120,
        height: 120,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#4A90E2',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addPhotoText: {
        fontSize: 12,
        color: '#4A90E2',
        marginTop: 4,
        fontWeight: '600',
    },
    photoContainer: {
        position: 'relative',
        marginRight: 12,
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },
    removePhotoButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFF',
        borderRadius: 12,
    },
    termsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        minHeight: 400,
    },
    termsScroll: {
        maxHeight: 350,
        marginBottom: 16,
    },
    termsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    termsSection: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginTop: 12,
        marginBottom: 8,
    },
    termsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    termsCheckbox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    termsCheckboxLabel: {
        flex: 1,
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#FFF',
        gap: 12,
    },
    backButton: {
        backgroundColor: '#E0E0E0',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: '#10b981',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCC',
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreateListingScreen;
