import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Dialog } from '../Dialog/Dialog';

interface PlanFeature {
  title: string;
  description: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: PlanFeature[];
  popular?: boolean;
  color?: string;
}

export interface PremiumFeaturesModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Current user subscription status
   */
  currentPlan?: string | null;

  /**
   * Callback when a plan is selected
   */
  onPlanSelect?: (planId: string, billingInterval: 'monthly' | 'yearly') => void;

  /**
   * Callback when checkout is initiated
   */
  onCheckout?: (planId: string, billingInterval: 'monthly' | 'yearly') => void;

  /**
   * Custom subscription plans (overrides defaults)
   */
  plans?: SubscriptionPlan[];

  /**
   * Default billing interval
   */
  defaultBillingInterval?: 'monthly' | 'yearly';

  /**
   * Yearly discount percentage
   */
  yearlyDiscountPercentage?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Custom title for the modal
   */
  title?: string;

  /**
   * Custom description for the modal
   */
  description?: string;

  /**
   * Custom modal size
   */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

/**
 * A modal component that displays premium subscription plans with Stripe integration
 * Built with 2025 UI/UX best practices
 */
export const PremiumFeaturesModal: React.FC<PremiumFeaturesModalProps> = ({
  isOpen,
  onClose,
  currentPlan = null,
  onPlanSelect,
  onCheckout,
  plans: customPlans,
  defaultBillingInterval = 'monthly',
  yearlyDiscountPercentage = 20,
  className = '',
  title = 'Upgrade to Premium',
  description = 'Unlock premium features to enhance your pet adoption journey.',
  size = 'large'
}) => {
  const { isDarkMode } = useTheme();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>(defaultBillingInterval);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(currentPlan);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  // Default subscription plans
  const defaultPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Essential features for casual pet seekers',
      price: {
        monthly: 0,
        yearly: 0
      },
      features: [
        { title: 'Browse pets', description: 'Access to pet listings', included: true },
        { title: 'Basic filtering', description: 'Filter by pet type and location', included: true },
        { title: 'Save favorites', description: 'Up to 5 saved pets', included: true },
        { title: 'AI recommendations', description: 'Smart pet suggestions', included: false },
        { title: 'Advanced filters', description: 'Filter by breed, age, and more', included: false },
        { title: 'Message shelters', description: 'Direct communication with shelters', included: false }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Advanced features for serious pet adopters',
      popular: true,
      color: 'blue',
      price: {
        monthly: 9.99,
        yearly: 7.99 * 12
      },
      features: [
        { title: 'Browse pets', description: 'Access to pet listings', included: true },
        { title: 'Basic filtering', description: 'Filter by pet type and location', included: true },
        { title: 'Save favorites', description: 'Unlimited saved pets', included: true },
        { title: 'AI recommendations', description: 'Smart pet suggestions', included: true },
        { title: 'Advanced filters', description: 'Filter by breed, age, and more', included: true },
        { title: 'Message shelters', description: 'Direct communication with shelters', included: false }
      ]
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      description: 'Complete features for dedicated pet lovers',
      color: 'purple',
      price: {
        monthly: 19.99,
        yearly: 15.99 * 12
      },
      features: [
        { title: 'Browse pets', description: 'Access to pet listings', included: true },
        { title: 'Basic filtering', description: 'Filter by pet type and location', included: true },
        { title: 'Save favorites', description: 'Unlimited saved pets', included: true },
        { title: 'AI recommendations', description: 'Smart pet suggestions', included: true },
        { title: 'Advanced filters', description: 'Filter by breed, age, and more', included: true },
        { title: 'Message shelters', description: 'Direct communication with shelters', included: true },
        { title: 'Priority support', description: '24/7 dedicated support', included: true },
        { title: 'Home visit scheduling', description: 'Schedule visits directly', included: true }
      ]
    }
  ];

  // Use custom plans if provided
  const plans = customPlans ?? defaultPlans;

  // Handle plan selection
  const handlePlanSelect = (planId: string): void => {
    setSelectedPlan(planId);
    if (onPlanSelect !== null && onPlanSelect !== undefined) {
      onPlanSelect(planId, billingInterval);
    }
  };

  // Handle checkout initiation
  const handleCheckout = (planId: string): void => {
    setProcessingPlan(planId);

    if (onCheckout !== null && onCheckout !== undefined) {
      onCheckout(planId, billingInterval);
    }

    // Simulating API call delay
    setTimeout(() => {
      setProcessingPlan(null);
    }, 2000);
  };

  // Format price with currency
  const formatPrice = (price: number): string => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);

  // Calculate yearly savings
  const calculateYearlySavings = (plan: SubscriptionPlan): string => {
    const monthlyCost = plan.price.monthly * 12;
    const yearlyCost = plan.price.yearly;
    const savings = monthlyCost - yearlyCost;

    return formatPrice(savings);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      className={className}
      variant="blurred"
      animationPreset="scale"
      blurBackground
    >
      <div className="py-2">
        {/* Billing interval toggle */}
        <div className="flex justify-center mb-8">
          <div className={`
            inline-flex p-1 rounded-full
            ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}
          `}>
            <button
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${billingInterval === 'monthly'
                  ? isDarkMode
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'bg-white text-gray-900 shadow-sm'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
              onClick={() => { setBillingInterval('monthly'); }}
            >
              Monthly
            </button>
            <button
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center
                ${billingInterval === 'yearly'
                  ? isDarkMode
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'bg-white text-gray-900 shadow-sm'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
              onClick={() => { setBillingInterval('yearly'); }}
            >
              Yearly
              <span className={`
                ml-2 text-xs font-semibold px-2 py-0.5 rounded-full
                ${isDarkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'}
              `}>
                Save {yearlyDiscountPercentage}%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isSelected = selectedPlan === plan.id;
            const isProcessing = processingPlan === plan.id;
            const price = billingInterval === 'monthly' ? plan.price.monthly : (plan.price.yearly / 12);

            // Dynamic styles based on plan
            const getBgColor = (): string => {
              if (isSelected) {
                if (plan.color === 'blue') return isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50';
                if (plan.color === 'purple') return isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50';
                return isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
              }
              return isDarkMode ? 'bg-gray-800/50' : 'bg-white';
            };

            const getBorderColor = (): string => {
              if (isSelected || !!plan.popular) {
                if (plan.color === 'blue') return isDarkMode ? 'border-blue-500' : 'border-blue-400';
                if (plan.color === 'purple') return isDarkMode ? 'border-purple-500' : 'border-purple-400';
                return isDarkMode ? 'border-gray-600' : 'border-gray-300';
              }
              return isDarkMode ? 'border-gray-700' : 'border-gray-200';
            };

            return (
              <div
                key={plan.id}
                className={`
                  rounded-xl border-2 transition-all duration-300
                  ${getBgColor()}
                  ${getBorderColor()}
                  ${isSelected ? 'shadow-xl transform scale-[1.02]' : 'shadow-md hover:shadow-lg'}
                  ${plan.popular ? 'relative transform md:-translate-y-4' : ''}
                `}
              >
                {/* Popular badge */}
                {plan.popular !== undefined && plan.popular !== null && (
                  <div className={`
                    absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}
                  `}>
                    Most Popular
                  </div>
                )}

                <div className="p-6">
                  {/* Plan header */}
                  <div className="text-center mb-6">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Plan pricing */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center">
                      <span className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatPrice(price)}
                      </span>
                      <span className={`ml-1 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        /mo
                      </span>
                    </div>

                    {billingInterval === 'yearly' && plan.price.yearly > 0 && (
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Save {calculateYearlySavings(plan)} per year
                      </p>
                    )}
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className={`
                          flex-shrink-0 mt-0.5
                          ${feature.included
                            ? isDarkMode ? 'text-green-400' : 'text-green-500'
                            : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                          }
                        `}>
                          {feature.included ? (
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`
                            text-sm font-medium
                            ${isDarkMode
                              ? feature.included ? 'text-white' : 'text-gray-400'
                              : feature.included ? 'text-gray-900' : 'text-gray-500'
                            }
                          `}>
                            {feature.title}
                          </p>
                          <p className={`
                            text-xs
                            ${isDarkMode
                              ? feature.included ? 'text-gray-300' : 'text-gray-500'
                              : feature.included ? 'text-gray-500' : 'text-gray-400'
                            }
                          `}>
                            {feature.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Action button */}
                  <div>
                    {isCurrentPlan ? (
                      <div className={`
                        w-full py-2 px-4 rounded-lg text-center text-sm font-medium
                        ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}
                      `}>
                        Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          handlePlanSelect(plan.id);
                          if (plan.price.monthly > 0 || plan.price.yearly > 0) {
                            handleCheckout(plan.id);
                          }
                        }}
                        disabled={isProcessing}
                        className={`
                          w-full py-2.5 px-4 rounded-lg text-center font-medium transition-all
                          ${plan.price.monthly === 0 && plan.price.yearly === 0
                            ? isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            : plan.color === 'blue'
                              ? isDarkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                              : plan.color === 'purple'
                                ? isDarkMode
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                  : 'bg-purple-500 hover:bg-purple-600 text-white'
                                : isDarkMode
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                          }
                          ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}
                        `}
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </span>
                        ) : plan.price.monthly === 0 && plan.price.yearly === 0 ? (
                          'Continue with Free Plan'
                        ) : (
                          `Subscribe to ${plan.name}`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscription info */}
        <div className="mt-8 text-center text-xs">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Subscription will automatically renew. Cancel anytime.
            <br />
            All plans include our 14-day money back guarantee.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <svg className="h-8" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="0.5" width="32" height="20" rx="2" fill="#252D31" />
              <path fillRule="evenodd" clipRule="evenodd" d="M21.5 14.5H18.6079C18.9108 13.2975 20.0028 12.4193 21.2537 12.4193C22.5046 12.4193 23.5965 13.2975 23.8995 14.5H21.5ZM22.173 11.3666C21.6552 10.8897 20.9611 10.5833 20.1784 10.5833C19.3958 10.5833 18.7016 10.8897 18.1839 11.3666L18.1839 11.3666C17.6662 11.8435 17.3398 12.4983 17.3398 13.2393C17.3398 13.9802 17.6662 14.6351 18.1839 15.112L18.1839 15.112C18.7016 15.5889 19.3958 15.8952 20.1784 15.8952C20.9611 15.8952 21.6552 15.5889 22.173 15.112C22.6907 14.6351 23.0171 13.9802 23.0171 13.2393C23.0171 12.4983 22.6907 11.8435 22.173 11.3666L22.173 11.3666Z" fill="#20D4B4" />
              <path fillRule="evenodd" clipRule="evenodd" d="M13.5 8.5H10.6079C10.9108 7.2975 12.0028 6.41931 13.2537 6.41931C14.5046 6.41931 15.5965 7.2975 15.8995 8.5H13.5ZM14.173 5.3666C13.6552 4.88972 12.9611 4.58333 12.1784 4.58333C11.3958 4.58333 10.7016 4.88972 10.1839 5.3666L10.1839 5.3666C9.66619 5.84349 9.33984 6.49828 9.33984 7.23926C9.33984 7.98023 9.66619 8.63502 10.1839 9.1119L10.1839 9.1119C10.7016 9.58878 11.3958 9.89517 12.1784 9.89517C12.9611 9.89517 13.6552 9.58878 14.173 9.1119C14.6907 8.63502 15.0171 7.98023 15.0171 7.23926C15.0171 6.49828 14.6907 5.84349 14.173 5.3666L14.173 5.3666Z" fill="#20D4B4" />
              <path d="M17.3398 7.23926C17.3398 5.67627 18.6688 4.41431 20.3107 4.41431C21.9527 4.41431 23.2816 5.67627 23.2816 7.23926V8.93953H24.6376V7.23926C24.6376 4.95696 22.7004 3.10596 20.3107 3.10596C17.9211 3.10596 15.9839 4.95696 15.9839 7.23926V11.3666H17.3398V7.23926Z" fill="#20D4B4" />
              <path d="M9.33984 13.2393C9.33984 11.6763 10.6688 10.4143 12.3107 10.4143C13.9527 10.4143 15.2816 11.6763 15.2816 13.2393V14.9395H16.6376V13.2393C16.6376 10.957 14.7004 9.10596 12.3107 9.10596C9.92109 9.10596 7.98389 10.957 7.98389 13.2393V17.3666H9.33984V13.2393Z" fill="#20D4B4" />
            </svg>
            <svg className="h-5 mt-1.5" viewBox="0 0 31 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.04297 9.63281H5.00391L7.85938 0.695312H10.2227L13.082 9.63281H11.043L9.07422 2.89062H9.00781L7.04297 9.63281ZM6.89062 5.93359H11.1797V7.44922H6.89062V5.93359Z" fill="#777E90" />
              <path d="M14.6055 9.63281L16.3594 0.695312H18.4805L16.7266 9.63281H14.6055ZM19.1211 9.63281L20.875 0.695312H22.9922L21.2422 9.63281H19.1211Z" fill="#777E90" />
              <path d="M23.0859 9.63281L25.9453 0.695312H28.3047L31.1602 9.63281H29.1211L27.1523 2.89062H26.0977L24.1289 9.63281H23.0859ZM23.9336 5.93359H28.2227V7.44922H23.9336V5.93359Z" fill="#777E90" />
            </svg>
            <svg className="h-6 mt-1" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18.3515 1.29517C17.3847 0.328691 16.0153 0.500559 15.3322 1.18371C14.6492 1.86685 14.9201 2.54295 15.1506 2.88988C15.381 3.2368 18.318 5.89874 18.318 5.89874C18.318 5.89874 19.3183 2.26165 18.3515 1.29517Z" fill="#F01F1F" />
              <path fillRule="evenodd" clipRule="evenodd" d="M16.5895 14.4441C17.8119 14.4441 18.8074 13.4686 18.8074 12.2703C18.8074 11.0719 17.8119 10.0964 16.5895 10.0964C15.3671 10.0964 14.3716 11.0719 14.3716 12.2703C14.3716 13.4686 15.3671 14.4441 16.5895 14.4441Z" fill="#F01F1F" />
              <path fillRule="evenodd" clipRule="evenodd" d="M15.452 7.01173C15.452 7.01173 15.0208 6.58016 14.7755 6.3349C14.5303 6.08963 14.1661 6.1727 14.1661 6.1727L1.72671 9.69239L3.45455 11.4202L15.452 7.01173Z" fill="#F01F1F" />
              <path fillRule="evenodd" clipRule="evenodd" d="M15.3368 7.55926L3.61424 11.5678L4.17172 13.9265L15.6312 8.24239L15.3368 7.55926Z" fill="#F01F1F" />
              <path fillRule="evenodd" clipRule="evenodd" d="M7.39894 0.5C6.17652 0.5 5.18103 1.47548 5.18103 2.69791C5.18103 3.92033 6.17652 4.89581 7.39894 4.89581C8.62136 4.89581 9.61684 3.92033 9.61684 2.69791C9.61684 1.47548 8.62136 0.5 7.39894 0.5Z" fill="#F01F1F" />
              <path fillRule="evenodd" clipRule="evenodd" d="M6.72693 8.77447L2.69287 10.0362L0.5 11.3713L1.65578 13.9999L4.49989 13.0845L7.91882 11.401L6.72693 8.77447Z" fill="#F01F1F" />
              <path fillRule="evenodd" clipRule="evenodd" d="M12.6317 1.08313L8.0918 3.05277L6.17188 6.17319L9.41168 9.41299L12.2845 7.41485L15.452 5.1236L12.6317 1.08313Z" fill="#F01F1F" />
            </svg>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PremiumFeaturesModal;
