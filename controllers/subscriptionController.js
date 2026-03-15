const { SubscriptionPlan, User } = require('../models');

// Fetch all available subscription plans (Shared endpoint)
const getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      order: [['price', 'ASC']],
    });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ success: false, message: 'Server error fetching plans' });
  }
};

// Admin: Create a new subscription plan
const createPlan = async (req, res) => {
  try {
    const { name, price, features, billingCycle } = req.body;

    const existingPlan = await SubscriptionPlan.findOne({ where: { name } });
    if (existingPlan) {
      return res.status(400).json({ success: false, message: 'A plan with this name already exists' });
    }

    const newPlan = await SubscriptionPlan.create({
      name,
      price,
      features,
      billingCycle
    });

    res.status(201).json({ success: true, message: 'Subscription plan created', data: newPlan });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ success: false, message: 'Server error creating plan' });
  }
};

// Admin: Update a subscription plan
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, features, billingCycle } = req.body;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    plan.name = name || plan.name;
    plan.price = price !== undefined ? price : plan.price;
    plan.features = features !== undefined ? features : plan.features;
    plan.billingCycle = billingCycle || plan.billingCycle;

    await plan.save();

    res.status(200).json({ success: true, message: 'Subscription plan updated', data: plan });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ success: false, message: 'Server error updating plan' });
  }
};

// Admin: Delete a subscription plan
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Unassign this plan from all users before deleting
    await User.update(
      { subscriptionPlanId: null },
      { where: { subscriptionPlanId: id } }
    );

    await plan.destroy();

    res.status(200).json({ success: true, message: 'Subscription plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ success: false, message: 'Server error deleting plan' });
  }
};

// Owner: Select or switch to a subscription plan
const selectPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'The selected plan does not exist' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
         return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.subscriptionPlanId = plan.id;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `Successfully subscribed to the ${plan.name} plan`,
      data: { planId: plan.id, planName: plan.name }
    });
  } catch (error) {
    console.error('Error selecting plan:', error);
    res.status(500).json({ success: false, message: 'Server error selecting plan' });
  }
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  selectPlan
};
