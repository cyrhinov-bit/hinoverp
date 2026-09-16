// ==============================|| ADMINBSB - MATERIAL DESIGN SKINS ||============================== //

export const ADMINBSB_SKINS = [
  { id: 'red', name: 'Red', hex: '#F44336', dark: '#d32f2f', light: '#ffebee' },
  { id: 'pink', name: 'Pink', hex: '#E91E63', dark: '#c2185b', light: '#fce4ec' },
  { id: 'purple', name: 'Purple', hex: '#9C27B0', dark: '#7b1fa2', light: '#f3e5f5' },
  { id: 'deep-purple', name: 'Deep Purple', hex: '#673AB7', dark: '#512da8', light: '#ede7f6' },
  { id: 'indigo', name: 'Indigo', hex: '#3F51B5', dark: '#303f9f', light: '#e8eaf6' },
  { id: 'blue', name: 'Blue', hex: '#2196F3', dark: '#1976d2', light: '#e3f2fd' },
  { id: 'light-blue', name: 'Light Blue', hex: '#03A9F4', dark: '#0288d1', light: '#e1f5fe' },
  { id: 'cyan', name: 'Cyan', hex: '#00BCD4', dark: '#0097a7', light: '#e0f7fa' },
  { id: 'teal', name: 'Teal', hex: '#009688', dark: '#00796b', light: '#e0f2f1' },
  { id: 'green', name: 'Green', hex: '#4CAF50', dark: '#388e3c', light: '#e8f5e9' },
  { id: 'light-green', name: 'Light Green', hex: '#8BC34A', dark: '#689f38', light: '#f1f8e9' },
  { id: 'amber', name: 'Amber', hex: '#FFC107', dark: '#ffa000', light: '#fff8e1' },
  { id: 'orange', name: 'Orange', hex: '#FF9800', dark: '#f57c00', light: '#fff3e0' },
  { id: 'deep-orange', name: 'Deep Orange', hex: '#FF5722', dark: '#e64a19', light: '#fbe9e7' },
  { id: 'blue-grey', name: 'Blue Grey', hex: '#607D8B', dark: '#455a64', light: '#eceff1' },
  { id: 'black', name: 'Black', hex: '#212121', dark: '#000000', light: '#f5f5f5' }
];

export const DEFAULT_SKIN = ADMINBSB_SKINS[0]; // Red par défaut comme AdminBSB classique

export function getSkinById(id) {
  return ADMINBSB_SKINS.find((s) => s.id === id) || DEFAULT_SKIN;
}

