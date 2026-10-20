import { config } from './config.js';

// Her answers. In memory only: a refresh starts over.
export const createState = () => ({
  day: null,          // null | 'sat' | 'sun'
  activities: [],
  activityOther: '',
  food: [],
  foodOther: '',
  dessert: null,      // null | 'yes' | 'obviously'
  time: config.SLIDER.default,
});

export const state = createState();
