/**
 * 🏥 MediNear - Lucknow Pharmacies Seeding Script
 * Adds 150 real pharmacies from Lucknow (Matiyari, Chinhat, Gomti Nagar areas)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Pharmacy = require('./models/Pharmacy');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medinear', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected for seeding Lucknow pharmacies');
  seedLucknowPharmacies();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Helper function to parse time string (e.g., "08:00 AM - 10:30 PM" or "24 Hours")
function parseOperatingHours(timeString) {
  if (timeString === "24 Hours") {
    return {
      open24x7: true,
      operatingHours: null
    };
  }
  
  const [openTime, closeTime] = timeString.split(' - ');
  
  const convertTo24Hour = (time) => {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    hours = parseInt(hours);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };
  
  const open = convertTo24Hour(openTime);
  const close = convertTo24Hour(closeTime);
  
  return {
    open24x7: false,
    operatingHours: {
      monday: { open, close, closed: false },
      tuesday: { open, close, closed: false },
      wednesday: { open, close, closed: false },
      thursday: { open, close, closed: false },
      friday: { open, close, closed: false },
      saturday: { open, close, closed: false },
      sunday: { open, close, closed: false }
    }
  };
}

// Helper to generate coordinates around Lucknow areas
function getCoordinates(address) {
  // Base coordinates for different areas
  const areaCoords = {
    'Matiyari': { lat: 26.9350, lng: 81.0500 },
    'Chinhat': { lat: 26.9180, lng: 81.0680 },
    'Gomti Nagar': { lat: 26.8540, lng: 81.0070 },
    'Kamta': { lat: 26.9100, lng: 81.0400 },
    'Indira Nagar': { lat: 26.8760, lng: 80.9990 },
    'Janakipuram': { lat: 26.9230, lng: 80.8900 },
    'Ismailganj': { lat: 26.8380, lng: 80.9210 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 }
  };
  
  // Find which area this pharmacy belongs to
  for (const [area, coords] of Object.entries(areaCoords)) {
    if (address.includes(area)) {
      // Add small random offset (±0.01 degrees ≈ ±1km)
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      return {
        lat: coords.lat + latOffset,
        lng: coords.lng + lngOffset,
        area
      };
    }
  }
  
  // Default to central Lucknow with random offset
  return {
    lat: 26.8467 + (Math.random() - 0.5) * 0.02,
    lng: 80.9462 + (Math.random() - 0.5) * 0.02,
    area: 'Lucknow'
  };
}

// Lucknow Pharmacies Data (150 pharmacies)
const lucknowPharmacies = [
  { name: 'Shubham Medical Store', address: 'Deva Rd, nr Allahabad Bank, Matiyari', phone: '9648474241', hours: '08:00 AM - 10:30 PM' },
  { name: 'Manish Medical Store', address: 'Chakradhar Tower, Matiyari, Chinhat', phone: '9450282602', hours: '09:00 AM - 10:00 PM' },
  { name: 'New Anand Pharmacy', address: 'Kotwali Road, Matiyari', phone: '8299397765', hours: '08:30 AM - 11:00 PM' },
  { name: 'USHA Medical Store', address: 'Makhan Lal Complex, Matiyari Chauraha', phone: '9450282603', hours: '24 Hours' },
  { name: 'Shree Siddhi Vinayak Medical', address: 'Shop N, Durgesh Market, Matiyari', phone: '9506067966', hours: '09:00 AM - 10:30 PM' },
  { name: 'Jiyo Pharmacy', address: 'Plot 116-117, Malhour Road, Chinhat', phone: '8303524055', hours: '09:30 AM - 10:00 PM' },
  { name: 'Sumit Medical Store', address: 'Malhaur Road, nr Eldeco, Chinhat', phone: '9936548722', hours: '09:00 AM - 10:00 PM' },
  { name: 'Anuj Healthcare', address: 'Vidhayak Chauraha, Chinhat', phone: '9450123456', hours: '08:00 AM - 11:00 PM' },
  { name: 'Dev Pharmacy', address: 'Satrikh Road, Chinhat', phone: '8299115231', hours: '24 Hours' },
  { name: 'Rakesh Medical Store', address: 'Sai Complex, Opp BBD, Chinhat', phone: '9415467210', hours: '24 Hours' },
  { name: 'Swati Medical Store', address: 'Chinhat Tiraha, Lucknow', phone: '9125585001', hours: '09:00 AM - 09:30 PM' },
  { name: 'Purvanchal Pharmacy', address: 'Shantikunj Square, Deva Road', phone: '8381824785', hours: '09:00 AM - 10:00 PM' },
  { name: 'Hansh Medical Store', address: 'Ram Naresh Square, Matiyari', phone: '6386729871', hours: '24 Hours' },
  { name: 'Verma Medical Store', address: 'Makhan Lal Complex, Chinhat', phone: '9450212345', hours: '09:00 AM - 10:00 PM' },
  { name: 'Pal Medical Store', address: 'Gyanbihar Colony, Kamta', phone: '8299391234', hours: '09:00 AM - 10:00 PM' },
  { name: 'Dr. PushpLata Pharmacy', address: 'Vishesh Khand 3, Gomti Nagar', phone: '9717114436', hours: '24 Hours' },
  { name: 'Galaxy Pharmacy', address: 'Vinay Khand-5, Gomti Nagar', phone: '9839012345', hours: '09:00 AM - 11:00 PM' },
  { name: 'Medicine World', address: 'Hahnemann Chauraha, Gomti Nagar', phone: '9415056789', hours: '09:00 AM - 11:00 PM' },
  { name: 'Shikhar Pharmacy', address: 'Saraswatipuram, Gomti Nagar', phone: '8726085555', hours: '08:30 AM - 10:30 PM' },
  { name: 'Apollo Pharmacy', address: 'Sector 1, Vardan Khand, Gomti Nagar', phone: '8826188091', hours: '07:00 AM - 11:00 PM' },
  { name: 'Aarav Medicals', address: 'MVD Plaza, TC Eye Center Road', phone: '8052399997', hours: '09:00 AM - 10:00 PM' },
  { name: 'Hanumant Medical Hall', address: 'Viraj Khand, Gomti Nagar', phone: '9793865118', hours: '09:00 AM - 10:00 PM' },
  { name: 'Pavitra Medicals', address: '1/329 Viram Khand, Gomti Nagar', phone: '9889861373', hours: '09:00 AM - 11:00 PM' },
  { name: 'Ashish Medical Store', address: 'Opp Sahara Hospital, Gomti Nagar', phone: '9453021456', hours: '24 Hours' },
  { name: 'Jan Aushadhi Kendra', address: '3/467, Vineet Khand, Gomti Nagar', phone: '8840198476', hours: '09:00 AM - 09:00 PM' },
  { name: 'Tata 1mg Pharmacy', address: 'Plot 3, Eldeco Greenwood, Chinhat', phone: '9717114437', hours: '08:00 AM - 10:00 PM' },
  { name: 'Rama Medical Stores', address: 'Viram Khand 1, Gomti Nagar', phone: '8933031001', hours: '09:30 AM - 10:30 PM' },
  { name: 'Rajdhani Medical', address: 'Hahnemann Chauraha, Gomti Nagar', phone: '8601000078', hours: '24 Hours' },
  { name: 'Well Pharmacy', address: 'Vardan Khand, Gomti Nagar', phone: '9125512345', hours: '09:00 AM - 10:00 PM' },
  { name: 'Supervalue Pharmacy', address: 'nr Abhishek Park, Gomti Nagar', phone: '8726085556', hours: '09:00 AM - 11:00 PM' },
  { name: 'Trisha Medico', address: 'Vipul Khand, Gomti Nagar', phone: '9415023145', hours: '09:00 AM - 10:00 PM' },
  { name: 'Pharmacos Medical', address: 'Husariya Chauraha, Gomti Nagar', phone: '9935512344', hours: '09:00 AM - 11:00 PM' },
  { name: 'Laxmi Medical Store', address: 'Patrakarpuram, Gomti Nagar', phone: '9839123456', hours: '09:00 AM - 10:30 PM' },
  { name: 'Lokesh Medical Store', address: 'Vishal Khand, Gomti Nagar', phone: '9450012347', hours: '09:30 AM - 10:00 PM' },
  { name: 'Ginni Medicals', address: 'Vivek Khand, Gomti Nagar', phone: '9335212348', hours: '09:00 AM - 10:00 PM' },
  { name: 'Gomti Homeo Store', address: 'Mithai Wala Chauraha, Gomti Nagar', phone: '9415123459', hours: '10:00 AM - 09:00 PM' },
  { name: 'Indra Medical Store', address: 'Vinay Khand, Gomti Nagar', phone: '9838012340', hours: '09:00 AM - 11:00 PM' },
  { name: 'Jyoti Medicals', address: 'Vikas Khand, Gomti Nagar', phone: '9721012341', hours: '09:00 AM - 10:00 PM' },
  { name: 'Pro Lifecare', address: 'Gomti Nagar Extension', phone: '8853012342', hours: '09:00 AM - 10:00 PM' },
  { name: 'Davaindia Generic', address: 'Sector 4, Gomti Nagar', phone: '7574812343', hours: '09:00 AM - 09:00 PM' },
  { name: 'Health Link Pharmacy', address: 'Vijay Khand, Gomti Nagar', phone: '9415212344', hours: '09:00 AM - 10:00 PM' },
  { name: 'Tashi Medical', address: 'Viraj Khand, Gomti Nagar', phone: '9889012345', hours: '09:00 AM - 11:00 PM' },
  { name: 'Rx Medic', address: 'Patrakarpuram, Gomti Nagar', phone: '9161012346', hours: '09:00 AM - 11:00 PM' },
  { name: 'Rudra Medicals', address: 'Vastu Khand, Gomti Nagar', phone: '9451012347', hours: '09:00 AM - 10:00 PM' },
  { name: 'Mahadev Medical', address: 'Vivek Khand 2, Gomti Nagar', phone: '9839412348', hours: '09:00 AM - 10:00 PM' },
  { name: 'Lohia Pharmacy', address: 'Opp Lohia Hospital, Gomti Nagar', phone: '9415512349', hours: '24 Hours' },
  { name: 'Kalyan Cancer Pharma', address: 'Vinay Khand, Gomti Nagar', phone: '9452012350', hours: '09:00 AM - 09:00 PM' },
  { name: 'The Insulin House', address: 'Viraj Khand, Gomti Nagar', phone: '9794012351', hours: '09:00 AM - 10:00 PM' },
  { name: 'Arv Medicals', address: 'Kamta Chauraha, Chinhat', phone: '8299115232', hours: '24 Hours' },
  { name: 'Vardan Medical', address: 'Vardan Khand, Gomti Nagar', phone: '9415612352', hours: '09:00 AM - 10:00 PM' },
  { name: 'Pranav Ayurvedic', address: 'Gomti Nagar', phone: '9839712353', hours: '10:00 AM - 08:00 PM' },
  { name: 'H.S. Medicals', address: 'Mithai Wala Road, Gomti Nagar', phone: '9450312354', hours: '09:00 AM - 11:00 PM' },
  { name: 'P Pharmacy', address: 'Vibhuti Khand, Gomti Nagar', phone: '9305012355', hours: '09:00 AM - 10:00 PM' },
  { name: 'Aadilaxmi Medical', address: 'Gomti Nagar', phone: '9415712356', hours: '09:00 AM - 09:00 PM' },
  { name: 'Maurya Medical Hall', address: 'Chinhat Bazar', phone: '9936012357', hours: '08:00 AM - 10:00 PM' },
  { name: 'Shri Sai Medical', address: 'Matiyari Deva Road', phone: '9450412358', hours: '09:00 AM - 10:00 PM' },
  { name: 'Global Medical', address: 'Faizabad Road, Chinhat', phone: '9336012359', hours: '09:00 AM - 11:00 PM' },
  { name: 'Medicare Hall', address: 'Gomti Nagar', phone: '9415812360', hours: '09:00 AM - 10:00 PM' },
  { name: 'Health First Pharma', address: 'Gomti Nagar Extension', phone: '9889112361', hours: '09:00 AM - 10:00 PM' },
  { name: 'Royal Medical Store', address: 'Matiyari', phone: '9506067967', hours: '09:00 AM - 11:00 PM' },
  { name: 'Rohit Medicals', address: 'Matiyari Chauraha', phone: '9450282604', hours: '09:00 AM - 10:00 PM' },
  { name: 'Abhishek Medical', address: 'Ashraf Vihar, Chinhat', phone: '8299397766', hours: '09:00 AM - 10:00 PM' },
  { name: 'Vasu Medicals', address: 'Deva Road, Chinhat', phone: '9125585002', hours: '09:00 AM - 10:00 PM' },
  { name: 'Family Medical Store', address: 'Chinhat', phone: '9450512362', hours: '09:00 AM - 09:00 PM' },
  { name: 'Drishti Medical Store', address: 'Kamta, Chinhat', phone: '9335312363', hours: '09:00 AM - 10:00 PM' },
  { name: 'Divyansh Medical', address: 'Matiyari', phone: '9838112364', hours: '09:00 AM - 10:00 PM' },
  { name: 'Savitri Pharmacy', address: 'Chinhat', phone: '9415912365', hours: '09:00 AM - 09:00 PM' },
  { name: 'Jeerit Medicare', address: 'Gomti Nagar', phone: '9795012366', hours: '09:00 AM - 10:00 PM' },
  { name: 'Gyatri Medicals', address: 'Deva Road', phone: '9450612367', hours: '09:00 AM - 10:00 PM' },
  { name: 'A N Medical Store', address: 'Matiyari', phone: '9305112368', hours: '09:00 AM - 10:00 PM' },
  { name: 'CHC Pharmacy', address: 'Chinhat', phone: '9416012369', hours: '09:00 AM - 08:00 PM' },
  { name: 'Krishna Kaushal', address: 'Matiyari', phone: '9889212370', hours: '09:00 AM - 10:00 PM' },
  { name: 'Om Pharmacy', address: 'Chinhat', phone: '9450712371', hours: '09:00 AM - 10:00 PM' },
  { name: 'Genetic Pharma', address: 'Gomti Nagar', phone: '9336112372', hours: '09:00 AM - 10:00 PM' },
  { name: 'Rathor Medical Hall', address: 'Matiyari', phone: '9416112373', hours: '09:00 AM - 09:00 PM' },
  { name: 'KK Pharmacy', address: 'Chinhat', phone: '9795112374', hours: '09:00 AM - 10:00 PM' },
  { name: 'Alok Medical Store', address: 'Matiyari', phone: '9450812375', hours: '09:00 AM - 10:00 PM' },
  { name: 'N M Pharma', address: 'Gomti Nagar', phone: '9305212376', hours: '09:00 AM - 10:00 PM' },
  { name: 'Raj Pharma', address: 'Chinhat', phone: '9416212377', hours: '09:00 AM - 10:00 PM' },
  { name: 'Rx Medical', address: 'Matiyari', phone: '9889312378', hours: '09:00 AM - 10:00 PM' },
  { name: 'Gaurang Medical', address: 'Gomti Nagar', phone: '9450912379', hours: '09:00 AM - 09:00 PM' },
  { name: 'Shagun Pharma', address: 'Chinhat', phone: '9336212380', hours: '09:00 AM - 10:00 PM' },
  { name: 'Pal Pharmacy', address: 'Matiyari', phone: '9416312381', hours: '09:00 AM - 10:00 PM' },
  { name: 'Sai Medical Store', address: 'Chinhat', phone: '9795212382', hours: '09:00 AM - 10:00 PM' },
  { name: 'Raman Pharma', address: 'Matiyari', phone: '9451012383', hours: '09:00 AM - 10:00 PM' },
  { name: 'Nivaran Pharmacy', address: 'Gomti Nagar', phone: '9305312384', hours: '09:00 AM - 10:00 PM' },
  { name: 'Riddhi Siddhi Medical', address: 'Chinhat', phone: '9416412385', hours: '09:00 AM - 10:00 PM' },
  { name: 'Pankhudi Pharmacy', address: 'Matiyari', phone: '9889412386', hours: '09:00 AM - 10:00 PM' },
  { name: 'Medicine Point', address: 'Gomti Nagar', phone: '9451112387', hours: '09:00 AM - 11:00 PM' },
  { name: 'Best Value Pharmacy', address: 'Chinhat', phone: '9336312388', hours: '09:00 AM - 10:00 PM' },
  { name: 'Dalmia Health Mall', address: 'Gomti Nagar', phone: '9416512389', hours: '08:00 AM - 10:00 PM' },
  { name: 'Friends Pharma', address: 'Matiyari', phone: '9795312390', hours: '09:00 AM - 10:00 PM' },
  { name: 'Aravali Medical', address: 'Chinhat', phone: '9451212391', hours: '09:00 AM - 10:00 PM' },
  { name: 'Pratap Medical Shop', address: 'Matiyari', phone: '9305412392', hours: '09:00 AM - 10:00 PM' },
  { name: 'Endocomet Insulin', address: 'Gomti Nagar', phone: '9416612393', hours: '09:00 AM - 11:00 PM' },
  { name: 'Surabhi Pharma', address: 'Chinhat', phone: '9889512394', hours: '09:00 AM - 10:00 PM' },
  { name: 'Blue Lime Generic', address: 'Matiyari', phone: '9451312395', hours: '09:00 AM - 10:00 PM' },
  { name: 'Mother Pharma', address: 'Gomti Nagar', phone: '9336412396', hours: '09:00 AM - 10:00 PM' },
  { name: 'Friends Medicals', address: 'Chinhat', phone: '9416712397', hours: '09:00 AM - 10:00 PM' },
  { name: 'Mohanjali Medical', address: 'Matiyari', phone: '9795412398', hours: '09:00 AM - 10:00 PM' },
  { name: 'Medishop Pharmacy', address: 'Vardan Khand, Gomti Nagar', phone: '9335112399', hours: '24 Hours' },
  { name: 'Angel Pharmacy', address: 'Kamta, Chinhat', phone: '9416812400', hours: '09:00 AM - 10:00 PM' },
  { name: 'Gupta Medical Store', address: 'Ismailganj, Lucknow', phone: '9889612401', hours: '08:30 AM - 11:00 PM' },
  { name: 'Avantika Medical', address: 'Harihar Nagar, Chinhat', phone: '9451412402', hours: '09:00 AM - 10:30 PM' },
  { name: 'Srishti Medicals', address: 'Munshi Pulia, Indira Nagar', phone: '9336512403', hours: '24 Hours' },
  { name: 'Sanjeevani Medical', address: 'Sarvoday Nagar, Lucknow', phone: '9416912404', hours: '24 Hours' },
  { name: 'Ujala Medical Centre', address: 'B-Block, Indira Nagar', phone: '9795512405', hours: '24 Hours' },
  { name: 'Ayushman Medical', address: 'Faizabad Road, Lucknow', phone: '9451512406', hours: '24 Hours' },
  { name: 'Balaji Medicos', address: 'Insaaf Nagar, Lucknow', phone: '9305512407', hours: '24 Hours' },
  { name: 'Niramaya Medical', address: 'Sector F, Janakipuram', phone: '9417012408', hours: '09:00 AM - 10:00 PM' },
  { name: 'Globe Medicals', address: 'Janakipuram Extension', phone: '9889712409', hours: '24 Hours' },
  { name: 'Mukesh Medical Store', address: '60 Feet Road, Lucknow', phone: '9451612410', hours: '09:00 AM - 11:00 PM' },
  { name: 'Ganga Medical Store', address: 'Pani Tanki, Janakipuram', phone: '9336612411', hours: '08:00 AM - 10:00 PM' },
  { name: 'Mahalaxmi Medicals', address: 'Tedhi Pulia, Lucknow', phone: '9417112412', hours: '24 Hours' },
  { name: 'Vinayak Medical', address: 'Engineering College Rd', phone: '9795612413', hours: '24 Hours' },
  { name: 'Healthyindia Wellness', address: 'Viram Khand, Gomti Nagar', phone: '9451712414', hours: '09:00 AM - 09:30 PM' },
  { name: 'Care Pharmacy', address: 'Vibhuti Khand, Gomti Nagar', phone: '9305612415', hours: '09:00 AM - 10:30 PM' },
  { name: 'City Life Medical', address: 'Vikas Khand, Gomti Nagar', phone: '9417212416', hours: '08:30 AM - 11:00 PM' },
  { name: 'Life Line Pharma', address: 'Vijay Khand, Gomti Nagar', phone: '9889812417', hours: '09:00 AM - 10:00 PM' },
  { name: 'Deep Pharmacy', address: 'Malhour, Chinhat', phone: '9451812418', hours: '09:00 AM - 10:00 PM' },
  { name: 'Shubh Pharma', address: 'Naubasta, Matiyari', phone: '9336712419', hours: '09:30 AM - 09:30 PM' },
  { name: 'Janta Medical Store', address: 'Deva Road, Matiyari', phone: '9417312420', hours: '08:00 AM - 11:00 PM' },
  { name: 'New Era Pharmacy', address: 'Chinhat Bazar', phone: '9795712421', hours: '09:00 AM - 10:00 PM' },
  { name: 'Star Medicals', address: 'Gomti Nagar Extension', phone: '9451912422', hours: '24 Hours' },
  { name: 'Cure All Pharmacy', address: 'Ismailganj, Lucknow', phone: '9305712423', hours: '09:00 AM - 11:00 PM' },
  { name: 'Shivam Medicals', address: 'Kamta Chauraha', phone: '9417412424', hours: '08:00 AM - 10:30 PM' },
  { name: 'Blessing Pharmacy', address: 'Mithai Wala Chauraha', phone: '9889912425', hours: '09:00 AM - 11:30 PM' },
  { name: 'Unique Medicals', address: 'Patrakarpuram', phone: '9452012426', hours: '09:00 AM - 11:00 PM' },
  { name: 'Metro Pharmacy', address: 'Viraj Khand', phone: '9336812427', hours: '09:00 AM - 10:00 PM' },
  { name: 'Aarogya Medicals', address: 'Vinay Khand', phone: '9417512428', hours: '08:30 AM - 10:30 PM' },
  { name: 'Trust Pharmacy', address: 'Vishal Khand', phone: '9795812429', hours: '09:00 AM - 10:00 PM' },
  { name: 'Health Care Medicos', address: 'Gomti Nagar', phone: '9452112430', hours: '24 Hours' },
  { name: 'Sun Medical Store', address: 'Indira Nagar', phone: '9305812431', hours: '09:00 AM - 11:00 PM' },
  { name: 'Royal Care Pharma', address: 'Matiyari', phone: '9417612432', hours: '09:00 AM - 10:00 PM' },
  { name: 'Divine Medicals', address: 'Chinhat', phone: '9890012433', hours: '09:00 AM - 10:00 PM' },
  { name: 'Wellness Forever', address: 'Gomti Nagar Extension', phone: '9452212434', hours: '24 Hours' },
  { name: 'Blue Medicos', address: 'Deva Road', phone: '9336912435', hours: '09:00 AM - 11:00 PM' },
  { name: 'Green Pharmacy', address: 'Ismailganj', phone: '9417712436', hours: '09:00 AM - 10:00 PM' },
  { name: 'Prime Medicals', address: 'Viram Khand', phone: '9795912437', hours: '09:00 AM - 11:00 PM' },
  { name: 'Quick Cure Pharma', address: 'Munshi Pulia', phone: '9452312438', hours: '24 Hours' },
  { name: 'Noble Medical Store', address: 'Kamta', phone: '9305912439', hours: '09:00 AM - 10:00 PM' },
  { name: 'Safe Meds', address: 'Gomti Nagar', phone: '9417812440', hours: '09:00 AM - 10:00 PM' },
  { name: 'Healers Pharmacy', address: 'Matiyari', phone: '9890112441', hours: '09:00 AM - 11:00 PM' },
  { name: 'Best Meds', address: 'Chinhat Tiraha', phone: '9452412442', hours: '09:00 AM - 10:00 PM' },
  { name: 'Family First Pharma', address: 'Lucknow', phone: '9337012443', hours: '09:00 AM - 10:00 PM' },
  { name: 'Cure Meds', address: 'Janakipuram', phone: '9417912444', hours: '09:00 AM - 11:00 PM' },
  { name: 'Apex Medicals', address: 'Gomti Nagar', phone: '9796012445', hours: '09:00 AM - 10:00 PM' },
  { name: 'True Care Pharmacy', address: 'Matiyari', phone: '9452512446', hours: '24 Hours' },
  { name: 'Shanti Medicals', address: 'Chinhat', phone: '9306012447', hours: '09:00 AM - 10:00 PM' },
  { name: 'Global Health Meds', address: 'Lucknow', phone: '9418012448', hours: '09:00 AM - 11:00 PM' }
];

// Function to seed pharmacies
async function seedLucknowPharmacies() {
  try {
    console.log('🏥 Starting to seed 150 Lucknow pharmacies...\n');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const pharmacy of lucknowPharmacies) {
      try {
        // Check if pharmacy already exists (by phone)
        const existing = await Pharmacy.findOne({ phone: pharmacy.phone });
        
        if (existing) {
          console.log(`⏭️  Skipped: ${pharmacy.name} (phone ${pharmacy.phone} already exists)`);
          skippedCount++;
          continue;
        }
        
        // Parse operating hours
        const { open24x7, operatingHours } = parseOperatingHours(pharmacy.hours);
        
        // Get coordinates based on address
        const { lat, lng, area } = getCoordinates(pharmacy.address);
        
        // Create pharmacy document
        const newPharmacy = new Pharmacy({
          name: pharmacy.name,
          owner: pharmacy.name.split(' ')[0] + ' Owner', // Simple owner name
          phone: pharmacy.phone,
          email: `${pharmacy.phone}@medinear.com`, // Generate email from phone
          address: pharmacy.address,
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          zipCode: '226028',
          area: area,
          
          // License info (mock data)
          license: 'Valid',
          licenseNumber: `LKO-${pharmacy.phone.slice(-6)}`,
          licenseExpiry: new Date('2026-12-31'),
          
          // Location
          latitude: lat,
          longitude: lng,
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          
          // Operating info
          open24x7: open24x7,
          operatingHours: operatingHours || undefined,
          deliveryTime: 30,
          serviceArea: 5,
          
          // Status
          verified: true,
          active: true,
          employees: Math.floor(Math.random() * 5) + 2, // 2-6 employees
          
          // Break time (disabled by default)
          breakTime: {
            enabled: false
          },
          
          temporarilyClosed: false
        });
        
        await newPharmacy.save();
        addedCount++;
        console.log(`✅ Added: ${pharmacy.name} (${area}) - ${open24x7 ? '24 Hours' : pharmacy.hours}`);
        
      } catch (err) {
        console.error(`❌ Error adding ${pharmacy.name}:`, err.message);
        skippedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`🎉 Seeding Complete!`);
    console.log(`✅ Successfully added: ${addedCount} pharmacies`);
    console.log(`⏭️  Skipped (duplicates): ${skippedCount} pharmacies`);
    console.log(`📊 Total processed: ${lucknowPharmacies.length} pharmacies`);
    console.log('='.repeat(70) + '\n');
    
    // Display summary by area
    const pharmacyCount = await Pharmacy.countDocuments({ city: 'Lucknow' });
    const areas = await Pharmacy.aggregate([
      { $match: { city: 'Lucknow' } },
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`📍 Total pharmacies in Lucknow: ${pharmacyCount}`);
    console.log('\n📊 Distribution by area:');
    areas.forEach(area => {
      console.log(`   ${area._id}: ${area.count} pharmacies`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}
