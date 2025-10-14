const User = require('../models/User');
const Pet = require('../models/Pet');
const logger = require('../utils/logger');

// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// @desc    Create a subscription checkout session
// @route   POST /api/premium/subscribe
// @access  Private
const subscribeToPremium = async (req, res) => {
    try {
        const { plan, interval } = req.body;
        const user = await User.findById(req.userId);

        const priceId = process.env[`STRIPE_${plan.toUpperCase()}_${interval.toUpperCase()}_PRICE_ID`];

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
const getSuperLikes = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate super likes based on subscription tier
        let superLikes = 0;
        
        if (user.premium.isActive) {
            const now = new Date();
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            
            // Count super likes used this week
            const superLikesUsedThisWeek = user.swipedPets.filter(swipe => 
                swipe.action === 'superlike' && 
                swipe.swipedAt >= weekStart
            ).length;

            // Determine super likes limit based on plan
            let weeklyLimit = 0;
            if (user.premium.plan === 'premium') {
                weeklyLimit = 5;
            } else if (user.premium.plan === 'gold') {
                weeklyLimit = 999999; // Unlimited
            }

            superLikes = Math.max(0, weeklyLimit - superLikesUsedThisWeek);
        }

        res.json({ 
            success: true, 
            data: { 
                superLikes,
                plan: user.premium.plan,
                isUnlimited: user.premium.plan === 'gold'
            } 
        });
    } catch (error) {
        logger.error('Error fetching super likes', { error });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get current user's subscription
// @route   GET /api/premium/subscription
// @access  Private
const getSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.premium.isActive) {
            return res.status(404).json({ success: false, message: 'No active subscription found' });
        }

        const subscription = {
            id: user.premium.stripeSubscriptionId || user._id.toString(),
            userId: user._id.toString(),
            tierId: user.premium.plan,
            status: user.premium.isActive ? 'active' : 'expired',
            startDate: user.createdAt,
            endDate: user.premium.expiresAt,
            stripeSubscriptionId: user.premium.stripeSubscriptionId,
        };

        res.json({ success: true, data: { subscription } });
    } catch (error) {
        logger.error('Error fetching subscription', { error });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get subscription usage statistics
// @route   GET /api/premium/usage
// @access  Private
const getUsage = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate usage for current period (week)
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        // Count swipes this week
        const swipesThisWeek = user.swipedPets.filter(swipe => 
            swipe.swipedAt >= weekStart
        ).length;

        // Count super likes this week
        const superLikesThisWeek = user.swipedPets.filter(swipe => 
            swipe.action === 'superlike' && 
            swipe.swipedAt >= weekStart
        ).length;

        // Determine limits based on plan
        let swipesLimit = 50; // Basic limit
        let superLikesLimit = 0;
        let boostsLimit = 0;

        if (user.premium.isActive) {
            if (user.premium.plan === 'premium') {
                swipesLimit = 999999; // Unlimited
                superLikesLimit = 5;
                boostsLimit = 1;
            } else if (user.premium.plan === 'gold') {
                swipesLimit = 999999; // Unlimited
                superLikesLimit = 999999; // Unlimited
                boostsLimit = 5;
            }
        }

        const usage = {
            swipesUsed: swipesThisWeek,
            swipesLimit,
            superLikesUsed: superLikesThisWeek,
            superLikesLimit,
            boostsUsed: 0, // Would need to track this separately
            boostsLimit,
            periodStart: weekStart.toISOString(),
            periodEnd: weekEnd.toISOString(),
        };

        res.json({ success: true, data: usage });
    } catch (error) {
        logger.error('Error fetching usage', { error });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reactivate a cancelled subscription
// @route   POST /api/premium/reactivate
// @access  Private
const reactivateSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user.premium.stripeSubscriptionId) {
            return res.status(400).json({ success: false, message: 'No subscription found to reactivate' });
        }

        // Update the subscription in Stripe to not cancel at period end
        const subscription = await stripe.subscriptions.update(
            user.premium.stripeSubscriptionId,
            { cancel_at_period_end: false }
        );

        user.premium.isActive = true;
        await user.save();

        res.json({ success: true, message: 'Subscription reactivated successfully' });
    } catch (error) {
        logger.error('Error reactivating subscription', { error });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    subscribeToPremium,
    cancelSubscription,
    getPremiumFeatures,
    boostProfile,
    getSuperLikes,
    getSubscription,
    getUsage,
    reactivateSubscription,
};
