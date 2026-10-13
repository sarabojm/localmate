import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import ProviderProfile from '../models/ProviderProfile';
import Review from '../models/Review';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localmate';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await ProviderProfile.deleteMany({});
    await Review.deleteMany({});

    console.log('Creating demo admin & customers...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@localmate.com',
      password: passwordHash,
      role: 'admin',
      phone: '+91 99999 00000',
    });

    const customerUser = await User.create({
      name: 'Rahul Verma',
      email: 'customer@localmate.com',
      password: passwordHash,
      role: 'customer',
      phone: '+91 98765 43210',
    });

    console.log('Creating verified provider users & profiles across districts...');
    const demoProvidersData = [
      {
        name: 'Sunil Sharma',
        email: 'sharma.electric@example.com',
        businessName: 'Sharma Electrical Works',
        tagline: 'Certified Master Electrician with 12+ Yrs Experience',
        category: 'Electrician',
        rating: 4.9,
        reviewCount: 142,
        experienceYears: 12,
        address: 'Shop 14, Main Market, Indiranagar',
        city: 'Bangalore',
        area: 'Indiranagar',
        location: { lat: 12.9784, lng: 77.6408 },
        phone: '+91 98450 12345',
        whatsapp: '919845012345',
        about: 'Specialized in residential wiring, short-circuit troubleshooting, MCB replacement, fan & chandelier installations, and inverter setups. Available for emergency callouts.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaElectric&backgroundColor=f59e0b',
        coverUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
        pricingStartsAt: 249,
        badges: ['Police Verified', 'Licensed Electrician', 'Emergency Available'],
        totalCallsReceived: 388,
        services: [
          { id: 's1', name: 'Switch & Socket Replacement', price: 149, unit: 'per point' },
          { id: 's2', name: 'Ceiling Fan Installation / Repair', price: 249, unit: 'per fan' },
          { id: 's3', name: 'MCB & Fuse Box Repair', price: 449, unit: 'per checkup' },
          { id: 's4', name: 'Inverter & Battery Setup', price: 799, unit: 'per setup' },
        ],
      },
      {
        name: 'Karthik Raja',
        email: 'coolbreeze.chennai@example.com',
        businessName: 'CoolBreeze AC Care',
        tagline: 'Split & Window AC Servicing, Gas Refill & Jet Cleaning',
        category: 'AC Mechanic',
        rating: 4.8,
        reviewCount: 98,
        experienceYears: 8,
        address: 'Near Metro Station, Anna Nagar',
        city: 'Chennai',
        area: 'Anna Nagar',
        location: { lat: 13.0850, lng: 80.2101 },
        phone: '+91 94441 56789',
        whatsapp: '919444156789',
        about: 'High-pressure jet wash foam cleaning, genuine refrigerant gas charging, PCB board troubleshooting, and quick compressor fixes. Fast turnaround within 2 hours.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CoolBreezeAC&backgroundColor=0284c7',
        coverUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
        pricingStartsAt: 499,
        badges: ['Certified Technician', '90-Day Gas Warranty', 'Police Verified'],
        totalCallsReceived: 512,
        services: [
          { id: 's6', name: 'Foam Jet AC Deep Service', price: 499, unit: 'per AC' },
          { id: 's7', name: 'R32 / R410A Refrigerant Gas Refill', price: 1800, unit: 'full charge' },
          { id: 's8', name: 'Split AC Uninstallation & Reinstall', price: 1400, unit: 'per unit' },
        ],
      },
      {
        name: 'Pooja Hegde',
        email: 'contact@sparklepro.in',
        businessName: 'SparklePro Deep Cleaners',
        tagline: 'Eco-Friendly Residential & Commercial Deep Cleaning',
        category: 'Cleaning Pro',
        rating: 4.9,
        reviewCount: 215,
        experienceYears: 6,
        address: 'Block C, Powai Plaza',
        city: 'Mumbai',
        area: 'Powai',
        location: { lat: 19.1176, lng: 72.9060 },
        phone: '+91 98200 45612',
        whatsapp: '919820045612',
        about: 'Equipped with industrial vacuum cleaners, steam sanitizers, and non-toxic chemicals. We specialize in kitchen chimney degreasing, bathroom descaling, and sofa shampooing.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=SparkleProCleaning&backgroundColor=10b981',
        coverUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
        pricingStartsAt: 699,
        badges: ['Eco-Friendly Certified', 'Trained Crew', 'Insured Service'],
        totalCallsReceived: 624,
        services: [
          { id: 's10', name: 'Bathroom Intensive Scrubbing', price: 699, unit: 'per bathroom' },
          { id: 's11', name: 'Kitchen Chimney & Tile Degreasing', price: 999, unit: 'per kitchen' },
          { id: 's12', name: '3-Seater Sofa Foam Shampooing', price: 799, unit: 'per sofa' },
        ],
      },
      {
        name: 'Murugan Swamy',
        email: 'quickfix.plumbing@example.com',
        businessName: 'QuickFix 24x7 Plumbers',
        tagline: 'Emergency Leakage, Pipe Fitting & Water Motor Experts',
        category: 'Plumber',
        rating: 4.8,
        reviewCount: 167,
        experienceYears: 10,
        address: 'Opp. Panagal Park, T. Nagar',
        city: 'Chennai',
        area: 'T. Nagar',
        location: { lat: 13.0418, lng: 80.2341 },
        phone: '+91 97910 88776',
        whatsapp: '919791088776',
        about: 'Emergency tap leakages, concealed pipe joint soldering, overhead tank motor fitting, toilet flush repairs, and sanitary ware installation. Prompt 30-min arrival in central Chennai.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuickFixPlumbing&backgroundColor=2563eb',
        coverUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        pricingStartsAt: 199,
        badges: ['24x7 Emergency', 'Licensed Plumber', 'Police Verified'],
        totalCallsReceived: 420,
        services: [
          { id: 'p1', name: 'Tap Leakage & Washer Replacement', price: 199, unit: 'per tap' },
          { id: 'p2', name: 'Water Tank Float Valve Fitting', price: 399, unit: 'per fitting' },
          { id: 'p3', name: 'Blocked Drain Cleaning', price: 499, unit: 'per visit' },
        ],
      },
      {
        name: 'Syed Rasool',
        email: 'deccan.carpentry@example.com',
        businessName: 'Deccan Woodcraft & Carpentry',
        tagline: 'Custom Wardrobes, Door Locks & Modular Woodwork',
        category: 'Carpenter',
        rating: 4.9,
        reviewCount: 88,
        experienceYears: 14,
        address: 'Road No. 12, Banjara Hills',
        city: 'Hyderabad',
        area: 'Banjara Hills',
        location: { lat: 17.4156, lng: 78.4357 },
        phone: '+91 99890 33445',
        whatsapp: '919989033445',
        about: 'Precision woodwork, antique furniture restoration, door hinge fixing, electronic Godrej lock fitting, kitchen cabinet repairs, and plywood modular shelves.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DeccanWoodcraft&backgroundColor=ea580c',
        coverUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
        pricingStartsAt: 299,
        badges: ['Master Craftsman', 'Police Verified', 'Quality Guarantee'],
        totalCallsReceived: 215,
        services: [
          { id: 'c1', name: 'Door Lock / Latch Installation', price: 299, unit: 'per door' },
          { id: 'c2', name: 'Hinges Alignment & Oiling', price: 199, unit: 'per visit' },
          { id: 'c3', name: 'Custom Wooden Shelf Assembling', price: 599, unit: 'per unit' },
        ],
      },
      {
        name: 'Vikas Malhotra',
        email: 'delhi.appliances@example.com',
        businessName: 'Apex Appliance Repair Lab',
        tagline: 'Washing Machine, Refrigerator & Microwave Service',
        category: 'Appliance Repair',
        rating: 4.7,
        reviewCount: 130,
        experienceYears: 9,
        address: 'Community Centre, Saket',
        city: 'Delhi',
        area: 'Saket',
        location: { lat: 28.5244, lng: 77.2066 },
        phone: '+91 98110 55432',
        whatsapp: '919811055432',
        about: 'Certified technicians for all top brands (LG, Samsung, Whirlpool, IFB). Front load washing machine drum repair, fridge gas leak fix, and microwave heating diagnosis.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApexAppliances&backgroundColor=e11d48',
        coverUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        pricingStartsAt: 299,
        badges: ['Genuine Spare Parts', 'Police Verified', 'Same-Day Visit'],
        totalCallsReceived: 310,
        services: [
          { id: 'a1', name: 'Washing Machine Diagnosis', price: 299, unit: 'per visit' },
          { id: 'a2', name: 'Fridge Cooling / Thermostat Fix', price: 449, unit: 'per checkup' },
          { id: 'a3', name: 'Microwave Magnetron Replacement', price: 599, unit: 'service charge' },
        ],
      },
      {
        name: 'Anand Kumar',
        email: 'bangalore.pestcare@example.com',
        businessName: 'ShieldPro Herbal Pest Control',
        tagline: 'Odorless Cockroach, Termite & Bedbug Eradication',
        category: 'Pest Control',
        rating: 4.8,
        reviewCount: 175,
        experienceYears: 7,
        address: '5th Block, Koramangala',
        city: 'Bangalore',
        area: 'Koramangala',
        location: { lat: 12.9352, lng: 77.6245 },
        phone: '+91 99000 66789',
        whatsapp: '919900066789',
        about: 'Government approved, 100% kid & pet safe herbal gel treatment. Guaranteed 1-year termite warranty and hassle-free single session pest management.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShieldProPest&backgroundColor=0d9488',
        coverUrl: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&auto=format&fit=crop&q=80',
        pricingStartsAt: 499,
        badges: ['Govt Certified', 'Pet & Child Safe', 'Warranty Backed'],
        totalCallsReceived: 440,
        services: [
          { id: 'ps1', name: '1BHK/2BHK Herbal Gel Cockroach Control', price: 699, unit: 'full house' },
          { id: 'ps2', name: 'Bedbug Dual-Spray Treatment', price: 999, unit: 'per room' },
          { id: 'ps3', name: 'Pre-Construction Termite Pipe Inflow', price: 1500, unit: 'per floor' },
        ],
      },
    ];

    for (const p of demoProvidersData) {
      const user = await User.create({
        name: p.name,
        email: p.email,
        password: passwordHash,
        role: 'provider',
        phone: p.phone,
        avatar: p.avatarUrl,
      });

      const profile = await ProviderProfile.create({
        userId: user._id,
        businessName: p.businessName,
        tagline: p.tagline,
        category: p.category,
        rating: p.rating,
        reviewCount: p.reviewCount,
        experienceYears: p.experienceYears,
        address: p.address,
        city: p.city,
        area: p.area,
        location: p.location,
        phone: p.phone,
        whatsapp: p.whatsapp,
        email: p.email,
        about: p.about,
        avatarUrl: p.avatarUrl,
        coverUrl: p.coverUrl,
        isVerified: true,
        isAvailable: true,
        pricingStartsAt: p.pricingStartsAt,
        badges: p.badges,
        workingType: (p as any).workingType || 'On-site / Home Visit',
        workingHours: (p as any).workingHours || '9:00 AM - 8:00 PM (Mon - Sat)',
        totalCallsReceived: p.totalCallsReceived,
        services: p.services,
      });

      // Add verified customer reviews
      await Review.create({
        providerId: profile._id,
        userId: customerUser._id,
        customerName: customerUser.name,
        rating: 5,
        comment: 'Punctual, professional, and very transparent with charges. Highly recommend for any local household service!',
      });
    }

    console.log('✅ Database seeded successfully with real multi-city providers!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
