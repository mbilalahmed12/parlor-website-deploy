const defaultServices = [
  {
    name: 'Signature Blow Dry',
    description: 'Polished volume and a refined finish for events and everyday elegance.',
    price: 120,
    duration: 30,
    category: 'hair',
    categoryLabel: 'Hair',
    audience: 'her',
    featured: true,
    active: true,
  },
  {
    name: 'Precision Cut',
    description: 'A tailored cut that frames your face and grows out beautifully.',
    price: 150,
    duration: 40,
    category: 'hair',
    categoryLabel: 'Hair',
    audience: 'her',
    featured: false,
    active: true,
  },
  {
    name: 'Soft Glam Makeup',
    description: 'Fresh, camera-ready makeup with a warm luxury touch.',
    price: 220,
    duration: 60,
    category: 'makeup',
    categoryLabel: 'Makeup',
    audience: 'her',
    featured: true,
    active: true,
  },
  {
    name: 'Bridal Glow',
    description: 'A more detailed look for your most important celebrations.',
    price: 350,
    duration: 90,
    category: 'makeup',
    categoryLabel: 'Makeup',
    audience: 'her',
    featured: false,
    active: true,
  },
  {
    name: 'Relaxation Massage',
    description: 'Slow down, reset, and leave feeling restored.',
    price: 180,
    duration: 60,
    category: 'spa',
    categoryLabel: 'Spa',
    audience: 'her',
    featured: true,
    active: true,
  },
  {
    name: 'Manicure & Nail Art',
    description: 'Clean, modern nails with artistic detail.',
    price: 95,
    duration: 45,
    category: 'nails',
    categoryLabel: 'Nails',
    audience: 'her',
    featured: false,
    active: true,
  },
  {
    name: 'Gentlemen Grooming',
    description: 'A refined men’s grooming experience with clean lines and polish.',
    price: 140,
    duration: 35,
    category: 'grooming',
    categoryLabel: 'Grooming',
    audience: 'him',
    featured: true,
    active: true,
  },
];

export const defaultCategories = [
  { key: 'hair', label: 'Hair', serviceCount: 2, backgroundImageUrl: '/portrait-cutout.png' },
  { key: 'makeup', label: 'Makeup', serviceCount: 2, backgroundImageUrl: '/portrait-cutout.png' },
  { key: 'spa', label: 'Spa', serviceCount: 1, backgroundImageUrl: '/portrait-cutout.png' },
  { key: 'nails', label: 'Nails', serviceCount: 1, backgroundImageUrl: '/portrait-cutout.png' },
];

export const buildStaticCategories = (audience = 'her') => {
  const filtered = defaultServices.filter((service) => service.active !== false && service.audience === audience);
  const grouped = new Map();

  filtered.forEach((service) => {
    const key = service.category;
    const current = grouped.get(key) || {
      key,
      label: service.categoryLabel,
      serviceCount: 0,
      backgroundImageUrl: '/portrait-cutout.png',
      backgroundVideoUrl: '',
    };

    current.serviceCount += 1;
    grouped.set(key, current);
  });

  return Array.from(grouped.values());
};

export const getStaticServicesByCategory = (category, audience = 'her') =>
  defaultServices.filter(
    (service) =>
      service.active !== false &&
      service.audience === audience &&
      service.category === String(category || '').toLowerCase()
  );

export default defaultServices;