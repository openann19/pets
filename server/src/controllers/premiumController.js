const User = require('../models/User');
const Pet = require('../models/Pet');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create a subscription checkout session
// @route   POST /api/premium/subscribe
// @access  Private
const subscribeToPremium = async (req, res) => {
    try {
        const { plan, interval } = req.body;
        const user = await User.findById(req.userId);

        const priceId = process.env[`STRIPE_${(plan || 'premium').toUpperCase()}_${(interval || 'MONTH').toUpperCase()}_PRICE_ID`];
        if (!priceId) {
            return res.status(400).json({ success: false, message: 'Invalid plan or interval' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            customer_email: user.email,
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
            metadata: {
                userId: req.userId.toString(),
            }
        });

        res.json({ success: true, data: { sessionId: session.id, url: session.url } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Cancel a subscription
// @route   POST /api/premium/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user.premium.stripeSubscriptionId) {
            return res.status(400).json({ success: false, message: 'No active subscription found' });
        }

        await stripe.subscriptions.del(user.premium.stripeSubscriptionId);

        user.premium.isActive = false;
        user.premium.plan = 'basic';
        user.premium.stripeSubscriptionId = undefined;
        user.premium.expiresAt = new Date();
        await user.save();

        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get available premium features
// @route   GET /api/premium/features
// @access  Public
const getPremiumFeatures = (req, res) => {
    // This could be dynamic based on a config file or database
    const features = {
        premium: ['Unlimited Likes', 'See Who Liked You', '5 Free Super Likes per week', '1 Free Boost per month'],
        gold: ['All Premium features', 'Priority Likes', 'Top Picks for you', 'Message before matching']
    };
    res.json({ success: true, data: { features } });
};

// @desc    Boost a pet's profile
// @route   POST /api/premium/boost/:petId
// @access  Private
const boostProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user.premium.isActive) {
            return res.status(403).json({ success: false, message: 'This feature is for premium users only' });
        }

        const pet = await Pet.findOne({ _id: req.params.petId, owner: req.userId });
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }

        // Logic for boost count would be here (e.g., check if user has boosts left)
        pet.featured.isFeatured = true;
        pet.featured.featuredUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour boost
        await pet.save();

        res.json({ success: true, message: 'Profile boosted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get user's super like balance
// @route   GET /api/premium/super-likes
// @access  Private
const getSuperLikes = (req, res) => {
    // Placeholder logic
    res.json({ success: true, data: { superLikes: 5 } });
};

const reactivateSubscription = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Placeholder logic for reactivating subscription
        res.json({ 
            success: true, 
            message: 'Subscription reactivated successfully',
            data: { 
                userId,
                status: 'active',
                reactivatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Reactivate subscription error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to reactivate subscription' 
        });
    }
};

const getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Placeholder logic for getting subscription status
        res.json({ 
            success: true, 
            data: { 
                userId,
                status: 'active',
                plan: 'premium',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
        });
    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get subscription status' 
        });
    }
};

const updatePaymentMethod = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Placeholder logic for updating payment method
        res.json({ 
            success: true, 
            message: 'Payment method updated successfully',
            data: { userId }
        });
    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update payment method' 
        });
    }
};

const getBillingHistory = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Placeholder logic for getting billing history
        res.json({ 
            success: true, 
            data: { 
                userId,
                history: [
                    { date: new Date(), amount: 9.99, status: 'paid' }
                ]
            }
        });
    } catch (error) {
        console.error('Get billing history error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get billing history' 
        });
    }
};

const getUsageStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Placeholder logic for getting usage stats
        res.json({ 
            success: true, 
            data: { 
                userId,
                superLikesUsed: 2,
                superLikesRemaining: 3,
                profileBoostsUsed: 1,
                profileBoostsRemaining: 4
            }
        });
    } catch (error) {
        console.error('Get usage stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get usage stats' 
        });
    }
};

const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.userId;
        const { planId } = req.body;
        
        // Placeholder logic for creating checkout session
        res.json({ 
            success: true, 
            data: { 
                userId,
                planId,
                sessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9),
                url: 'https://checkout.stripe.com/pay/cs_test_123'
            }
        });
    } catch (error) {
        console.error('Create checkout session error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create checkout session' 
        });
    }
};

const handleWebhook = async (req, res) => {
    try {
        // Placeholder logic for handling webhooks
        res.json({ 
            success: true, 
            message: 'Webhook processed successfully'
        });
    } catch (error) {
        console.error('Handle webhook error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process webhook' 
        });
    }
};

const getPlans = async (req, res) => {
    try {
        // Placeholder logic for getting plans
        res.json({ 
            success: true, 
            data: { 
                plans: [
                    { id: 'basic', name: 'Basic', price: 4.99, features: ['Basic matching'] },
                    { id: 'premium', name: 'Premium', price: 9.99, features: ['Advanced matching', 'Super likes'] },
                    { id: 'vip', name: 'VIP', price: 19.99, features: ['All features', 'Priority support'] }
                ]
            }
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get plans' 
        });
    }
};

const upgradePlan = async (req, res) => {
    try {
        const userId = req.userId;
        const { newPlanId } = req.body;
        
        // Placeholder logic for upgrading plan
        res.json({ 
            success: true, 
            message: 'Plan upgraded successfully',
            data: { 
                userId,
                newPlanId,
                upgradedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Upgrade plan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to upgrade plan' 
        });
    }
};

const downgradePlan = async (req, res) => {
    try {
        const userId = req.userId;
        const { newPlanId } = req.body;
        
        // Placeholder logic for downgrading plan
        res.json({ 
            success: true, 
            message: 'Plan downgraded successfully',
            data: { 
                userId,
                newPlanId,
                downgradedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Downgrade plan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to downgrade plan' 
        });
    }
};

module.exports = {
    subscribeToPremium,
    cancelSubscription,
    getPremiumFeatures,
    boostProfile,
    getSuperLikes,
    reactivateSubscription,
    getSubscriptionStatus,
    updatePaymentMethod,
    getBillingHistory,
    getUsageStats,
    createCheckoutSession,
    handleWebhook,
    getPlans,
    upgradePlan,
    downgradePlan
};
