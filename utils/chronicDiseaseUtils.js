/**
 * Chronic Disease Management Utilities
 * Provides recommendations, medication guidelines, and pricing for chronic patients
 */

const DISEASE_TYPES = {
  DIABETES: 'diabetes',
  BP: 'bp',
  HEART: 'heart'
};

const DISEASE_SEVERITY = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe'
};

const MEDICINE_RECOMMENDATIONS = {
  diabetes: {
    mild: [
      { name: 'Metformin', dosage: '500mg', frequency: 'twice-daily', notes: 'After meals' },
      { name: 'Glibenclamide', dosage: '5mg', frequency: 'once-daily', notes: 'Morning after breakfast' },
      { name: 'Pioglitazone', dosage: '15mg', frequency: 'once-daily', notes: 'Any time' }
    ],
    moderate: [
      { name: 'Metformin', dosage: '1000mg', frequency: 'twice-daily', notes: 'After meals' },
      { name: 'Insulin Glargine', dosage: 'Variable', frequency: 'once-daily', notes: 'Evening injection' },
      { name: 'Glibenclamide', dosage: '10mg', frequency: 'twice-daily', notes: 'Before meals' }
    ],
    severe: [
      { name: 'Insulin Aspart', dosage: 'Per prescription', frequency: 'thrice-daily', notes: 'Before meals' },
      { name: 'Insulin Glargine', dosage: 'Per prescription', frequency: 'once-daily', notes: 'Evening' },
      { name: 'Metformin', dosage: '1500mg', frequency: 'thrice-daily', notes: 'After meals' }
    ]
  },
  bp: {
    mild: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'once-daily', notes: 'Morning' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'once-daily', notes: 'Morning' },
      { name: 'Hydrochlorothiazide', dosage: '12.5mg', frequency: 'once-daily', notes: 'Morning' }
    ],
    moderate: [
      { name: 'Amlodipine', dosage: '10mg', frequency: 'once-daily', notes: 'Morning' },
      { name: 'Lisinopril', dosage: '20mg', frequency: 'once-daily', notes: 'Morning' },
      { name: 'Atenolol', dosage: '50mg', frequency: 'once-daily', notes: 'Morning' }
    ],
    severe: [
      { name: 'Amlodipine', dosage: '10mg', frequency: 'once-daily', notes: 'Morning' },
      { name: 'Lisinopril', dosage: '40mg', frequency: 'once-daily', notes: 'Morning' },
      { name: 'Atenolol', dosage: '100mg', frequency: 'twice-daily', notes: 'Morning and evening' }
    ]
  },
  heart: {
    mild: [
      { name: 'Aspirin', dosage: '75mg', frequency: 'once-daily', notes: 'After breakfast' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'once-daily', notes: 'Evening' },
      { name: 'Ramipril', dosage: '2.5mg', frequency: 'once-daily', notes: 'Morning' }
    ],
    moderate: [
      { name: 'Aspirin', dosage: '150mg', frequency: 'once-daily', notes: 'After breakfast' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'once-daily', notes: 'Evening' },
      { name: 'Ramipril', dosage: '5mg', frequency: 'once-daily', notes: 'Morning' },
      { name: 'Bisoprolol', dosage: '5mg', frequency: 'once-daily', notes: 'Morning' }
    ],
    severe: [
      { name: 'Aspirin', dosage: '100mg', frequency: 'twice-daily', notes: 'After meals' },
      { name: 'Atorvastatin', dosage: '80mg', frequency: 'once-daily', notes: 'Evening' },
      { name: 'Ramipril', dosage: '10mg', frequency: 'once-daily', notes: 'Morning' },
      { name: 'Bisoprolol', dosage: '10mg', frequency: 'once-daily', notes: 'Morning' }
    ]
  }
};

const PRICING = {
  diabetes: {
    mild: 499, // Monthly price in rupees
    moderate: 799,
    severe: 1299
  },
  bp: {
    mild: 399,
    moderate: 699,
    severe: 1099
  },
  heart: {
    mild: 599,
    moderate: 999,
    severe: 1499
  }
};

const DIETARY_GUIDELINES = {
  diabetes: {
    do: [
      'Eat whole grains and high-fiber foods',
      'Include lean proteins',
      'Choose low-fat dairy products',
      'Eat vegetables (non-starchy)',
      'Drink plenty of water',
      'Limit portion sizes'
    ],
    avoid: [
      'Sugary drinks and foods',
      'Refined white bread and rice',
      'Fast food and fried items',
      'Saturated fats',
      'Processed foods',
      'High-salt foods'
    ]
  },
  bp: {
    do: [
      'Reduce sodium intake',
      'Include potassium-rich foods (banana, spinach)',
      'Eat lean meats',
      'Choose whole grains',
      'Eat fresh fruits and vegetables',
      'Limit caffeine and alcohol'
    ],
    avoid: [
      'High-salt processed foods',
      'Canned items (unless low-sodium)',
      'High-fat meats',
      'Pickle and preserved foods',
      'Excess alcohol',
      'High-sodium fast food'
    ]
  },
  heart: {
    do: [
      'Include omega-3 rich foods (fish, nuts)',
      'Eat whole grains',
      'Choose lean proteins',
      'Include fiber-rich foods',
      'Eat fresh fruits and vegetables (especially colorful)',
      'Use olive oil'
    ],
    avoid: [
      'Trans fats and fried foods',
      'High-cholesterol foods',
      'Excess salt',
      'Sugary foods and drinks',
      'High-fat meats',
      'Processed foods'
    ]
  }
};

const EXERCISE_RECOMMENDATIONS = {
  diabetes: {
    type: 'Moderate aerobic activity + Strength training',
    duration: '150 minutes per week',
    details: [
      'Brisk walking 30-40 minutes, 5 days a week',
      'Swimming or cycling 2-3 times a week',
      'Muscle training 2 days a week',
      'Avoid prolonged sitting'
    ]
  },
  bp: {
    type: 'Aerobic exercises',
    duration: '150 minutes per week',
    details: [
      'Brisk walking 30-40 minutes daily',
      'Swimming or cycling 3-4 times a week',
      'Yoga and stretching 3 times a week',
      'Avoid heavy weight lifting'
    ]
  },
  heart: {
    type: 'Moderate aerobic activity',
    duration: '150 minutes per week',
    details: [
      'Walking 30 minutes, 5 days a week',
      'Light swimming or cycling',
      'Yoga and breathing exercises',
      'Avoid sudden intense exercises',
      'Always warm up and cool down'
    ]
  }
};

const MONITORING_FREQUENCY = {
  diabetes: {
    bloodSugarCheck: 'Daily (fasting & post-meal)',
    doctorVisit: 'Every 3 months',
    labTest: 'Every 6 months (HbA1c)'
  },
  bp: {
    bpCheck: 'Daily or alternate days',
    doctorVisit: 'Every 2 months',
    labTest: 'Every 6 months'
  },
  heart: {
    checkup: 'Every month',
    doctorVisit: 'Every month',
    ecg: 'Every 6 months',
    stressTest: 'Every year'
  }
};

module.exports = {
  DISEASE_TYPES,
  DISEASE_SEVERITY,
  MEDICINE_RECOMMENDATIONS,
  PRICING,
  DIETARY_GUIDELINES,
  EXERCISE_RECOMMENDATIONS,
  MONITORING_FREQUENCY,

  /**
   * Get medicine recommendations based on disease and severity
   */
  getMedicineRecommendations: (disease, severity = 'moderate') => {
    return MEDICINE_RECOMMENDATIONS[disease]?.[severity] || [];
  },

  /**
   * Get pricing for disease and severity combination
   */
  getPrice: (disease, severity = 'moderate') => {
    return PRICING[disease]?.[severity] || 0;
  },

  /**
   * Get dietary guidelines
   */
  getDietaryGuidelines: (disease) => {
    return DIETARY_GUIDELINES[disease] || { do: [], avoid: [] };
  },

  /**
   * Get exercise recommendations
   */
  getExerciseRecommendations: (disease) => {
    return EXERCISE_RECOMMENDATIONS[disease] || {};
  },

  /**
   * Get monitoring frequency
   */
  getMonitoringFrequency: (disease) => {
    return MONITORING_FREQUENCY[disease] || {};
  },

  /**
   * Calculate next delivery date based on frequency
   */
  calculateNextDeliveryDate: (frequency = 'monthly') => {
    const now = new Date();
    const next = new Date(now);
    
    switch (frequency) {
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'half-yearly':
        next.setMonth(next.getMonth() + 6);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    return next;
  },

  /**
   * Get disease details for patient education
   */
  getDiseaseInfo: (disease) => {
    const info = {
      diabetes: {
        name: 'Diabetes Mellitus',
        description: 'A metabolic disorder where blood glucose levels are abnormally high',
        types: 'Type 1, Type 2, Gestational',
        complications: 'Heart disease, kidney damage, eye problems, nerve damage',
        prevention: 'Regular exercise, healthy diet, weight management, stress management'
      },
      bp: {
        name: 'Hypertension (High Blood Pressure)',
        description: 'Condition where blood pressure is consistently 140/90 mmHg or higher',
        types: 'Primary, Secondary',
        complications: 'Stroke, heart attack, kidney failure',
        prevention: 'Low-salt diet, exercise, stress management, weight control'
      },
      heart: {
        name: 'Cardiovascular Disease',
        description: 'Disorders affecting heart and blood vessels',
        types: 'CAD, Heart Failure, Arrhythmia',
        complications: 'Heart attack, stroke, sudden cardiac death',
        prevention: 'Healthy diet, exercise, quit smoking, stress reduction'
      }
    };
    return info[disease] || {};
  }
};
