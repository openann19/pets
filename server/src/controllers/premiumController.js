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
const getSuperLikes = (req, res) => {
    // Placeholder logic
    res.json({ success: true, data: { superLikes: 5 } });
};

module.exports = {
    subscribeToPremium,
    cancelSubscription,
    getPremiumFeatures,
    boostProfile,
    getSuperLikes
};
