import { FaCheck } from "react-icons/fa";

// Supabase storage base (assets moved to Supabase)
const STORAGE_BASE_URL = "https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms";


export const adultsList = [
    { name: '1 Adult' },
    { name: '2 Adults' },
    { name: '3 Adults' },
    { name: '4 Adults' },
]


export const kidsList = [
    { name: '0 Kid' },
    { name: '1 Kid' },
    { name: '2 Kids' },
    { name: '3 Kids' },
    { name: '4 Kids' },
]


export const sliderData = [
  {
    id: 1,
    title: 'Your Luxury Hotel For Vacation',
    bg: `${STORAGE_BASE_URL}/img/heroSlider/1.jpg`,
    btnNext: 'See our rooms',
  },
  {
    id: 2,
    title: 'Feel Relax & Enjoy Your Luxuriousness',
    bg: `${STORAGE_BASE_URL}/img/heroSlider/2.jpg`,
    btnNext: 'See our rooms',
  },
  {
    id: 3,
    title: 'Your Luxury Hotel For Vacation',
    bg: `${STORAGE_BASE_URL}/img/heroSlider/3.jpg`,
    btnNext: 'See our rooms',
  },
];


export const hotelRules = [
    {
        rules: 'Check-in : 3:00 PM - 9:00 PM',
    },
    {
        rules: 'Check-out : 10:30 AM',
    },
    {
        rules: 'No Smoking',
    },
    {
        rules: 'No Pet',
    },
]