# 📘 PROJECT KNOWLEDGE BASE
*(Auto-generated to help Copilot understand your entire project instantly)*

Generated: **2025-12-01T05:54:58.778Z**

---

# Table of Contents
- [Project Summary](#project-summary)
- [Tech Stack](#tech-stack)
- [Folder Overview](#folder-overview)
- [Files Included](#files-included)
- [Important Code Snippets](#important-code-snippets)
- [Recommended Copilot Startup Command](#recommended-copilot-startup-command)
- [Next Steps / Roadmap](#next-steps--roadmap)

---

# 📌 Project Summary
This file serves as the **brain** of your project.  
Copilot can reload everything from this file after switching GitHub accounts.

---

# ⚙ Tech Stack
- React (Vite)
- Supabase (Auth, SQL, Storage, RLS)
- TailwindCSS
- Node scripts
- SQL schema + triggers
- Admin panel + booking system

---

# 📂 Folder Overview

## 🔸 .env
- .env

## 🔸 gop_code_origin.js
- gop_code_origin.js

## 🔸 gop_code_V2.js
- gop_code_V2.js

## 🔸 package.json
- package.json

## 🔸 Query_V2
- Query_V2\01_Clean_Data.sql
- Query_V2\02_Int_schema.sql
- Query_V2\03_Setup_RLS.sql
- Query_V2\04_Full_seed_data.sql

## 🔸 src
- src\App.jsx
- src\assets\index.js
- src\components\admin\AuditLogsManagement.jsx
- src\components\admin\BookingsManagement.jsx
- src\components\admin\BookingsManagement_REFACTORED.js
- src\components\admin\index.js
- src\components\admin\PriceRulesManagement.jsx
- src\components\admin\PromotionsManagement.jsx
- src\components\admin\ReportsManagement.jsx
- src\components\admin\RoomsManagement.jsx
- src\components\admin\RoomTypesManagement.jsx
- src\components\admin\UsersManagement.jsx
- src\components\admin\UsersManagement_REFACTORED.js
- src\components\AdminSidebar.jsx
- src\components\AdultsDropdown.jsx
- src\components\BookForm.jsx
- src\components\CategoryFilter.jsx
- src\components\chatBox\ChatBox.jsx
- src\components\chatBox\index.js
- src\components\CheckIn.jsx
- src\components\CheckOut.jsx
- src\components\Footer.jsx
- src\components\Header.jsx
- src\components\HeroSlider.jsx
- src\components\index.js
- src\components\Invoice.jsx
- src\components\KidsDropdown.jsx
- src\components\LanguageSwitcher.jsx
- src\components\NotificationContainer.jsx
- src\components\PageNotFound.jsx
- src\components\Pagination.jsx
- src\components\ProtectedRoute.jsx
- src\components\QRPayment.jsx
- src\components\QRPaymentModal.jsx
- src\components\Room.jsx
- src\components\Rooms.jsx
- src\components\RoomTypeSelector.jsx
- src\components\Toast.jsx
- src\constants\data.js
- src\constants\translations.js
- src\context\AuthContext.jsx
- src\context\BookingContext.jsx
- src\context\LanguageContext.jsx
- src\context\RoomContext.jsx
- src\db\constants\bookingStatus.js
- src\db\constants\errors.js
- src\db\constants\reviewRatings.js
- src\db\constants\roomTypes.js
- src\db\data.js
- src\db\index.js
- src\db\mutations\bookings.js
- src\db\mutations\restaurants.js
- src\db\mutations\reviews.js
- src\db\mutations\spas.js
- src\db\queries\bookings.js
- src\db\queries\restaurants.js
- src\db\queries\reviews.js
- src\db\queries\rooms.js
- src\db\queries\spas.js
- src\features\admin\AdminHeader.jsx
- src\features\admin\AdminModal.jsx
- src\features\admin\AdminTable.jsx
- src\features\admin\index.js
- src\hooks\index.js
- src\hooks\useCRUD.js
- src\hooks\useModalForm.js
- src\main.jsx
- src\pages\Admin.jsx
- src\pages\CleanupPage.jsx
- src\pages\Contact.jsx
- src\pages\ForgotPassword.jsx
- src\pages\Home.jsx
- src\pages\index.js
- src\pages\Login.jsx
- src\pages\Register.jsx
- src\pages\ResetPassword.jsx
- src\pages\RestaurantPage.jsx
- src\pages\RoomDetails.jsx
- src\pages\RoomsPage.jsx
- src\pages\SpaPage.jsx
- src\pages\UserDashboard.jsx
- src\services\adminService.js
- src\services\adminService_REFACTORED.js
- src\services\authService.js
- src\services\bookingService.js
- src\services\roomService.js
- src\style\chatbox.css
- src\style\datepicker.css
- src\style\index.css
- src\utils\aiAssistant.js
- src\utils\chatboxConfig.js
- src\utils\chatboxTesting.js
- src\utils\chatboxValidation.js
- src\utils\clearTestData.js
- src\utils\emailService.js
- src\utils\notifications.js
- src\utils\ScrollToTop.js
- src\utils\supabaseClient.js
- src\utils\supabaseStorageUrls.js

## 🔸 trich_xuat_v2.js
- trich_xuat_v2.js

## 🔸 vite.config.js
- vite.config.js

---

# 🧩 Files Included & Summaries
Below are summaries of important files extracted automatically.
(You may refine manually if desired.)

### 📄 .env
# Supabase Configuration # For Vite, use VITE_ prefix (Vite will expose these as import.meta.env) VITE_SUPABASE_URL=https://sxteddkozzqniebfstag.supabase.co VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dGVkZGtvenpxbmllYmZzdGFnIiwicm9sZSI6ImFub24iLCJ...

---
### 📄 gop_code_origin.js
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; // --- CẤU HÌNH --- const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename); const OUTPUT_FILE = 'GIAO_DIEN_GOC_DEMO.txt'; // Tên file đầu ra mới const TARGET_FOLDER = 'Project_...

---
### 📄 gop_code_V2.js
// ========================================================= // GOP_CODE V2 — Project Export & Knowledge Base Generator // Made for long-term reusability across GitHub/Copilot accounts // ========================================================= import fs from "fs"; import path from "path"; import ...

---
### 📄 package.json
{   "name": "hotelbooking",   "private": true,   "version": "0.0.0",   "type": "module",   "scripts": {     "dev": "vite",     "build": "vite build",     "preview": "vite preview"   },   "dependencies": {     "@emailjs/browser": "^4.4.1",     "@supabase/supabase-js": "^2.84.0",     "htm...

---
### 📄 Query_V2\01_Clean_Data.sql
-- ===================================================== -- 01_CLEAN_DB.SQL -- ===================================================== -- Xóa bảng theo đúng thứ tự phụ thuộc để không lỗi khóa ngoại -- 1. Xoá trigger trên auth.users drop trigger if exists on_auth_user_created on auth.users; -- 2. Xoá...

---
### 📄 Query_V2\02_Int_schema.sql
-- ===================================== -- 02_INIT_SCHEMA.SQL -- ===================================== create extension if not exists "pgcrypto"; -- ====== ENUMS ====== create type room_status as enum ('available', 'occupied', 'maintenance', 'cleaning'); create type booking_status as enum ('pendi...

---
### 📄 Query_V2\03_Setup_RLS.sql
-- ========================================= -- 03_SETUP_RLS.SQL -- ========================================= -- Enable RLS alter table public.profiles enable row level security; alter table public.room_types enable row level security; alter table public.amenities enable row level security; alter t...

---
### 📄 Query_V2\04_Full_seed_data.sql
-- ===================================================== -- 04_FULL_SEED_DATA.SQL -- ===================================================== -- 1. AMENITIES insert into public.amenities (name, icon_name) values   ('Wifi', 'FaWifi'), ('Coffee', 'FaCoffee'), ('Bath', 'FaBath'), ('Parking Space', 'FaPar...

---
### 📄 src\App.jsx
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"; import { Footer, Header, PageNotFound, ProtectedRoute } from "./components"; import ChatBox from "./components/chatBox"; import {   Home,   RoomDetails,   Admin,   Login,   Register,   ForgotPassword,   ResetPass...

---
### 📄 src\assets\index.js
// ⚠️ DEPRECATED: Room images now come from Supabase Storage // All room image imports removed - use supabaseStorageUrls.js instead  import Slider1 from './img/heroSlider/1.jpg'; import Slider2 from './img/heroSlider/2.jpg'; import Slider3 from './img/heroSlider/3.jpg';  // Logo exports - sti...

---
### 📄 src\components\admin\AuditLogsManagement.jsx
import { useEffect } from 'react'; import { useCRUD } from '../../hooks'; import { AdminHeader, AdminTable } from '../../features/admin'; const AuditLogsManagement = () => {   const { data: logs, isLoading, error, fetchData } = useCRUD(     'audit_logs',     '*'   );    useEffect(() => {  ...

---
### 📄 src\components\admin\BookingsManagement.jsx
import { useState, useEffect } from "react"; import {   FaCheck,   FaTimes,   FaEdit,   FaTrash } from "react-icons/fa"; import {   fetchAllRoomBookingsForAdmin,   fetchAllRestaurantBookingsForAdmin,   fetchAllSpaBookingsForAdmin,   updateRoomBookingStatus,   updateRestaurantBookingStatu...

---
### 📄 src\components\admin\BookingsManagement_REFACTORED.js
import { useState, useEffect, useCallback } from "react"; import {   FaCheck,   FaTimes,   FaBan,   FaEdit,   FaPhone,   FaUser,   FaSpinner,   FaExclamationCircle, } from "react-icons/fa"; import {   fetchAllBookingsForAdmin,   updateBookingStatus,   deleteBooking, } from "../../services/adminServi...

---
### 📄 src\components\admin\index.js
export { default as RoomTypesManagement } from './RoomTypesManagement'; export { default as RoomsManagement } from './RoomsManagement'; export { default as PriceRulesManagement } from './PriceRulesManagement'; export { default as PromotionsManagement } from './PromotionsManagement'; export { def...

---
### 📄 src\components\admin\PriceRulesManagement.jsx
import { useEffect, useState } from 'react'; import { useCRUD, useModalForm } from '../../hooks'; import { AdminHeader, AdminTable, AdminModal } from '../../features/admin'; import { supabase } from '../../utils/supabaseClient';  const PriceRulesManagement = () => {   const { data: priceRules,...

---
### 📄 src\components\admin\PromotionsManagement.jsx
import { useEffect } from 'react'; import { FaTag } from 'react-icons/fa'; import { useCRUD, useModalForm } from '../../hooks'; import { AdminHeader, AdminTable, AdminModal } from '../../features/admin'; import { supabase } from '../../utils/supabaseClient';  const PromotionsManagement = () =>...

---
### 📄 src\components\admin\ReportsManagement.jsx
import { useState } from 'react'; import { FaChartLine, FaChartBar, FaDollarSign, FaBed } from 'react-icons/fa';  const ReportsManagement = () => {   const [dateRange, setDateRange] = useState({     startDate: '',     endDate: ''   });   const [reportType, setReportType] = useState('revenue'...

---
### 📄 src\components\admin\RoomsManagement.jsx
import { useState, useEffect } from 'react'; import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa'; import { fetchRoomTypes } from '../../services/roomService'; import { fetchRoomsForAdmin, createRoomAdmin, updateRoomAdmin, deleteRoomAdmin } from '../../services/adminService'...

---
### 📄 src\components\admin\RoomTypesManagement.jsx
import { useState, useEffect } from 'react'; import { FaCheck } from 'react-icons/fa'; import { AdminHeader, AdminTable, AdminModal } from '../../features/admin'; import {   fetchRoomTypesForAdmin,   createRoomType,   updateRoomTypeAdmin,   deleteRoomTypeAdmin, } from '../../services/adminSe...

---
### 📄 src\components\admin\UsersManagement.jsx
import { useState, useEffect } from 'react'; import { FaEdit, FaTrash, FaUser, FaEnvelope, FaLock, FaCheck, FaTimes, FaBriefcase } from 'react-icons/fa'; import { AdminTable } from '../../features/admin'; import { fetchUsersForAdmin, updateUserAdmin, deleteUserProfileAdmin } from '../../services/...

---
### 📄 src\components\admin\UsersManagement_REFACTORED.js
import { useState, useEffect } from 'react'; import {   FaEdit,   FaTrash,   FaUser,   FaEnvelope,   FaSpinner,   FaCheck,   FaTimes,   FaBriefcase,   FaExclamationCircle, } from 'react-icons/fa'; import { fetchAllUsers, updateUser, deleteUser, fetchUserById } from '../../services/adminService'; /*...

---
### 📄 src\components\AdminSidebar.jsx
import { Link, useNavigate } from 'react-router-dom'; import {   FaHome,   FaBed,   FaDoorOpen,   FaDollarSign,   FaTag,   FaCalendarCheck,   FaHistory,   FaChartBar,   FaSignOutAlt,   FaUser,   FaUsers } from 'react-icons/fa'; import { LogoDark } from '../assets'; import { useAuth } ...

---
### 📄 src\components\AdultsDropdown.jsx
import { useRoomContext } from '../context/RoomContext'; import { BsChevronDown } from 'react-icons/bs'; import { adultsList } from '../constants/data'; import { Menu } from '@headlessui/react';   const AdultsDropdown = () => {    const { adults, setAdults, } = useRoomContext();     retur...

---
### 📄 src\components\BookForm.jsx
import {   AdultsDropdown,   CheckIn,   CheckOut,   KidsDropdown,   RoomTypeSelector, } from "."; import { useRoomContext } from "../context/RoomContext";  const BookForm = () => {   const { handleCheck } = useRoomContext();    const handleSubmit = (e) => {     handleCheck(e);     // S...

---
### 📄 src\components\CategoryFilter.jsx
import React, { useMemo } from "react"; import { useRoomContext } from "../context/RoomContext";  const CategoryFilter = () => {   const { allRooms, selectedCategory, updateCategory } = useRoomContext();    // Derive categories from actual room types in Supabase   const roomTypes = useMemo(()...

---
### 📄 src\components\chatBox\ChatBox.jsx
import { useState, useMemo, useEffect, useRef } from "react"; import { useNavigate } from "react-router-dom"; import { useRoomContext } from "../../context/RoomContext"; import { useAuth } from "../../context/AuthContext"; import { FiMessageCircle, FiX, FiSend } from "react-icons/fi"; import QR...

---
### 📄 src\components\chatBox\index.js
export { default } from './ChatBox';...

---
### 📄 src\components\CheckIn.jsx
import { BsCalendar } from 'react-icons/bs'; import DatePicker from 'react-datepicker'; import 'react-datepicker/dist/react-datepicker.css'; import '../style/datepicker.css'; import { useRoomContext } from '../context/RoomContext';  const CheckIn = () => {   const { checkInDate, setCheckInDat...

---
### 📄 src\components\CheckOut.jsx
import { BsCalendar } from 'react-icons/bs'; import DatePicker from 'react-datepicker'; import 'react-datepicker/dist/react-datepicker.css'; import '../style/datepicker.css'; import { useRoomContext } from '../context/RoomContext';  const CheckOut = () => {   const { checkInDate, checkOutDate...

---
### 📄 src\components\Footer.jsx
const STORAGE_URL = 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img';  const Footer = () => (   <footer className='bg-primary py-12'>     <div className='container mx-auto text-white flex items-center gap-5 sm:justify-between flex-col sm:flex-row'>       <a hr...

---
### 📄 src\components\Header.jsx
import { useRoomContext } from "../context/RoomContext"; import { useAuth } from "../context/AuthContext"; import { useEffect, useMemo, useState } from "react"; import { Link, useNavigate, useLocation } from "react-router-dom"; import { FaUser, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";...

---
### 📄 src\components\HeroSlider.jsx
import { Swiper, SwiperSlide } from 'swiper/react'; import { sliderData } from '../constants/data'; import { EffectFade, Autoplay } from 'swiper'; import 'swiper/css/effect-fade'; import 'swiper/css';  const STORAGE_URL = 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel...

---
### 📄 src\components\index.js
export { default as AdultsDropdown } from "./AdultsDropdown"; export { default as PageNotFound } from "./PageNotFound"; export { default as KidsDropdown } from "./KidsDropdown"; export { default as HeroSlider } from "./HeroSlider"; export { default as BookForm } from "./BookForm"; export { defa...

---
### 📄 src\components\Invoice.jsx
import { useRef } from "react"; import { FaFileInvoice, FaEnvelope, FaTimes } from "react-icons/fa"; import { LogoDark } from "../assets";  const Invoice = ({ booking, onClose, onDownload, onEmail }) => {   const invoiceRef = useRef(null);   const formatDate = (dateString) => {     if (!dateS...

---
### 📄 src\components\KidsDropdown.jsx
import { useRoomContext } from '../context/RoomContext'; import { BsChevronDown } from 'react-icons/bs'; import { kidsList } from '../constants/data'; import { Menu } from '@headlessui/react';   const KidsDropdown = () => {    const { kids, setKids } = useRoomContext();     return (     ...

---
### 📄 src\components\LanguageSwitcher.jsx
import { useLanguage } from '../context/LanguageContext';  const LanguageSwitcher = () => {   const { language, setLanguage, t } = useLanguage();   const options = [     { code: 'en', label: t('languageSwitcher.english') },     { code: 'vi', label: t('languageSwitcher.vietnamese') },   ];  ...

---
### 📄 src\components\NotificationContainer.jsx
import { useState, useEffect } from 'react'; import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa'; import { subscribeToNotifications, removeNotification } from '../utils/notifications'; const NotificationContainer = () => {   const [notifications...

---
### 📄 src\components\PageNotFound.jsx
import React from 'react'  const PageNotFound = () => {   return (     <div>404 Page Not Found</div>   ) }  export default PageNotFound...

---
### 📄 src\components\Pagination.jsx
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";  const Pagination = ({   currentPage,   totalPages,   onPageChange,   itemsPerPage,   totalItems, }) => {   if (totalPages <= 1) return null;    // Generate page numbers to display   const getPageNumbers = () => {     const...

---
### 📄 src\components\ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'; import { useAuth } from '../context/AuthContext'; import { FaSpinner } from 'react-icons/fa';  const ProtectedRoute = ({ children, requireAdmin = false, disallowAdmin = false, redirectTo }) => {   const { isAuthenticated, isAdmin, loadin...

---
### 📄 src\components\QRPayment.jsx
import { useState, useEffect } from 'react'; import { QRCodeSVG } from 'qrcode.react'; import { FaQrcode, FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa';  const QRPayment = ({    bookingData,    onPaymentSuccess,    onClose,   type = 'room' // 'room', 'restaurant', 'spa' }) => {  ...

---
### 📄 src\components\QRPaymentModal.jsx
import { useState } from "react"; import { FaTimes, FaCheck, FaCopy } from "react-icons/fa";  const QRPaymentModal = ({ booking, onConfirmPayment, onClose }) => {   const [paymentConfirmed, setPaymentConfirmed] = useState(false);   const [copied, setCopied] = useState(false);    const handleC...

---
### 📄 src\components\Room.jsx
import { BsArrowsFullscreen, BsPeople } from "react-icons/bs"; import { FaStar } from "react-icons/fa"; import { Link } from "react-router-dom";  const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' hei...

---
### 📄 src\components\Rooms.jsx
import { useRoomContext } from "../context/RoomContext"; import { SpinnerDotted } from "spinners-react"; import { Room, Pagination } from "."; import { useState, useMemo } from "react";  const Rooms = () => {   const { rooms, loading } = useRoomContext();   const [currentPage, setCurrentPage]...

---
### 📄 src\components\RoomTypeSelector.jsx
import { useRoomContext } from "../context/RoomContext"; import { useMemo } from "react";  const RoomTypeSelector = () => {   const { allRooms, selectedCategory, updateCategory } = useRoomContext();    // Derive room types from actual rooms in Supabase   const roomTypes = useMemo(() => {    ...

---
### 📄 src\components\Toast.jsx
import { useEffect } from 'react'; import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';  const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {   useEffect(() => {     if (duration > 0) {       const timer = setTimeout(() => {         onC...

---
### 📄 src\constants\data.js
import { FaCheck } from "react-icons/fa"; import images from "../assets";   export const adultsList = [     { name: '1 Adult' },     { name: '2 Adults' },     { name: '3 Adults' },     { name: '4 Adults' }, ]   export const kidsList = [     { name: '0 Kid' },     { name: '1 Kid' },   ...

---
### 📄 src\constants\translations.js
const translations = {   en: {     header: {       home: 'Home',       rooms: 'Rooms',       restaurant: 'Restaurant',       spa: 'Spa',       contact: 'Contact',       dashboard: 'Dashboard',       admin: 'Admin',       signIn: 'Sign In',       signOut: 'Sign Out',       signUp: 'Sign U...

---
### 📄 src\context\AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'; import { supabase } from '../utils/supabaseClient';  const AuthInfo = createContext();  /**  * Transform Supabase user to application user shape  */ const enrichUser = (supabaseUser, userMetadata = {}) => {...

---
### 📄 src\context\BookingContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'; import { isBookingEmailConfigured, sendBookingConfirmationEmail } from '../utils/emailService'; import {   createBooking, // for room bookings   updateBookingStatus, // for room bookings   createRestaurantBooking,   update...

---
### 📄 src\context\LanguageContext.jsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'; import translations from '../constants/translations';  const LanguageInfo = createContext();  const getNestedValue = (obj, path) => {   return path.split('.').reduce((acc, segment) => (acc && acc[segm...

---
### 📄 src\context\RoomContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react"; import {   isBookingEmailConfigured,   sendBookingConfirmationEmail, } from "../utils/emailService"; import {   fetchRoomsWithImages,   fetchRoomReviews,   createReview,   checkRoomAvailability,   hasUserBooke...

---
### 📄 src\db\constants\bookingStatus.js
/**  * Booking Status Constants  */ export const BOOKING_STATUS = {   PENDING: 'pending',   CONFIRMED: 'confirmed',   CANCELLED: 'cancelled',   COMPLETED: 'completed',   NO_SHOW: 'no_show', }; export const BOOKING_STATUS_LABELS = {   pending: 'Pending',   confirmed: 'Confirmed',   cancelled: 'Canc...

---
### 📄 src\db\constants\errors.js
/**  * Error Messages & Codes  */ export const ERROR_CODES = {   // Room errors   ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',   ROOM_UNAVAILABLE: 'ROOM_UNAVAILABLE',   ROOM_TYPE_NOT_FOUND: 'ROOM_TYPE_NOT_FOUND',   // Booking errors   BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',   BOOKING_FAILED: 'BOOKING_FAILED'...

---
### 📄 src\db\constants\reviewRatings.js
/**  * Review Rating Constants  */ export const RATING_SCALE = {   POOR: 1,   FAIR: 2,   GOOD: 3,   VERY_GOOD: 4,   EXCELLENT: 5, }; export const RATING_LABELS = {   1: 'Poor',   2: 'Fair',   3: 'Good',   4: 'Very Good',   5: 'Excellent', }; export const RATING_COLORS = {   1: '#F44336', // Red  ...

---
### 📄 src\db\constants\roomTypes.js
/**  * Room Type Constants  */ export const ROOM_TYPES = {   STANDARD: 'STD',   DELUXE: 'DLX',   SUITE: 'SUI',   PENTHOUSE: 'PEN',   COMBO: 'CMB', }; export const ROOM_TYPE_NAMES = {   STD: 'Standard',   DLX: 'Deluxe',   SUI: 'Suite',   PEN: 'Penthouse',   CMB: 'Combo Package', }; export const RO...

---
### 📄 src\db\data.js
// ⚠️ DEPRECATED: This file is kept for reference only // All room data and images now come from Supabase // Icons are no longer needed (was used for seed data only)  // ==================== ROOM CATEGORIES ==================== // Room categories for better organization and management export c...

---
### 📄 src\db\index.js
/**  * Database Module - Central Export Point  * Import all queries, mutations, constants, and transformers from here  */ // ============ QUERIES ============ export * from './queries/rooms'; export * from './queries/bookings'; export * from './queries/reviews'; export * from './queries/restaurants...

---
### 📄 src\db\mutations\bookings.js
/**  * Booking Mutations - Create, update, delete booking data in Supabase  */ import { supabase } from '../../utils/supabaseClient'; /**  * Create new booking  * @param {Object} bookingData - Booking data  * @returns {Promise<Object|null>} Created booking or null  */ export const createBooking = ...

---
### 📄 src\db\mutations\restaurants.js
/**  * Restaurant Booking Mutations - Create, update, delete restaurant booking data  */ import { supabase } from '../../utils/supabaseClient'; /**  * Create restaurant booking  * @param {Object} bookingData - Booking data  * @returns {Promise<Object|null>} Created booking or null  */ export const...

---
### 📄 src\db\mutations\reviews.js
/**  * Review Mutations - Create, update, delete review data in Supabase  */ import { supabase } from '../../utils/supabaseClient'; /**  * Create new review  * @param {Object} reviewData - Review data  * @returns {Promise<Object|null>} Created review or null  */ export const createReview = async (...

---
### 📄 src\db\mutations\spas.js
/**  * Spa Booking Mutations - Create, update, delete spa booking data  */ import { supabase } from '../../utils/supabaseClient'; /**  * Create spa booking  * @param {Object} bookingData - Booking data  * @returns {Promise<Object|null>} Created booking or null  */ export const createSpaBooking = a...

---
### 📄 src\db\queries\bookings.js
/**  * Booking Queries - Fetch booking data from Supabase  */ import { supabase } from '../../utils/supabaseClient'; /**  * Fetch all bookings for current user  * @param {string} userId - User ID  * @returns {Promise<Array>} Array of user bookings  */ export const fetchUserBookings = async (userId...

---
### 📄 src\db\queries\restaurants.js
/**  * Restaurant Booking Queries - Fetch restaurant booking data from Supabase  */ import { supabase } from '../../utils/supabaseClient'; /**  * Fetch all restaurant bookings for user  * @param {string} userId - User ID  * @returns {Promise<Array>} Array of restaurant bookings  */ export const fe...

---
### 📄 src\db\queries\reviews.js
/**  * Review Queries - Fetch review data from Supabase  */ import { supabase } from '../../utils/supabaseClient'; /**  * Fetch all reviews for a room  * @param {string} roomId - Room ID  * @returns {Promise<Array>} Array of reviews  */ export const fetchRoomReviews = async (roomId) => {   try {  ...

---
### 📄 src\db\queries\rooms.js
/**  * Room Queries - Fetch room data from Supabase  */ import { supabase } from '../../utils/supabaseClient'; import { getImageUrlsByRoomType } from '../../utils/supabaseStorageUrls'; /**  * Fetch all rooms with room types and images  * @returns {Promise<Array>} Array of rooms with images  */ exp...

---
### 📄 src\db\queries\spas.js
/**  * Spa Booking Queries - Fetch spa booking data from Supabase  */ import { supabase } from '../../utils/supabaseClient'; /**  * Fetch all spa bookings for user  * @param {string} userId - User ID  * @returns {Promise<Array>} Array of spa bookings  */ export const fetchUserSpaBookings = async (...

---
### 📄 src\features\admin\AdminHeader.jsx
/**  * AdminHeader Component  * Reusable header for admin sections  * Props:  *   - title: String  *   - description: String  *   - onAddNew: Function  *   - addButtonLabel: String  */ import { FaPlus } from 'react-icons/fa'; const AdminHeader = ({   title,   description,   onAddNew,   addButtonLa...

---
### 📄 src\features\admin\AdminModal.jsx
/**  * AdminModal Component  * Reusable modal component for admin forms  * Props:  *   - isOpen: Boolean  *   - title: String  *   - onClose: Function  *   - onSubmit: Function  *   - isLoading: Boolean  *   - children: ReactNode (form fields)  *   - submitLabel: String  */ import { FaCheck } from ...

---
### 📄 src\features\admin\AdminTable.jsx
/**  * AdminTable Component  * Reusable table component for admin panels  * Props:  *   - columns: Array of { key, label, render? }  *   - data: Array of data  *   - isLoading: Boolean  *   - error: String  *   - onEdit: Function  *   - onDelete: Function  *   - onRetry: Function  */ import { FaEdi...

---
### 📄 src\features\admin\index.js
/**  * Admin Features Index  * Central export point for admin components  */ export { default as AdminTable } from './AdminTable'; export { default as AdminModal } from './AdminModal'; export { default as AdminHeader } from './AdminHeader'; ...

---
### 📄 src\hooks\index.js
/**  * Hooks Index  * Central export point for all custom hooks  */ export { useCRUD } from './useCRUD'; export { useModalForm } from './useModalForm'; ...

---
### 📄 src\hooks\useCRUD.js
/**  * Custom Hook: useCRUD  * Reusable CRUD operations for any Supabase table  * Handles: Fetch, Create, Update, Delete with loading/error states  */ import { useState, useCallback } from 'react'; import { notifySuccess, notifyError } from '../utils/notifications'; // supabase client import remove...

---
### 📄 src\hooks\useModalForm.js
/**  * Custom Hook: useModalForm  * Reusable modal form management  * Handles: Open/Close modal, Edit/Create mode, Form data reset  */ import { useState, useCallback } from 'react'; export const useModalForm = (initialFormData) => {   const [isModalOpen, setIsModalOpen] = useState(false);   const ...

---
### 📄 src\main.jsx
import { RoomContext } from './context/RoomContext'; import { AuthContext } from './context/AuthContext'; import { LanguageProvider } from './context/LanguageContext'; import { BookingProvider } from './context/BookingContext'; import ReactDOM from 'react-dom/client' import React from 'react' ...

---
### 📄 src\pages\Admin.jsx
import { useState } from 'react'; import AdminSidebar from '../components/AdminSidebar'; import RoomTypesManagement from '../components/admin/RoomTypesManagement'; import RoomsManagement from '../components/admin/RoomsManagement'; import PriceRulesManagement from '../components/admin/PriceRulesM...

---
### 📄 src\pages\CleanupPage.jsx
import { useNavigate } from "react-router-dom"; import {   clearAllTestData,   clearBookings,   clearReviews, } from "../utils/clearTestData"; import { LogoDark } from "../assets";  const CleanupPage = () => {   const navigate = useNavigate();    const handleClearAll = () => {     if ( ...

---
### 📄 src\pages\Contact.jsx
import { useState } from 'react'; import { ScrollToTop, Toast } from '../components'; import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaClock } from 'react-icons/fa';  const STORAGE_URL = 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms';  const contactCards = [...

---
### 📄 src\pages\ForgotPassword.jsx
import { useState } from 'react'; import { useNavigate, Link } from 'react-router-dom'; import { LogoDark } from '../assets'; import { FaEnvelope, FaSpinner, FaArrowLeft, FaCheckCircle } from 'react-icons/fa'; import Toast from '../components/Toast'; import { useAuth } from '../context/AuthCont...

---
### 📄 src\pages\Home.jsx
import { BookForm, HeroSlider, Rooms, ScrollToTop } from '../components';   const Home = () => {    return (     <div>       <ScrollToTop />        <HeroSlider />        <div className='container mx-auto relative'>          <div className='bg-accent/20 mt-4 p-4 lg:absolute lg:left-0 lg:...

---
### 📄 src\pages\index.js
export { default as RoomDetails } from "./RoomDetails"; export { default as Home } from "./Home"; export { default as Admin } from "./Admin"; export { default as Login } from "./Login"; export { default as Register } from "./Register"; export { default as ForgotPassword } from "./ForgotPassword...

---
### 📄 src\pages\Login.jsx
import { useState, useEffect } from 'react'; import { useNavigate, useLocation, Link } from 'react-router-dom'; import { useAuth } from '../context/AuthContext'; import { FaEnvelope, FaLock, FaSpinner, FaGoogle, FaFacebook } from 'react-icons/fa'; import Toast from '../components/Toast';  cons...

---
### 📄 src\pages\Register.jsx
import { useState, useEffect } from 'react'; import { useNavigate, Link } from 'react-router-dom'; import { useAuth } from '../context/AuthContext'; import { FaEnvelope, FaLock, FaUser, FaSpinner, FaGoogle, FaFacebook } from 'react-icons/fa'; import Toast from '../components/Toast';  const STO...

---
### 📄 src\pages\ResetPassword.jsx
import { useState, useEffect } from 'react'; import { useNavigate, useSearchParams, Link } from 'react-router-dom'; import { LogoDark } from '../assets'; import { FaLock, FaSpinner, FaCheck, FaArrowLeft } from 'react-icons/fa'; import Toast from '../components/Toast'; import { useAuth } from '....

---
### 📄 src\pages\RestaurantPage.jsx
import { useState } from "react"; import { ScrollToTop, Toast } from "../components"; import QRPayment from "../components/QRPayment"; import Invoice from "../components/Invoice"; import { useBookingContext } from "../context/BookingContext"; import { useAuth } from "../context/AuthContext"; /...

---
### 📄 src\pages\RoomDetails.jsx
import { ScrollToTop, Toast } from '../components'; import QRPayment from '../components/QRPayment'; import Invoice from '../components/Invoice'; import { useRoomContext } from '../context/RoomContext'; import { useAuth } from '../context/AuthContext'; import { hotelRules } from '../constants/d...

---
### 📄 src\pages\RoomsPage.jsx
import { BookForm, Rooms, ScrollToTop, CategoryFilter } from "../components"; import {   FaCrown,   FaConciergeBell,   FaWineGlassAlt,   FaUmbrellaBeach, } from "react-icons/fa"; import { useRoomContext } from "../context/RoomContext"; import { useMemo } from "react";  const STORAGE_URL = ...

---
### 📄 src\pages\SpaPage.jsx
import { useState } from 'react'; import { ScrollToTop, Toast } from '../components'; import QRPayment from '../components/QRPayment'; import Invoice from '../components/Invoice'; import { useBookingContext } from '../context/BookingContext'; import { useAuth } from '../context/AuthContext'; /...

---
### 📄 src\pages\UserDashboard.jsx
import { useMemo, useState, useEffect } from 'react'; import { useAuth } from '../context/AuthContext'; import { useRoomContext } from '../context/RoomContext'; import { useBookingContext } from '../context/BookingContext'; // NEW import { Link } from 'react-router-dom'; import DatePicker from ...

---
### 📄 src\services\adminService.js
import { supabase } from '../utils/supabaseClient'; /**  * Service layer for admin-specific data fetching  */ export const fetchAllRoomBookingsForAdmin = async () => {   try {     const { data, error } = await supabase       .from('bookings')       .select(`         *,         rooms:room_id (room_...

---
### 📄 src\services\adminService_REFACTORED.js
import { supabase } from '../utils/supabaseClient'; /**  * ============================================================================  * ADMIN SERVICE LAYER - FINALIZED  * ============================================================================  *   * This service centralizes ALL admin-relate...

---
### 📄 src\services\authService.js
import { supabase } from '../utils/supabaseClient'; /**  * Authentication service layer for Supabase Auth operations  */ /**  * Sign in with email and password  */ export const signInWithEmail = async (email, password) => {   try {     const { data, error } = await supabase.auth.signInWithPassword...

---
### 📄 src\services\bookingService.js
import { supabase } from '../utils/supabaseClient'; /**  * Service layer for room booking operations  */ export const createBooking = async (bookingData) => {   try {     const { data, error } = await supabase       .from('bookings')       .insert([bookingData])       .select();     if (error) thr...

---
### 📄 src\services\roomService.js
import { supabase } from '../utils/supabaseClient'; /**  * Service layer for room and pricing operations  */ export const fetchRoomTypes = async () => {   try {     const { data, error } = await supabase       .from('room_types')       .select('*')       .eq('is_active', true)       .order('code',...

---
### 📄 src\style\chatbox.css
/* ChatBox Custom Animations & Styles */  /* Fade in animation */ @keyframes fadeIn {   from {     opacity: 0;   }   to {     opacity: 1;   } }  @keyframes slideUp {   from {     transform: translateY(20px);     opacity: 0;   }   to {     transform: translateY(0);     opacity: 1;...

---
### 📄 src\style\datepicker.css
.react-datepicker {   background   : white;   border       : none;   border-radius: 0;   font-family  : 'Barlow';   border       : 1px solid #aa8453;   font-size    : 0.9rem; }  .react-datepicker__header {   border : #aa8453;   color  : #fff;   padding: 0; }  .react-datepicker-wrapper...

---
### 📄 src\style\index.css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,6...

---
### 📄 src\utils\aiAssistant.js
/**  * AI Assistant utilities for hotel booking chatbot  */  // Intelligent room recommendations based on user preferences export const recommendRooms = (rooms, preferences) => {   const { adults, kids, budget, amenities = [] } = preferences;    const filtered = rooms.filter((room) => {    ...

---
### 📄 src\utils\chatboxConfig.js
/**  * ChatBox Configuration & Customization Examples  * Bạn có thể copy những ví dụ này vào ChatBox.jsx để tùy chỉnh  */  // ============================================ // 1. THÊM THÊM QUICK ACTIONS // ============================================  const EXTENDED_QUICK_ACTIONS = [   { lab...

---
### 📄 src\utils\chatboxTesting.js
/**  * ChatBox Testing & Example Scenarios  * Sử dụng những ví dụ này để test các tính năng của chatbox  */  // ============================================ // 1. TEST SCENARIOS // ============================================  export const TEST_SCENARIOS = {   // Scenario 1: Khách mới tìm ...

---
### 📄 src\utils\chatboxValidation.js
/**  * Validation & Error Handling for ChatBox  */  export const BookingErrors = {   INVALID_NAME: {     code: "INVALID_NAME",     message: "❌ Vui lòng nhập tên đầy đủ",     vietnamese: "Tên không được để trống",   },   INVALID_EMAIL: {     code: "INVALID_EMAIL",     message: "❌ Email kh...

---
### 📄 src\utils\clearTestData.js
/**  * Clear all test data from localStorage  * Run this once to clean up the system  */ export const clearAllTestData = () => {   const keysToDelete = [     "hotel_bookings",     "hotel_room_reviews",     "users",     "hotels",     "auth_token",     "user_session",   ];    keysToDelet...

---
### 📄 src\utils\emailService.js
import emailjs from '@emailjs/browser';  // ============================================ // EMAILJS CONFIGURATION // ============================================ // Để gửi email thật, bạn cần: // 1. Đăng ký tài khoản tại https://www.emailjs.com/ (miễn phí) // 2. Tạo Email Service (Gmail) và l...

---
### 📄 src\utils\notifications.js
/**  * Notification/Toast System  * Centralized notification handling for the application  */ // Store active notifications let notifications = []; let notificationId = 0; let listeners = []; /**  * Subscribe to notification changes  */ export const subscribeToNotifications = (callback) => {   lis...

---
### 📄 src\utils\ScrollToTop.js
import { useLocation } from 'react-router-dom'; import { useEffect } from 'react';  const ScrollToTop = () => {    const { pathname } = useLocation();    useEffect(() => {     window.scrollTo(0, 0);   }, [pathname]);  };  export default ScrollToTop; ...

---
### 📄 src\utils\supabaseClient.js
import { createClient } from '@supabase/supabase-js'; // Initialize Supabase client // For Vite, use import.meta.env instead of process.env const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sxteddkozzqniebfstag.supabase.co'; const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_K...

---
### 📄 src\utils\supabaseStorageUrls.js
/**  * Supabase Storage URLs Configuration  * Bucket: hotel-rooms  * Base URL: https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms  */ const SUPABASE_PROJECT_ID = 'sxteddkozzqniebfstag'; const STORAGE_BUCKET = 'hotel-rooms'; const STORAGE_BASE_URL = `https://${SUPABASE_PRO...

---
### 📄 trich_xuat_v2.js
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; // --- CẤU HÌNH --- const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename); // Tên file kết quả const OUTPUT_FILE = 'CODE_NGUON_V2.txt'; // ĐƯỜNG DẪN MỤC TIÊU: Đi vào folder V...

---
### 📄 vite.config.js
import { defineConfig } from 'vite' import react from '@vitejs/plugin-react' import svgr from 'vite-plugin-svgr'  // https://vitejs.dev/config/ export default defineConfig({   plugins: [react(),  svgr()], }) ...

---

# 🚀 Recommended Copilot Startup Command

Copy & paste this into Copilot every time you switch accounts:

```
/LOAD_PROJECT_CONTEXT
Please load and understand PROJECT_KNOWLEDGE_BASE.md entirely.
Follow all patterns, architecture, and conventions described here.
```

---

# 🧭 Next Steps / Roadmap
Add your ongoing tasks here.  
Copilot will follow it as your personal development roadmap.

---

# ✅ End of Knowledge Base  
