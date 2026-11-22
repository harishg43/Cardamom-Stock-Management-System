import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import AddStock from './pages/AddStock'
import StockMovement from './pages/StockMovement'
import StockList from './pages/StockList'
import ReportsPage from './components/ReportsPage'
import { isSupabaseConfigured, supabase } from './services/supabaseClient'

const translations = {
  en: {
    appTitle: 'Gurusamy Cardamom Management System',
    appSubtitle: '',
    superAdminLogin: 'Super Admin Login',
    superAdminDetails: 'Enter Gmail address and password for Super Admin access.',
    superAdminSignIn: 'Super Admin Sign In',
    gmail: 'Gmail Address',
    adminLogin: 'Admin Login',
    userLogin: 'User Login',
    adminDetails: 'Enter name, phone number, and password for Admin access.',
    userDetails: 'Enter user details to view your own stock records.',
    name: 'Name',
    phoneNumber: 'Phone Number',
    email: 'Email',
    password: 'Password',
    adminSignIn: 'Admin Sign In',
    userSignIn: 'User Sign In',
    pleaseWait: 'Please wait...',
    dashboardTitle: 'Cardamom Stock Dashboard',
    dashboardSubtitle: 'Track customer stocks, drying ratio, and available stock in one place.',
    role: 'Role',
    roleAdmin: 'admin',
    roleUser: 'user',
    logout: 'Logout',
    authDisabled: 'Auth disabled (configure Supabase env to enable)',
    loadingStocks: 'Loading stocks from database...',
    summary: 'Summary',
    addStock: 'Add Stock',
    createUser: 'Create User',
    filters: 'Filters',
    stockList: 'Stock List',
    totalEntries: 'Total Entries',
    totalBeforeDry: 'Total Before Dry',
    totalAfterDry: 'Total After Dry',
    totalStockOut: 'Total Stock Out',
    avgDryedRatio: 'Average Dryed Ratio',
    availableStock: 'Available Stock',
    latestEntryDate: 'Latest Entry Date',
    adminCreateUser: 'Admin Create User',
    selectRole: 'Account Role',
    standardUser: 'User',
    adminUser: 'Admin',
    superAdminRole: 'SUPER_ADMIN',
    adminRole: 'ADMIN',
    userRole: 'USER',
    superAdminDashboard: 'Super Admin Dashboard',
    adminDashboard: 'Admin Dashboard',
    userDashboard: 'User Dashboard',
    totalAdmins: 'Total Admins',
    totalUsers: 'Total Users',
    totalFarms: 'Total Farms',
    totalStock: 'Total Stock',
    totalStockHistory: 'Total Stock History',
    totalSales: 'Total Sales',
    totalLabour: 'Total Labour Records',
    totalExpenses: 'Total Expenses',
    mainAdminOnlyCreateAdmin: '403 Forbidden: Only Super Admin can create Admin accounts.',
    mainAdminNotice: 'Super Admin Access: Viewing all system records.',
    createUserNote: 'Create a user account with name, phone number, and password.',
    creating: 'Creating...',
    deleteUser: 'Delete User',
    deleteUserNote: 'Delete access for a user by name and phone number.',
    deleting: 'Deleting...',
    deletedUserLoginBlocked: 'This user account was deleted by admin.',
    blockedUsersTableMissing: 'User delete setup missing: run SQL -> create table if not exists public.blocked_users (id bigserial primary key, name text, phone text unique not null, blocked_at timestamptz not null default now());',
    loginEmailForUser: 'Login email for this user will be:',
    filteredResultsHere: 'Filtered results here:',
    searchName: 'Search Name',
    fromDate: 'From Date',
    toDate: 'To Date',
    clearFilters: 'Clear Filters',
    searchByCustomer: 'Search by customer',
    loginModeSelector: 'Login mode selector',
    editStock: 'Edit Stock',
    addCardamomStock: 'Add Cardamom Stock',
    adminOnlyStockNote: 'Only admin can add or edit stock records.',
    customerName: 'Customer Name',
    phoneValidation: 'Phone number must be exactly 10 digits.',
    date: 'Date',
    beforeDryWeight: 'Before Dry Weight (kg)',
    afterDryWeight: 'After Dry Weight (kg)',
    dryedRatio: 'Dryed Ratio',
    updateStock: 'Update Stock',
    saveStock: 'Save Stock',
    cancel: 'Cancel',
    noStockRecords: 'No stock records yet. Add your first entry above.',
    beforeDryColumn: 'Before Dry (kg)',
    afterDryColumn: 'After Dry (kg)',
    availableStockColumn: 'Available Stock (kg)',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    stockMovement: 'Stock In / Stock Out',
    movementType: 'Movement Type',
    stockIn: 'Stock In',
    stockOut: 'Stock Out',
    quantityKg: 'Quantity (kg)',
    submitMovement: 'Submit Movement',
    reason: 'Reason',
    reasonRequired: 'Reason is required for stock out.',
    reasonPlaceholder: 'Enter stock out reason',
    currentAvailableByCustomer: 'Current Available Stock by Customer',
    currentBalance: 'Current Balance',
    noCustomerBalance: 'No customer balance records yet.',
    currentAvailableNow: 'Current Available Stock',
    stockHistory: 'Stock History',
    noStockHistory: 'No stock history yet.',
    reports: 'Reports',
    roundReports: 'Round Reports',
    startDateAdmin: 'Start Date (Admin)',
    finishDateAdmin: 'Finish Date (Admin)',
    startRound: 'Start Round',
    finishOpenRound: 'Finish Open Round',
    roundLabel: 'Round',
    nextRound: 'Next Round',
    roundStatus: 'Status',
    roundOpen: 'Open',
    roundFinished: 'Finished',
    roundActive: 'Active',
    totalEntities: 'Total Entries',
    monthlyReport: 'Monthly Report',
    yearlyReport: 'Yearly Report',
    period: 'Period',
    noRoundReports: 'No round reports yet. Start the first round.',
    roundSetupMissing: 'Round report setup missing: run SQL to create public.stock_rounds table.',
    finishDateMustBeAfterStart: 'Finish date must be on or after start date.',
    openRoundExists: 'Finish the current open round before starting a new one.',
    noOpenRoundToFinish: 'No open round found to finish.',
    roundSaved: 'Round started successfully.',
    roundFinishedSuccess: 'Round finished successfully.',
    saveReportDates: 'Save Report Dates',
    reportDatesUpdated: 'Report dates updated successfully.',
    deleteAllReports: 'Delete All Reports',
    reportsDeleted: 'Reports deleted successfully.',
    reportPersonName: 'Report Person Name',
    reportPersonPhone: 'Report Person Phone',
    reportPersonRequired: 'Select person phone to view or manage round reports.',
    liveReport: 'Live Report',
    liveReportFor: 'Live report for',
    liveRoundPeriod: 'Round Period',
    liveRoundNumber: 'Round Number',
    liveRoundStatus: 'Round Status',
    liveRoundCurrent: 'Current Open Round',
    liveRoundLatest: 'Latest Finished Round',
    noLiveReport: 'No live round report available for this person yet.',
    activeUsers: 'Active Users',
    noActiveUsers: 'No users have an active round right now.',
    reportHistory: 'Report History',
    noReportHistory: 'No report history available for this person yet.',
    updateStatusChecking: 'Checking app updates...',
    updateStatusCurrent: 'App is up to date.',
    updateStatusAvailable: 'New app update is available.',
    updateNow: 'Update now',
    checkAgain: 'Check again',
    currentVersion: 'Current version',
    latestVersion: 'Latest version',
    updateNoUninstall: 'Update installs over your existing app. No uninstall needed.',
    updateConfigMissing: 'Set VITE_APP_UPDATE_MANIFEST_URL to a public HTTPS update JSON URL.',
    createAdmin: 'Create Admin',
    deleteUserOrAdmin: 'Delete User or Admin',
    deleteSuperAdminAccountsNote: 'Super Admin can delete both User and Admin accounts. The Super Admin account cannot be deleted.',
    deleteAssignedAccountsNote: 'You can delete only accounts assigned to you.',
    status: 'Status',
    activate: 'Activate',
    deactivate: 'Deactivate',
    adminAccounts: 'Admin Accounts',
    userAccounts: 'User Accounts',
    accountInactive: 'This account is inactive.',
    ownershipMigrationPending: 'Ownership migration is pending. Existing stock records loaded in compatibility mode.',
    accountStatusOnlyAdmin: 'Only Admin or Super Admin can change account status.',
    onlySuperAdminStatus: '403 Forbidden: Only Super Admin can change ADMIN account status.',
    accountActivated: 'Account activated successfully.',
    accountDeactivated: 'Account deactivated successfully.',
    deleteAccountConfirm: 'Delete account?',
    superAdminLoginRequired: 'Super Admin login requires Gmail address and password.',
    notSuperAdmin: 'This account is not Super Admin. Please use Admin or User Login.',
    superAdminLoggedIn: 'Super Admin logged in successfully.',
    adminLoginRequired: 'Admin login requires name, phone number, and password.',
    notAdmin: 'This account is not Admin. Please use User Login.',
    adminLoggedIn: 'Admin logged in successfully.',
    userLoginRequired: 'User login requires name, phone and password.',
    useAdminLogin: 'Use Admin Login for admin accounts.',
    userLoggedIn: 'User logged in successfully.',
    onlyAdminCreateAccounts: '403 Forbidden: Only Admin or Super Admin can create accounts.',
    onlySuperAdminCreateAdmin: '403 Forbidden: Only Super Admin can create Admin accounts.',
    superAdminRoleManual: '403 Forbidden: Super Admin role cannot be created manually.',
    cannotDeleteSelf: 'You cannot delete the account that is currently signed in.',
    cannotDeleteSuperAdmin: '403 Forbidden: The Super Admin account cannot be deleted.',
    onlySuperAdminDeleteAdmin: '403 Forbidden: Only Super Admin can delete ADMIN accounts.',
    deleteAccountFailed: 'Delete account failed',
    databaseAccessFailed: 'Database access failed',
    stockOutTooLarge: 'Stock out cannot be greater than available stock.',
    onlyAdminEdit: 'Only admin can edit stock entries.',
    onlyAdminDelete: 'Only admin can delete stock entries.',
    onlyAdminReports: 'Only admin can manage round reports.',
    supabaseNotConfigured: 'Supabase is not configured.',
    customerPhoneColumnMissing: 'Database load failed: add customer_phone column using SQL -> alter table public.stocks add column if not exists customer_phone text;',
    databaseConnectionFailed: 'Database connection failed. Check internet access, Supabase project status, and VITE_SUPABASE_URL.',
    adminPhoneValidation: 'Admin phone number must be exactly 10 digits.',
    userPhoneValidation: 'User phone number must be exactly 10 digits.',
    requiredAccountFields: 'Name, phone, and password are required.',
    accountCreateFailed: 'Create account failed',
    accountCreated: 'Account created successfully',
    onlyAdminDeleteUsers: 'Only admin can delete users.',
    deleteNamePhoneRequired: 'Name and phone are required to delete user.',
    deletePhoneValidation: 'User phone number must be exactly 10 digits.',
    accountDeletedBlocked: 'User account deleted and access blocked',
    updateFailed: 'Update failed',
    insertFailed: 'Insert failed',
    stockMovementFailed: 'Stock movement failed',
    deleteFailed: 'Delete failed',
    startDateRequired: 'is required.',
  },
  ta: {
    appTitle: 'குருசாமி ஏலக்காய்',
    appSubtitle: '',
    superAdminLogin: 'சூப்பர் நிர்வாகி உள்நுழைவு',
    superAdminDetails: 'சூப்பர் நிர்வாகி அணுகலுக்கு உங்கள் ஜிமெயில் முகவரி மற்றும் கடவுச்சொல்லை உள்ளிடவும்.',
    superAdminSignIn: 'சூப்பர் நிர்வாகி உள்நுழை',
    gmail: 'ஜிமெயில் முகவரி',
    adminLogin: 'நிர்வாகி உள்நுழைவு',
    userLogin: 'பயனர் உள்நுழைவு',
    adminDetails: 'நிர்வாகி அணுகலுக்கு பெயர், தொலைபேசி எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.',
    userDetails: 'உங்கள் சரக்கு பதிவுகளை பார்க்க பயனர் விவரங்களை உள்ளிடவும்.',
    name: 'பெயர்',
    phoneNumber: 'தொலைபேசி எண்',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    adminSignIn: 'நிர்வாகி உள்நுழை',
    userSignIn: 'பயனர் உள்நுழை',
    pleaseWait: 'காத்திருக்கவும்...',
    dashboardTitle: 'ஏலக்காய் சரக்கு டாஷ்போர்டு',
    dashboardSubtitle: 'வாடிக்கையாளர் சரக்குகள், உலர்த்தும் விகிதம் மற்றும் கிடைக்கும் சரக்கை ஒரே இடத்தில் கண்காணிக்கவும்.',
    role: 'பதவி',
    roleAdmin: 'நிர்வாகி',
    roleUser: 'பயனர்',
    logout: 'வெளியேறு',
    authDisabled: 'அங்கீகாரம் முடக்கப்பட்டது',
    loadingStocks: 'தரவுத்தளத்திலிருந்து ஏற்றுகிறது...',
    summary: 'சுருக்கம்',
    addStock: 'சரக்கு சேர்',
    createUser: 'பயனர் உருவாக்கு',
    filters: 'வடிகட்டிகள்',
    stockList: 'சரக்கு பட்டியல்',
    totalEntries: 'மொத்த பதிவுகள்',
    totalBeforeDry: 'மொத்த உலர்முன் எடை',
    totalAfterDry: 'மொத்த உலர்பின் எடை',
    totalStockOut: 'மொத்த சரக்கு செலவு',
    avgDryedRatio: 'சராசரி உலர் விகிதம்',
    availableStock: 'கிடைக்கும் சரக்கு',
    latestEntryDate: 'சமீபத்திய தேதி',
    adminCreateUser: 'நிர்வாகி பயனர் உருவாக்கு',
    selectRole: 'கணக்கு பங்கு',
    standardUser: 'பயனர்',
    adminUser: 'நிர்வாகி',
    superAdminRole: 'சூப்பர் நிர்வாகி',
    adminRole: 'நிர்வாகி',
    userRole: 'பயனர்',
    superAdminDashboard: 'சூப்பர் நிர்வாகி டாஷ்போர்டு',
    adminDashboard: 'நிர்வாகி டாஷ்போர்டு',
    userDashboard: 'பயனர் டாஷ்போர்டு',
    totalAdmins: 'மொத்த நிர்வாகிகள்',
    totalUsers: 'மொத்த பயனர்கள்',
    totalFarms: 'மொத்த தோட்டங்கள்',
    totalStock: 'மொத்த சரக்கு',
    totalStockHistory: 'மொத்த சரக்கு வரலாறு',
    totalSales: 'மொத்த விற்பனை',
    totalLabour: 'மொத்த தொழிலாளர் பதிவுகள்',
    totalExpenses: 'மொத்த செலவுகள்',
    mainAdminOnlyCreateAdmin: '403 தடையானது: சூப்பர் நிர்வாகி மட்டுமே நிர்வாகி கணக்குகளை உருவாக்க முடியும்.',
    mainAdminNotice: 'சூப்பர் நிர்வாகி அணுகல்: அனைத்து அமைப்புகளையும் பார்க்கிறீர்கள்.',
    createUserNote: 'பெயர், தொலைபேசி எண் மற்றும் கடவுச்சொல்லுடன் பயனர் கணக்கை உருவாக்கவும்.',
    creating: 'உருவாக்குகிறது...',
    deleteUser: 'பயனர் நீக்கு',
    deleteUserNote: 'பெயர் மற்றும் தொலைபேசி எண்ணை பயன்படுத்தி பயனர் அணுகலை நீக்கவும்.',
    deleting: 'நீக்குகிறது...',
    deletedUserLoginBlocked: 'இந்த பயனர் கணக்கை நிர்வாகி நீக்கியுள்ளார்.',
    blockedUsersTableMissing: 'பயனர் நீக்கும் அமைப்பு இல்லை: இந்த SQL-ஐ இயக்கவும் -> create table if not exists public.blocked_users (id bigserial primary key, name text, phone text unique not null, blocked_at timestamptz not null default now());',
    loginEmailForUser: 'இந்த பயனரின் உள்நுழைவு மின்னஞ்சல்:',
    filteredResultsHere: 'வடிகட்டப்பட்ட முடிவுகள்:',
    searchName: 'பெயர் தேடு',
    fromDate: 'தொடக்க தேதி',
    toDate: 'முடிவு தேதி',
    clearFilters: 'வடிகட்டிகளை அழி',
    searchByCustomer: 'வாடிக்கையாளர் பெயரால் தேடு',
    loginModeSelector: 'உள்நுழைவு முறை தேர்வு',
    editStock: 'சரக்கு திருத்து',
    addCardamomStock: 'ஏலக்காய் சரக்கு சேர்',
    adminOnlyStockNote: 'நிர்வாகி மட்டுமே சரக்கு பதிவுகளை சேர்க்கலாம் அல்லது திருத்தலாம்.',
    customerName: 'வாடிக்கையாளர் பெயர்',
    phoneValidation: 'தொலைபேசி எண் சரியாக 10 இலக்கங்களாக இருக்க வேண்டும்.',
    date: 'தேதி',
    beforeDryWeight: 'உலர்முன் எடை (கிகி)',
    afterDryWeight: 'உலர்பின் எடை (கிகி)',
    dryedRatio: 'உலர் விகிதம்',
    updateStock: 'சரக்கு புதுப்பி',
    saveStock: 'சரக்கு சேமி',
    cancel: 'ரத்துசெய்',
    noStockRecords: 'இன்னும் சரக்கு பதிவுகள் இல்லை. மேலே உங்கள் முதல் பதிவை சேர்க்கவும்.',
    beforeDryColumn: 'உலர்முன் (கிகி)',
    afterDryColumn: 'உலர்பின் (கிகி)',
    availableStockColumn: 'கிடைக்கும் சரக்கு (கிகி)',
    actions: 'செயல்கள்',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    stockMovement: 'சரக்கு வரவு / செலவு',
    movementType: 'நகர்வு வகை',
    stockIn: 'சரக்கு வரவு',
    stockOut: 'சரக்கு செலவு',
    quantityKg: 'அளவு (கிகி)',
    submitMovement: 'நகர்வை சேமி',
    reason: 'காரணம்',
    reasonRequired: 'சரக்கு செலவிற்கு காரணம் கட்டாயம்.',
    reasonPlaceholder: 'சரக்கு செலவு காரணத்தை உள்ளிடவும்',
    currentAvailableByCustomer: 'வாடிக்கையாளர் வாரியாக தற்போதைய கிடைக்கும் சரக்கு',
    currentBalance: 'தற்போதைய இருப்பு',
    noCustomerBalance: 'இன்னும் வாடிக்கையாளர் இருப்பு பதிவுகள் இல்லை.',
    currentAvailableNow: 'தற்போதைய கிடைக்கும் சரக்கு',
    stockHistory: 'சரக்கு வரலாறு',
    noStockHistory: 'இன்னும் சரக்கு வரலாறு இல்லை.',
    reports: 'அறிக்கைகள்',
    roundReports: 'சுற்று அறிக்கைகள்',
    startDateAdmin: 'தொடக்க தேதி (நிர்வாகி)',
    finishDateAdmin: 'முடிவு தேதி (நிர்வாகி)',
    startRound: 'சுற்றை தொடங்கு',
    finishOpenRound: 'திறந்த சுற்றை முடி',
    roundLabel: 'சுற்று',
    nextRound: 'அடுத்த சுற்று',
    roundStatus: 'நிலை',
    roundOpen: 'திறந்தது',
    roundFinished: 'முடிந்தது',
    totalEntities: 'மொத்த பதிவுகள்',
    monthlyReport: 'மாதாந்திர அறிக்கை',
    yearlyReport: 'வருடாந்திர அறிக்கை',
    period: 'காலம்',
    noRoundReports: 'இன்னும் சுற்று அறிக்கைகள் இல்லை. முதல் சுற்றை தொடங்கவும்.',
    roundSetupMissing: 'சுற்று அறிக்கை அமைப்பு இல்லை: public.stock_rounds அட்டவணையை உருவாக்க SQL இயக்கவும்.',
    finishDateMustBeAfterStart: 'முடிவு தேதி தொடக்க தேதியுடன் சமமாக அல்லது அதற்குப் பிறகு இருக்க வேண்டும்.',
    openRoundExists: 'புதிய சுற்றை தொடங்குவதற்கு முன் தற்போதைய திறந்த சுற்றை முடிக்கவும்.',
    noOpenRoundToFinish: 'முடிக்க திறந்த சுற்று இல்லை.',
    roundSaved: 'சுற்று வெற்றிகரமாக தொடங்கப்பட்டது.',
    roundFinishedSuccess: 'சுற்று வெற்றிகரமாக முடிக்கப்பட்டது.',
    reportPersonName: 'அறிக்கை நபர் பெயர்',
    reportPersonPhone: 'அறிக்கை நபர் தொலைபேசி',
    reportPersonRequired: 'சுற்று அறிக்கைகளைப் பார்க்க அல்லது நிர்வகிக்க நபர் தொலைபேசியைத் தேர்ந்தெடுக்கவும்.',
    saveReportDates: 'அறிக்கை தேதிகளை சேமி',
    reportDatesUpdated: 'அறிக்கை தேதிகள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன.',
    deleteAllReports: 'அனைத்து அறிக்கைகளையும் நீக்கு',
    reportsDeleted: 'அறிக்கைகள் வெற்றிகரமாக நீக்கப்பட்டன.',
    liveReport: 'நேரடி அறிக்கை',
    liveReportFor: 'இந்த நபருக்கான நேரடி அறிக்கை',
    liveRoundPeriod: 'சுற்று காலம்',
    liveRoundNumber: 'சுற்று எண்',
    liveRoundStatus: 'சுற்று நிலை',
    roundActive: 'செயலில்',
    liveRoundCurrent: 'தற்போதைய திறந்த சுற்று',
    liveRoundLatest: 'சமீபத்தில் முடிந்த சுற்று',
    noLiveReport: 'இந்த நபருக்கான நேரடி சுற்று அறிக்கை இன்னும் இல்லை.',
    activeUsers: 'செயலில் உள்ள பயனர்கள்',
    noActiveUsers: 'இப்போது எந்த பயனருக்கும் செயலில் சுற்று இல்லை.',
    reportHistory: 'அறிக்கை வரலாறு',
    noReportHistory: 'இந்த நபருக்கான அறிக்கை வரலாறு இன்னும் இல்லை.',
    createAdmin: 'நிர்வாகியை உருவாக்கு',
    deleteUserOrAdmin: 'பயனர் அல்லது நிர்வாகியை நீக்கு',
    deleteSuperAdminAccountsNote: 'சூப்பர் நிர்வாகி பயனர் மற்றும் நிர்வாகி கணக்குகளை நீக்கலாம். சூப்பர் நிர்வாகி கணக்கை நீக்க முடியாது.',
    deleteAssignedAccountsNote: 'உங்களுக்கு ஒதுக்கப்பட்ட கணக்குகளை மட்டுமே நீக்கலாம்.',
    status: 'நிலை',
    activate: 'செயல்படுத்து',
    deactivate: 'முடக்கு',
    adminAccounts: 'நிர்வாகி கணக்குகள்',
    userAccounts: 'பயனர் கணக்குகள்',
    accountInactive: 'இந்த கணக்கு செயலற்றது.',
    ownershipMigrationPending: 'உரிமை மாற்றம் நிலுவையில் உள்ளது. தற்போதுள்ள சரக்கு பதிவுகள் இணக்கமான முறையில் ஏற்றப்பட்டன.',
    accountStatusOnlyAdmin: 'நிர்வாகி அல்லது சூப்பர் நிர்வாகி மட்டுமே கணக்கு நிலையை மாற்ற முடியும்.',
    onlySuperAdminStatus: '403 தடை: சூப்பர் நிர்வாகி மட்டுமே நிர்வாகி கணக்கு நிலையை மாற்ற முடியும்.',
    accountActivated: 'கணக்கு வெற்றிகரமாக செயல்படுத்தப்பட்டது.',
    accountDeactivated: 'கணக்கு வெற்றிகரமாக முடக்கப்பட்டது.',
    deleteAccountConfirm: 'கணக்கை நீக்க வேண்டுமா?',
    superAdminLoginRequired: 'சூப்பர் நிர்வாகி உள்நுழைவுக்கு ஜிமெயில் முகவரி மற்றும் கடவுச்சொல் தேவை.',
    notSuperAdmin: 'இந்த கணக்கு சூப்பர் நிர்வாகி அல்ல. நிர்வாகி அல்லது பயனர் உள்நுழைவை பயன்படுத்தவும்.',
    superAdminLoggedIn: 'சூப்பர் நிர்வாகி வெற்றிகரமாக உள்நுழைந்தார்.',
    adminLoginRequired: 'நிர்வாகி உள்நுழைவுக்கு பெயர், தொலைபேசி எண் மற்றும் கடவுச்சொல் தேவை.',
    notAdmin: 'இந்த கணக்கு நிர்வாகி அல்ல. பயனர் உள்நுழைவை பயன்படுத்தவும்.',
    adminLoggedIn: 'நிர்வாகி வெற்றிகரமாக உள்நுழைந்தார்.',
    userLoginRequired: 'பயனர் உள்நுழைவுக்கு பெயர், தொலைபேசி எண் மற்றும் கடவுச்சொல் தேவை.',
    useAdminLogin: 'நிர்வாகி கணக்குகளுக்கு நிர்வாகி உள்நுழைவை பயன்படுத்தவும்.',
    userLoggedIn: 'பயனர் வெற்றிகரமாக உள்நுழைந்தார்.',
    onlyAdminCreateAccounts: '403 தடை: நிர்வாகி அல்லது சூப்பர் நிர்வாகி மட்டுமே கணக்குகளை உருவாக்க முடியும்.',
    onlySuperAdminCreateAdmin: '403 தடை: சூப்பர் நிர்வாகி மட்டுமே நிர்வாகி கணக்குகளை உருவாக்க முடியும்.',
    superAdminRoleManual: '403 தடை: சூப்பர் நிர்வாகி பங்கை கைமுறையாக உருவாக்க முடியாது.',
    cannotDeleteSelf: 'தற்போது உள்நுழைந்த கணக்கை நீக்க முடியாது.',
    cannotDeleteSuperAdmin: '403 தடை: சூப்பர் நிர்வாகி கணக்கை நீக்க முடியாது.',
    onlySuperAdminDeleteAdmin: '403 தடை: சூப்பர் நிர்வாகி மட்டுமே நிர்வாகி கணக்குகளை நீக்க முடியும்.',
    deleteAccountFailed: 'கணக்கு நீக்குதல் தோல்வி',
    databaseAccessFailed: 'தரவுத்தள அணுகல் தோல்வி',
    stockOutTooLarge: 'சரக்கு வெளியேற்றம் கிடைக்கும் சரக்கை விட அதிகமாக இருக்கக்கூடாது.',
    onlyAdminEdit: 'நிர்வாகி மட்டுமே சரக்கு பதிவுகளை திருத்த முடியும்.',
    onlyAdminDelete: 'நிர்வாகி மட்டுமே சரக்கு பதிவுகளை நீக்க முடியும்.',
    onlyAdminReports: 'நிர்வாகி மட்டுமே சுற்று அறிக்கைகளை நிர்வகிக்க முடியும்.',
    supabaseNotConfigured: 'Supabase அமைக்கப்படவில்லை.',
    customerPhoneColumnMissing: 'தரவுத்தளத்தில் customer_phone பத்தி இல்லை: alter table public.stocks add column if not exists customer_phone text;',
    databaseConnectionFailed: 'தரவுத்தள இணைப்பு தோல்வி. இணையம், Supabase திட்ட நிலை மற்றும் VITE_SUPABASE_URL சரிபார்க்கவும்.',
    adminPhoneValidation: 'நிர்வாகி தொலைபேசி எண் சரியாக 10 இலக்கங்களாக இருக்க வேண்டும்.',
    userPhoneValidation: 'பயனர் தொலைபேசி எண் சரியாக 10 இலக்கங்களாக இருக்க வேண்டும்.',
    requiredAccountFields: 'பெயர், தொலைபேசி எண் மற்றும் கடவுச்சொல் தேவை.',
    accountCreateFailed: 'கணக்கு உருவாக்கம் தோல்வி',
    accountCreated: 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது',
    onlyAdminDeleteUsers: 'நிர்வாகி மட்டுமே பயனர்களை நீக்க முடியும்.',
    deleteNamePhoneRequired: 'நீக்க பெயர் மற்றும் தொலைபேசி எண் தேவை.',
    deletePhoneValidation: 'பயனர் தொலைபேசி எண் சரியாக 10 இலக்கங்களாக இருக்க வேண்டும்.',
    accountDeletedBlocked: 'பயனர் கணக்கு நீக்கப்பட்டு அணுகல் தடுக்கப்பட்டது',
    updateFailed: 'புதுப்பித்தல் தோல்வி',
    insertFailed: 'சேர்த்தல் தோல்வி',
    stockMovementFailed: 'சரக்கு மாற்றம் தோல்வி',
    deleteFailed: 'நீக்குதல் தோல்வி',
    startDateRequired: 'தேவை.',
  },
  ml: {
    appTitle: 'ഗുരുസാമി ഏലക്കായ്',
    appSubtitle: '',
    superAdminLogin: 'സൂപ്പർ അഡ്മിൻ ലോഗിൻ',
    superAdminDetails: 'സൂപ്പർ അഡ്മിൻ പ്രവേശനത്തിനായി ജിമെയിൽ വിലാസവും പാസ്‌വേഡും നൽകുക.',
    superAdminSignIn: 'സൂപ്പർ അഡ്മിൻ സൈൻ ഇൻ',
    gmail: 'ജിമെയിൽ വിലാസം',
    adminLogin: 'അഡ്മിൻ ലോഗിൻ',
    userLogin: 'ഉപയോക്തൃ ലോഗിൻ',
    adminDetails: 'അഡ്മിൻ പ്രവേശനത്തിനായി പേര്, ഫോൺ നമ്പർ, പാസ്‌വേഡ് എന്നിവ നൽകുക.',
    userDetails: 'നിങ്ങളുടെ സ്‌റ്റോക്ക് രേഖകൾ കാണാൻ ഉപയോക്തൃ വിവരങ്ങൾ നൽകുക.',
    name: 'പേര്',
    phoneNumber: 'ഫോൺ നമ്പർ',
    email: 'ഇമെയിൽ',
    password: 'പാസ്‌വേഡ്',
    adminSignIn: 'അഡ്മിൻ സൈൻ ഇൻ',
    userSignIn: 'ഉപയോക്തൃ സൈൻ ഇൻ',
    pleaseWait: 'കാത്തിരിക്കൂ...',
    dashboardTitle: 'ഏലക്കായ് സ്‌റ്റോക്ക് ഡാഷ്‌ബോർഡ്',
    dashboardSubtitle: 'ഉപഭോക്തൃ സ്‌റ്റോക്കുകൾ, ഉണക്കൽ അനുപാതം, ലഭ്യമായ സ്‌റ്റോക്ക് എന്നിവ ഒരിടത്ത് ട്രാക്ക് ചെയ്യുക.',
    role: 'റോൾ',
    roleAdmin: 'അഡ്മിൻ',
    roleUser: 'ഉപയോക്താവ്',
    logout: 'ലോഗൗട്ട്',
    authDisabled: 'ഓത്ത് പ്രവർത്തനം ഓഫ് ആണ്',
    loadingStocks: 'ഡേറ്റാബേസിൽ നിന്ന് ലോഡ് ചെയ്യുന്നു...',
    summary: 'സംഗ്രഹം',
    addStock: 'സ്‌റ്റോക്ക് ചേർക്കുക',
    createUser: 'ഉപയോക്താവ് സൃഷ്ടിക്കുക',
    filters: 'ഫിൽട്ടറുകൾ',
    stockList: 'സ്‌റ്റോക്ക് ലിസ്റ്റ്',
    totalEntries: 'മൊത്തം എൻട്രികൾ',
    totalBeforeDry: 'ഉണക്കുന്നതിന് മുൻപ് ആകെ',
    totalAfterDry: 'ഉണക്കിയ ശേഷം ആകെ',
    totalStockOut: 'മൊത്തം സ്‌റ്റോക്ക് ഔട്ട്',
    avgDryedRatio: 'ശരാശരി ഉണക്കൽ അനുപാതം',
    availableStock: 'ലഭ്യമായ സ്‌റ്റോക്ക്',
    latestEntryDate: 'ഏറ്റവും പുതിയ തീയതി',
    adminCreateUser: 'അഡ്മിൻ ഉപയോക്താവ് സൃഷ്ടിക്കുക',
    selectRole: 'അക്കൗണ്ട് റോൾ',
    standardUser: 'ഉപയോക്താവ്',
    adminUser: 'അഡ്മിൻ',
    superAdminRole: 'സൂപ്പർ അഡ്മിൻ',
    adminRole: 'അഡ്മിൻ',
    userRole: 'ഉപയോക്താവ്',
    superAdminDashboard: 'സൂപ്പർ അഡ്മിൻ ഡാഷ്‌ബോർഡ്',
    adminDashboard: 'അഡ്മിൻ ഡാഷ്‌ബോർഡ്',
    userDashboard: 'ഉപയോക്തൃ ഡാഷ്‌ബോർഡ്',
    totalAdmins: 'മൊത്തം അഡ്മിന്മാർ',
    totalUsers: 'മൊത്തം ഉപയോക്താക്കൾ',
    totalFarms: 'ആകെ തോട്ടങ്ങൾ',
    totalStock: 'ആകെ സ്‌റ്റോക്ക്',
    totalStockHistory: 'ആകെ സ്‌റ്റോക്ക് ചരിത്രം',
    totalSales: 'ആകെ വിൽപന',
    totalLabour: 'ആകെ തൊഴിലാളി റെക്കോർഡുകൾ',
    totalExpenses: 'ആകെ ചെലവുകൾ',
    mainAdminOnlyCreateAdmin: '403 നിരോധിച്ചിരിക്കുന്നു: സൂപ്പർ അഡ്മിൻ മാത്രമേ അഡ്മിൻ അക്കൗണ്ടുകൾ സൃഷ്തിക്കാൻ കഴിയൂ.',
    mainAdminNotice: 'സൂപ്പർ അഡ്മിൻ പ്രവേശനം: എല്ലാ സിസ്റ്റം റെക്കോർഡുകളും കാണുന്നു.',
    createUserNote: 'പേര്, ഫോൺ നമ്പർ, പാസ്‌വേഡ് ഉപയോഗിച്ച് ഒരു ഉപയോക്തൃ അക്കൗണ്ട് സൃഷ്ടിക്കുക.',
    creating: 'സൃഷ്ടിക്കുന്നു...',
    deleteUser: 'ഉപയോക്താവിനെ ഇല്ലാതാക്കുക',
    deleteUserNote: 'പേര്, ഫോൺ നമ്പർ ഉപയോഗിച്ച് ഉപയോക്തൃ പ്രവേശനം ഒഴിവാക്കുക.',
    deleting: 'ഇല്ലാതാക്കുന്നു...',
    deletedUserLoginBlocked: 'ഈ ഉപയോക്തൃ അക്കൗണ്ട് അഡ്മിൻ ഇല്ലാതാക്കി.',
    blockedUsersTableMissing: 'ഉപയോക്തൃ ഇല്ലാതാക്കൽ ക്രമീകരണം ലഭ്യമല്ല: ഈ SQL പ്രവർത്തിപ്പിക്കുക -> create table if not exists public.blocked_users (id bigserial primary key, name text, phone text unique not null, blocked_at timestamptz not null default now());',
    loginEmailForUser: 'ഈ ഉപയോക്താവിന്റെ ലോഗിൻ ഇമെയിൽ:',
    filteredResultsHere: 'ഫിൽട്ടർ ചെയ്ത ഫലങ്ങൾ:',
    searchName: 'പേര് തിരയുക',
    fromDate: 'ആരംഭ തീയതി',
    toDate: 'അവസാന തീയതി',
    clearFilters: 'ഫിൽട്ടറുകൾ മായ്ക്കുക',
    searchByCustomer: 'ഉപഭോക്താവിനെ തിരയുക',
    loginModeSelector: 'ലോഗിൻ മോഡ് തിരഞ്ഞെടുക്കൽ',
    editStock: 'സ്‌റ്റോക്ക് എഡിറ്റ് ചെയ്യുക',
    addCardamomStock: 'ഏലക്കായ് സ്‌റ്റോക്ക് ചേർക്കുക',
    adminOnlyStockNote: 'അഡ്മിന് മാത്രമേ സ്‌റ്റോക്ക് രേഖകൾ ചേർക്കാനോ എഡിറ്റ് ചെയ്യാനോ കഴിയൂ.',
    customerName: 'ഉപഭോക്തൃ പേര്',
    phoneValidation: 'ഫോൺ നമ്പർ കൃത്യം 10 അക്കങ്ങളായിരിക്കണം.',
    date: 'തീയതി',
    beforeDryWeight: 'ഉണക്കുന്നതിന് മുൻപ് ഭാരം (കിലോ)',
    afterDryWeight: 'ഉണക്കിയ ശേഷം ഭാരം (കിലോ)',
    dryedRatio: 'ഉണക്കൽ അനുപാതം',
    updateStock: 'സ്‌റ്റോക്ക് അപ്‌ഡേറ്റ് ചെയ്യുക',
    saveStock: 'സ്‌റ്റോക്ക് സേവ് ചെയ്യുക',
    cancel: 'റദ്ദാക്കുക',
    noStockRecords: 'ഇതുവരെ സ്‌റ്റോക്ക് രേഖകൾ ഇല്ല. മുകളിൽ ആദ്യ എൻട്രി ചേർക്കുക.',
    beforeDryColumn: 'ഉണക്കുമുൻ (കിലോ)',
    afterDryColumn: 'ഉണക്കിയ (കിലോ)',
    availableStockColumn: 'ലഭ്യമായ സ്‌റ്റോക്ക് (കിലോ)',
    actions: 'പ്രവർത്തനങ്ങൾ',
    edit: 'എഡിറ്റ്',
    delete: 'ഇല്ലാതാക്കുക',
    stockMovement: 'സ്‌റ്റോക്ക് ഇൻ / സ്‌റ്റോക്ക് ഔട്ട്',
    movementType: 'മൂവ്‌മെന്റ് തരം',
    stockIn: 'സ്‌റ്റോക്ക് ഇൻ',
    stockOut: 'സ്‌റ്റോക്ക് ഔട്ട്',
    quantityKg: 'അളവ് (കിലോ)',
    submitMovement: 'മൂവ്‌മെന്റ് സേവ് ചെയ്യുക',
    reason: 'കാരണം',
    reasonRequired: 'സ്‌റ്റോക്ക് ഔട്ടിന് കാരണം നിർബന്ധമാണ്.',
    reasonPlaceholder: 'സ്‌റ്റോക്ക് ഔട്ട് കാരണം നൽകുക',
    currentAvailableByCustomer: 'ഉപഭോക്താവിനുസരിച്ചുള്ള നിലവിലെ ലഭ്യ സ്‌റ്റോക്ക്',
    currentBalance: 'നിലവിലെ ബാലൻസ്',
    noCustomerBalance: 'ഇതുവരെ ഉപഭോക്തൃ ബാലൻസ് രേഖകൾ ഇല്ല.',
    currentAvailableNow: 'നിലവിലെ ലഭ്യ സ്‌റ്റോക്ക്',
    stockHistory: 'സ്‌റ്റോക്ക് ചരിത്രം',
    noStockHistory: 'ഇതുവരെ സ്‌റ്റോക്ക് ചരിത്രം ഇല്ല.',
    reports: 'റിപ്പോർട്ടുകൾ',
    roundReports: 'റൗണ്ട് റിപ്പോർട്ടുകൾ',
    startDateAdmin: 'ആരംഭ തീയതി (അഡ്മിൻ)',
    finishDateAdmin: 'അവസാന തീയതി (അഡ്മിൻ)',
    startRound: 'റൗണ്ട് ആരംഭിക്കുക',
    finishOpenRound: 'തുറന്ന റൗണ്ട് പൂർത്തിയാക്കുക',
    roundLabel: 'റൗണ്ട്',
    nextRound: 'അടുത്ത റൗണ്ട്',
    roundStatus: 'നില',
    roundOpen: 'തുറന്നു',
    roundFinished: 'പൂർത്തിയായി',
    totalEntities: 'മൊത്തം എൻട്രികൾ',
    monthlyReport: 'മാസ റിപ്പോർട്ട്',
    yearlyReport: 'വാർഷിക റിപ്പോർട്ട്',
    period: 'കാലയളവ്',
    noRoundReports: 'ഇതുവരെ റൗണ്ട് റിപ്പോർട്ടുകൾ ഇല്ല. ആദ്യ റൗണ്ട് ആരംഭിക്കുക.',
    roundSetupMissing: 'റൗണ്ട് റിപ്പോർട്ട് ക്രമീകരണം ലഭ്യമല്ല: public.stock_rounds പട്ടിക സൃഷ്ടിക്കാൻ SQL പ്രവർത്തിപ്പിക്കുക.',
    finishDateMustBeAfterStart: 'അവസാന തീയതി ആരംഭ തീയതിയേക്കാൾ ശേഷം അല്ലെങ്കിൽ അതേ ദിവസം ആയിരിക്കണം.',
    openRoundExists: 'പുതിയ റൗണ്ട് ആരംഭിക്കാൻ മുമ്പ് നിലവിലെ തുറന്ന റൗണ്ട് പൂർത്തിയാക്കുക.',
    noOpenRoundToFinish: 'പൂർത്തിയാക്കാൻ തുറന്ന റൗണ്ട് ഇല്ല.',
    roundSaved: 'റൗണ്ട് വിജയകരമായി ആരംഭിച്ചു.',
    roundFinishedSuccess: 'റൗണ്ട് വിജയകരമായി പൂർത്തിയാക്കി.',
    reportPersonName: 'റിപ്പോർട്ട് വ്യക്തിയുടെ പേര്',
    reportPersonPhone: 'റിപ്പോർട്ട് വ്യക്തിയുടെ ഫോൺ',
    reportPersonRequired: 'റൗണ്ട് റിപ്പോർട്ടുകൾ കാണാനോ നിയന്ത്രിക്കാനോ വ്യക്തിയുടെ ഫോൺ തിരഞ്ഞെടുക്കുക.',
    saveReportDates: 'റിപ്പോർട്ട് തീയതികൾ സേവ് ചെയ്യുക',
    reportDatesUpdated: 'റിപ്പോർട്ട് തീയതികൾ വിജയകരമായി പുതുക്കി.',
    deleteAllReports: 'എല്ലാ റിപ്പോർട്ടുകളും നീക്കം ചെയ്യുക',
    reportsDeleted: 'റിപ്പോർട്ടുകൾ വിജയകരമായി നീക്കം ചെയ്തു.',
    liveReport: 'ലൈവ് റിപ്പോർട്ട്',
    liveReportFor: 'ഈ വ്യക്തിക്കുള്ള ലൈവ് റിപ്പോർട്ട്',
    liveRoundPeriod: 'റൗണ്ട് കാലയളവ്',
    liveRoundNumber: 'റൗണ്ട് നമ്പർ',
    liveRoundStatus: 'റൗണ്ട് നില',
    roundActive: 'സജീവം',
    liveRoundCurrent: 'നിലവിലെ തുറന്ന റൗണ്ട്',
    liveRoundLatest: 'ഏറ്റവും പുതിയ പൂർത്തിയായ റൗണ്ട്',
    noLiveReport: 'ഈ വ്യക്തിക്കായി ഇതുവരെ ലൈവ് റൗണ്ട് റിപ്പോർട്ട് ഇല്ല.',
    activeUsers: 'സജീവ ഉപയോക്താക്കൾ',
    noActiveUsers: 'ഇപ്പോൾ ഒരു ഉപയോക്താവിനും സജീവ റൗണ്ട് ഇല്ല.',
    reportHistory: 'റിപ്പോർട്ട് ചരിത്രം',
    noReportHistory: 'ഈ വ്യക്തിക്കായി ഇതുവരെ റിപ്പോർട്ട് ചരിത്രം ലഭ്യമല്ല.',
    createAdmin: 'അഡ്മിൻ സൃഷ്ടിക്കുക',
    deleteUserOrAdmin: 'ഉപയോക്താവോ അഡ്മിനോ നീക്കം ചെയ്യുക',
    deleteSuperAdminAccountsNote: 'സൂപ്പർ അഡ്മിന് ഉപയോക്താക്കളെയും അഡ്മിനുകളെയും നീക്കം ചെയ്യാം. സൂപ്പർ അഡ്മിൻ അക്കൗണ്ട് നീക്കം ചെയ്യാനാകില്ല.',
    deleteAssignedAccountsNote: 'നിങ്ങൾക്ക് കൈമാറിയ അക്കൗണ്ടുകൾ മാത്രമേ നീക്കം ചെയ്യാൻ കഴിയൂ.',
    status: 'സ്ഥിതി',
    activate: 'സജീവമാക്കുക',
    deactivate: 'നിഷ്ക്രിയമാക്കുക',
    adminAccounts: 'അഡ്മിൻ അക്കൗണ്ടുകൾ',
    userAccounts: 'ഉപയോക്തൃ അക്കൗണ്ടുകൾ',
    accountInactive: 'ഈ അക്കൗണ്ട് നിഷ്ക്രിയമാണ്.',
    ownershipMigrationPending: 'ഉടമസ്ഥത മാറ്റം നടക്കേണ്ടതുണ്ട്. നിലവിലുള്ള സ്റ്റോക്ക് രേഖകൾ അനുയോജ്യ രീതിയിൽ ലോഡ് ചെയ്തു.',
    accountStatusOnlyAdmin: 'അഡ്മിനോ സൂപ്പർ അഡ്മിനോ മാത്രമേ അക്കൗണ്ട് സ്ഥിതി മാറ്റാൻ കഴിയൂ.',
    onlySuperAdminStatus: '403 Forbidden: സൂപ്പർ അഡ്മിൻ മാത്രമേ അഡ്മിൻ അക്കൗണ്ട് സ്ഥിതി മാറ്റാൻ കഴിയൂ.',
    accountActivated: 'അക്കൗണ്ട് വിജയകരമായി സജീവമാക്കി.',
    accountDeactivated: 'അക്കൗണ്ട് വിജയകരമായി നിഷ്ക്രിയമാക്കി.',
    deleteAccountConfirm: 'അക്കൗണ്ട് നീക്കം ചെയ്യണോ?',
    superAdminLoginRequired: 'സൂപ്പർ അഡ്മിൻ ലോഗിനിന് ജിമെയിൽ വിലാസവും പാസ്‌വേഡും ആവശ്യമാണ്.',
    notSuperAdmin: 'ഈ അക്കൗണ്ട് സൂപ്പർ അഡ്മിൻ അല്ല. അഡ്മിൻ അല്ലെങ്കിൽ യൂസർ ലോഗിൻ ഉപയോഗിക്കുക.',
    superAdminLoggedIn: 'സൂപ്പർ അഡ്മിൻ വിജയകരമായി ലോഗിൻ ചെയ്തു.',
    adminLoginRequired: 'അഡ്മിൻ ലോഗിനിന് പേര്, ഫോൺ നമ്പർ, പാസ്‌വേഡ് ആവശ്യമാണ്.',
    notAdmin: 'ഈ അക്കൗണ്ട് അഡ്മിൻ അല്ല. യൂസർ ലോഗിൻ ഉപയോഗിക്കുക.',
    adminLoggedIn: 'അഡ്മിൻ വിജയകരമായി ലോഗിൻ ചെയ്തു.',
    userLoginRequired: 'ഉപയോക്തൃ ലോഗിനിന് പേര്, ഫോൺ നമ്പർ, പാസ്‌വേഡ് ആവശ്യമാണ്.',
    useAdminLogin: 'അഡ്മിൻ അക്കൗണ്ടുകൾക്ക് അഡ്മിൻ ലോഗിൻ ഉപയോഗിക്കുക.',
    userLoggedIn: 'ഉപയോക്താവ് വിജയകരമായി ലോഗിൻ ചെയ്തു.',
    onlyAdminCreateAccounts: '403 Forbidden: അഡ്മിനോ സൂപ്പർ അഡ്മിനോ മാത്രമേ അക്കൗണ്ടുകൾ സൃഷ്ടിക്കാൻ കഴിയൂ.',
    onlySuperAdminCreateAdmin: '403 Forbidden: സൂപ്പർ അഡ്മിൻ മാത്രമേ അഡ്മിൻ അക്കൗണ്ടുകൾ സൃഷ്ടിക്കാൻ കഴിയൂ.',
    superAdminRoleManual: '403 Forbidden: സൂപ്പർ അഡ്മിൻ роль കൈയാൽ സൃഷ്ടിക്കാൻ കഴിയില്ല.',
    cannotDeleteSelf: 'ഇപ്പോൾ ലോഗിൻ ചെയ്ത അക്കൗണ്ട് നീക്കം ചെയ്യാനാകില്ല.',
    cannotDeleteSuperAdmin: '403 Forbidden: സൂപ്പർ അഡ്മിൻ അക്കൗണ്ട് നീക്കം ചെയ്യാനാകില്ല.',
    onlySuperAdminDeleteAdmin: '403 Forbidden: സൂപ്പർ അഡ്മിൻ മാത്രമേ അഡ്മിൻ അക്കൗണ്ടുകൾ നീക്കം ചെയ്യാൻ കഴിയൂ.',
    deleteAccountFailed: 'അക്കൗണ്ട് നീക്കം ചെയ്യൽ പരാജയപ്പെട്ടു',
    databaseAccessFailed: 'ഡാറ്റാബേസ് പ്രവേശനം പരാജയപ്പെട്ടു',
    stockOutTooLarge: 'സ്റ്റോക്ക് ഔട്ട് ലഭ്യമായ സ്റ്റോക്കിനേക്കാൾ കൂടുതലാകരുത്.',
    onlyAdminEdit: 'അഡ്മിൻ മാത്രമേ സ്റ്റോക്ക് എൻട്രികൾ എഡിറ്റ് ചെയ്യാൻ കഴിയൂ.',
    onlyAdminDelete: 'അഡ്മിൻ മാത്രമേ സ്റ്റോക്ക് എൻട്രികൾ നീക്കം ചെയ്യാൻ കഴിയൂ.',
    onlyAdminReports: 'അഡ്മിൻ മാത്രമേ റൗണ്ട് റിപ്പോർട്ടുകൾ നിയന്ത്രിക്കാൻ കഴിയൂ.',
    supabaseNotConfigured: 'Supabase ക്രമീകരിച്ചിട്ടില്ല.',
    customerPhoneColumnMissing: 'ഡാറ്റാബേസിൽ customer_phone കോളം ഇല്ല: alter table public.stocks add column if not exists customer_phone text;',
    databaseConnectionFailed: 'ഡാറ്റാബേസ് കണക്ഷൻ പരാജയപ്പെട്ടു. ഇന്റർനെറ്റ്, Supabase പ്രോജക്ട് സ്ഥിതി, VITE_SUPABASE_URL പരിശോധിക്കുക.',
    adminPhoneValidation: 'അഡ്മിൻ ഫോൺ നമ്പർ കൃത്യമായി 10 അക്കമായിരിക്കണം.',
    userPhoneValidation: 'ഉപയോക്തൃ ഫോൺ നമ്പർ കൃത്യമായി 10 അക്കമായിരിക്കണം.',
    requiredAccountFields: 'പേര്, ഫോൺ നമ്പർ, പാസ്‌വേഡ് ആവശ്യമാണ്.',
    accountCreateFailed: 'അക്കൗണ്ട് സൃഷ്ടിക്കൽ പരാജയപ്പെട്ടു',
    accountCreated: 'അക്കൗണ്ട് വിജയകരമായി സൃഷ്ടിച്ചു',
    onlyAdminDeleteUsers: 'അഡ്മിൻ മാത്രമേ ഉപയോക്താക്കളെ നീക്കം ചെയ്യാൻ കഴിയൂ.',
    deleteNamePhoneRequired: 'നീക്കം ചെയ്യാൻ പേര് ಮತ್ತು ഫോൺ നമ്പർ ആവശ്യമാണ്.',
    deletePhoneValidation: 'ഉപയോക്തൃ ഫോൺ നമ്പർ കൃത്യമായി 10 അക്കമായിരിക്കണം.',
    accountDeletedBlocked: 'ഉപയോക്തൃ അക്കൗണ്ട് നീക്കം ചെയ്ത് പ്രവേശനം തടഞ്ഞു',
    updateFailed: 'അപ്‌ഡേറ്റ് പരാജയപ്പെട്ടു',
    insertFailed: 'ചേർക്കൽ പരാജയപ്പെട്ടു',
    stockMovementFailed: 'സ്റ്റോക്ക് മൂവ്‌മെന്റ് പരാജയപ്പെട്ടു',
    deleteFailed: 'നീക്കം ചെയ്യൽ പരാജയപ്പെട്ടു',
    startDateRequired: 'ആവശ്യമാണ്.',
  },
}

function App() {
  const getStoredLanguage = () => {
    const stored = localStorage.getItem('cardamom_language_guest')
    return stored === 'ta' || stored === 'ml' ? stored : 'en'
  }

  const [language, setLanguageState] = useState(getStoredLanguage)
  const t = (key) => translations[language]?.[key] ?? translations.en[key] ?? key

  const formatRatio = (value) => {
    const fixed = value.toFixed(3)
    return fixed.endsWith('0') ? fixed.slice(0, -1) : fixed
  }

  const normalizePersonName = (value) => {
    const name = String(value ?? '').trim().replace(/\s+/g, ' ')
    if (/^sunny$/i.test(name)) {
      return 'Sanny'
    }
    return name
  }

  const getPersonNameVariants = (value) => {
    const normalized = normalizePersonName(value)
    const variants = new Set([normalized])
    if (/^sanny$/i.test(normalized)) {
      variants.add('Sunny')
    }
    return Array.from(variants)
  }

  const isStockOutRecord = (item) =>
    Boolean(String(item?.stockReason ?? '').trim()) || Number(item?.afterDryWeight ?? 0) < 0

  const getSignedMovementQuantity = (item) => {
    const quantity = Math.abs(Number(item?.afterDryWeight ?? 0))
    return isStockOutRecord(item) ? -quantity : quantity
  }

  const [stocks, setStocks] = useState([])
  const [editId, setEditId] = useState(null)
  const [user, setUser] = useState(null)
  const setLanguage = useCallback((nextLanguage) => {
    const normalizedLanguage = ['en', 'ta', 'ml'].includes(nextLanguage)
      ? nextLanguage
      : 'en'
    setLanguageState(normalizedLanguage)
    localStorage.setItem(
      user?.id ? `cardamom_language_${user.id}` : 'cardamom_language_guest',
      normalizedLanguage,
    )
  }, [user])
  const [profile, setProfile] = useState(null)
  const [managedAccounts, setManagedAccounts] = useState([])
  const [superAdminLogin, setSuperAdminLogin] = useState({
    email: '',
    password: '',
  })
  const [adminLogin, setAdminLogin] = useState({
    name: '',
    phone: '',
    password: '',
  })
  const [userLogin, setUserLogin] = useState({
    name: '',
    phone: '',
    password: '',
  })
  const [userScope, setUserScope] = useState({
    name: '',
    phone: '',
  })
  const [authMessage, setAuthMessage] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [loginMode, setLoginMode] = useState('admin')
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'user',
  })
  const [createUserMessage, setCreateUserMessage] = useState('')
  const [createUserLoading, setCreateUserLoading] = useState(false)
  const [deleteUserForm, setDeleteUserForm] = useState({
    name: '',
    phone: '',
  })
  const [deleteUserLoading, setDeleteUserLoading] = useState(false)
  const [dbMessage, setDbMessage] = useState('')
  const [dbLoading, setDbLoading] = useState(false)
  const [hasStockReasonColumn, setHasStockReasonColumn] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortConfig, setSortConfig] = useState({
    key: 'stockDate',
    direction: 'desc',
  })
  const [activeDashboardView, setActiveDashboardView] = useState('summary')
  const [stockOpsView, setStockOpsView] = useState('movement')
  const [rounds, setRounds] = useState([])
  const [roundEditId, setRoundEditId] = useState(null)
  const [roundForm, setRoundForm] = useState({ startDate: '', finishDate: '', roundNumber: '' })
  const [reportPerson, setReportPerson] = useState({ name: '', phone: '' })
  const [roundMessage, setRoundMessage] = useState('')
  const [roundLoading, setRoundLoading] = useState(false)
  const [hasRoundNumberColumn, setHasRoundNumberColumn] = useState(true)

  const userRole = useMemo(() => {
    if (!user) {
      return 'GUEST'
    }
    if (profile?.role) {
      return String(profile.role).toUpperCase()
    }
    const roleMeta = String(user.app_metadata?.role ?? user.user_metadata?.role ?? '').toUpperCase()
    if (roleMeta === 'SUPER_ADMIN') {
      return 'SUPER_ADMIN'
    }

    if (roleMeta === 'ADMIN') {
      return 'ADMIN'
    }

    return 'USER'
  }, [user, profile])

  const isSuperAdmin = userRole === 'SUPER_ADMIN'
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
  const isMainAdmin = isSuperAdmin

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return
    }

    let isMounted = true

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setUser(data.session?.user ?? null)
      }
    }

    bootstrap()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      if (!session?.user) {
        setActiveDashboardView('summary')
        setStockOpsView('movement')
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null)
      setManagedAccounts([])
      return
    }

    const accountLanguage = localStorage.getItem(`cardamom_language_${user.id}`)
    if (accountLanguage === 'en' || accountLanguage === 'ta' || accountLanguage === 'ml') {
      setLanguageState(accountLanguage)
    }

    const loadProfileAndAccounts = async () => {
      const { data: ownProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id,name,phone,role,active,created_by')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        setDbMessage(`Database access failed: ${profileError.message}`)
        return
      }

      setProfile(ownProfile)

      if (ownProfile?.active === false) {
        await supabase.auth.signOut()
        setAuthMessage(t('accountInactive'))
        return
      }

      let accountsQuery = supabase
        .from('profiles')
        .select('id,name,phone,role,active,created_by,whatsapp_consent,sms_consent')
        .order('name', { ascending: true })

      if (ownProfile?.role === 'ADMIN') {
        accountsQuery = accountsQuery.eq('created_by', user.id)
      }

      const { data: accounts, error: accountsError } = await accountsQuery

      if (!accountsError) {
        setManagedAccounts(accounts ?? [])
      }
    }

    loadProfileAndAccounts()
  }, [user])

  const mapDbRowToStock = (row) => ({
    id: row.id,
    customerName: normalizePersonName(row.customer_name),
    customerPhone: row.customer_phone ?? '',
    stockDate: row.stock_date,
    beforeDryWeight: Number(row.before_dry_weight),
    afterDryWeight: Number(row.after_dry_weight),
    dryingRatio: Number(row.drying_ratio),
    availableStock: Number(row.available_stock),
    stockReason: row.stock_reason ?? '',
    userId: row.user_id ?? '',
    ownerId: row.owner_id ?? '',
    adminId: row.admin_id ?? '',
    createdBy: row.created_by ?? '',
  })

  const loadStocks = useCallback(async () => {
    if (!supabase || !user) {
      return
    }

    setDbLoading(true)
    setDbMessage('')
    let data = null
    let error = null

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const result = await supabase
        .from('stocks')
        .select(
          'id, customer_name, customer_phone, stock_date, before_dry_weight, after_dry_weight, drying_ratio, available_stock, user_id, owner_id, admin_id, created_by, stock_reason',
        )
        .order('stock_date', { ascending: false })

      data = result.data
      error = result.error
      if (!error) break
      if (attempt === 0) await new Promise((resolve) => window.setTimeout(resolve, 700))
    }

    if (error) {
      if (
        error.message.toLowerCase().includes('owner_id') ||
        error.message.toLowerCase().includes('admin_id') ||
        error.message.toLowerCase().includes('created_by')
      ) {
        const legacyFallback = await supabase
          .from('stocks')
          .select(
            'id, customer_name, customer_phone, stock_date, before_dry_weight, after_dry_weight, drying_ratio, available_stock, user_id',
          )
          .order('stock_date', { ascending: false })

        if (legacyFallback.error) {
          setDbMessage(`Database load failed: ${legacyFallback.error.message}`)
        } else {
          setDbMessage(t('ownershipMigrationPending'))
          setStocks((legacyFallback.data ?? []).map(mapDbRowToStock))
        }
        setDbLoading(false)
        return
      }

      if (error.message.toLowerCase().includes('stock_reason')) {
        const fallback = await supabase
          .from('stocks')
          .select(
            'id, customer_name, customer_phone, stock_date, before_dry_weight, after_dry_weight, drying_ratio, available_stock, user_id',
          )
          .order('stock_date', { ascending: false })

        if (fallback.error) {
          setDbMessage(`Database load failed: ${fallback.error.message}`)
          setDbLoading(false)
          return
        }

        setHasStockReasonColumn(false)
        setDbMessage('')
        setStocks((fallback.data ?? []).map(mapDbRowToStock))
        setDbLoading(false)
        return
      }

      if (error.message.toLowerCase().includes('customer_phone')) {
        setDbMessage(t('customerPhoneColumnMissing'))
      } else if (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('network')) {
        setDbMessage(t('databaseConnectionFailed'))
      } else {
        setDbMessage(`Database load failed: ${error.message}`)
      }
      setDbLoading(false)
      return
    }

    setHasStockReasonColumn(true)
    setStocks((data ?? []).map(mapDbRowToStock))
    setDbLoading(false)
  }, [user])

  const mapRoundRow = (row) => ({
    id: row.id,
    customerName: normalizePersonName(row.customer_name ?? ''),
    customerPhone: row.customer_phone ?? '',
    roundNumber: row.round_no ?? null,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
  })

  const loadRounds = useCallback(async () => {
    if (!supabase || !user) {
      return
    }

    const { data, error } = await supabase
      .from('stock_rounds')
      .select('id, customer_name, customer_phone, round_no, start_date, end_date, status, created_at')
      .order('start_date', { ascending: true })

    if (error) {
      if (error.message.toLowerCase().includes('round_no')) {
        const fallback = await supabase
          .from('stock_rounds')
          .select('id, customer_name, customer_phone, start_date, end_date, status, created_at')
          .order('start_date', { ascending: true })

        if (fallback.error) {
          if (fallback.error.message.toLowerCase().includes('stock_rounds')) {
            setRoundMessage(
              translations[language]?.roundSetupMissing ?? translations.en.roundSetupMissing,
            )
          } else {
            setRoundMessage(fallback.error.message)
          }
          return
        }

        setHasRoundNumberColumn(false)
        setRounds((fallback.data ?? []).map(mapRoundRow))
        return
      }

      if (error.message.toLowerCase().includes('stock_rounds')) {
        setRoundMessage(
          translations[language]?.roundSetupMissing ?? translations.en.roundSetupMissing,
        )
      } else {
        setRoundMessage(error.message)
      }
      return
    }

    setHasRoundNumberColumn(true)
    setRounds((data ?? []).map(mapRoundRow))
  }, [user, language])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    if (!user) {
      setStocks([])
      setRounds([])
      return
    }

    loadStocks()
    loadRounds()
  }, [user, loadStocks, loadRounds])

  const normalizePhone = (value) => value.replace(/\D/g, '').slice(0, 10)

  const getPhoneFromUser = (u, scope) => {
    if (u?.user_metadata?.phone) return normalizePhone(u.user_metadata.phone)
    if (scope?.phone) return normalizePhone(scope.phone)
    if (u?.email && u.email.includes('@user.local')) {
      return normalizePhone(u.email.replace('@user.local', ''))
    }
    return ''
  }

  const getAdminKeys = (u, scope) => {
    const keys = new Set()
    if (u?.id) keys.add(u.id)
    if (u?.email) keys.add(u.email)
    const phone = getPhoneFromUser(u, scope)
    if (phone) keys.add(phone)
    return Array.from(keys)
  }

  const userEmailFromPhone = (phone) => `${normalizePhone(phone)}@user.local`

  const getBlockedUserByPhone = useCallback(
    async (phone) => {
      if (!supabase) {
        return { blocked: false, error: null }
      }

      const normalizedPhone = normalizePhone(phone)
      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('phone', normalizedPhone)
        .limit(1)

      if (error) {
        return { blocked: false, error }
      }

      return { blocked: (data ?? []).length > 0, error: null }
    },
    [normalizePhone],
  )

  const getRole = (authUser) => {
    const roleFromAppMeta = authUser?.app_metadata?.role
    const roleFromUserMeta = authUser?.user_metadata?.role
    return String(roleFromAppMeta ?? roleFromUserMeta ?? '').toLowerCase()
  }

  const handleSuperAdminSignIn = async (event) => {
    event.preventDefault()

    if (!supabase) {
      setAuthMessage(t('authDisabled'))
      return
    }

    if (!superAdminLogin.email.trim() || !superAdminLogin.password) {
      setAuthMessage(t('superAdminLoginRequired'))
      return
    }

    setAuthLoading(true)
    setAuthMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: superAdminLogin.email.trim(),
      password: superAdminLogin.password,
    })

    if (error) {
      setAuthMessage(error.message)
    } else {
      const role = getRole(data.user)
      if (role !== 'super_admin') {
        await supabase.auth.signOut()
        setAuthMessage(t('notSuperAdmin'))
      } else {
        setActiveDashboardView('summary')
        setStockOpsView('movement')
        setAuthMessage(t('superAdminLoggedIn'))
        setSuperAdminLogin({ email: '', password: '' })
        setAdminLogin({ name: '', phone: '', password: '' })
        setUserLogin({ name: '', phone: '', password: '' })
      }
    }

    setAuthLoading(false)
  }

  const handleAdminSignIn = async (event) => {
    event.preventDefault()

    if (!supabase) {
      setAuthMessage(t('authDisabled'))
      return
    }

    if (!adminLogin.name.trim() || !adminLogin.phone.trim() || !adminLogin.password) {
      setAuthMessage(t('adminLoginRequired'))
      return
    }

    if (!/^\d{10}$/.test(adminLogin.phone)) {
      setAuthMessage(t('adminPhoneValidation'))
      return
    }

    setAuthLoading(true)
    setAuthMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmailFromPhone(adminLogin.phone),
      password: adminLogin.password,
    })

    if (error) {
      setAuthMessage(error.message)
    } else {
      const role = getRole(data.user)
      if (role !== 'admin' && role !== 'super_admin') {
        await supabase.auth.signOut()
        setAuthMessage(t('notAdmin'))
      } else {
        const enteredName = adminLogin.name.trim()
        const metaName = data.user?.user_metadata?.name
        const metaPhone = data.user?.user_metadata?.phone
        setActiveDashboardView('summary')
        setStockOpsView('movement')
        setAuthMessage(t('adminLoggedIn'))
        setUserScope({
          name: normalizePersonName(String(metaName ?? enteredName)),
          phone: normalizePhone(String(metaPhone ?? adminLogin.phone)),
        })
        setSuperAdminLogin({ email: '', password: '' })
        setAdminLogin({ name: '', phone: '', password: '' })
        setUserLogin({ name: '', phone: '', password: '' })
      }
    }

    setAuthLoading(false)
  }

  const handleUserSignIn = async (event) => {
    event.preventDefault()

    if (!supabase) {
      setAuthMessage(t('authDisabled'))
      return
    }

    if (!userLogin.name.trim() || !userLogin.phone.trim() || !userLogin.password) {
      setAuthMessage(t('userLoginRequired'))
      return
    }

    if (!/^\d{10}$/.test(userLogin.phone)) {
      setAuthMessage(t('userPhoneValidation'))
      return
    }

    setAuthLoading(true)
    setAuthMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmailFromPhone(userLogin.phone),
      password: userLogin.password,
    })

    if (error) {
      setAuthMessage(error.message)
    } else {
      const role = getRole(data.user)
      if (role === 'admin') {
        await supabase.auth.signOut()
        setAuthMessage(t('useAdminLogin'))
      } else {
        const phoneFromLogin = normalizePhone(String(data.user?.user_metadata?.phone ?? userLogin.phone))
        const blockedStatus = await getBlockedUserByPhone(phoneFromLogin)

        if (blockedStatus.error) {
          const blockedMessage = blockedStatus.error.message.toLowerCase().includes('blocked_users')
            ? t('blockedUsersTableMissing')
            : blockedStatus.error.message
          await supabase.auth.signOut()
          setAuthMessage(blockedMessage)
          setAuthLoading(false)
          return
        }

        if (blockedStatus.blocked) {
          await supabase.auth.signOut()
          setAuthMessage(t('deletedUserLoginBlocked'))
          setAuthLoading(false)
          return
        }

        const enteredName = userLogin.name.trim()
        const metaName = data.user?.user_metadata?.name
        const metaPhone = data.user?.user_metadata?.phone
        setActiveDashboardView('summary')
        setStockOpsView('movement')
        setAuthMessage(t('userLoggedIn'))
        setUserScope({
          name: normalizePersonName(String(metaName ?? enteredName)),
          phone: normalizePhone(String(metaPhone ?? userLogin.phone)),
        })
        setSuperAdminLogin({ email: '', password: '' })
        setAdminLogin({ name: '', phone: '', password: '' })
        setUserLogin({ name: '', phone: '', password: '' })
      }
    }

    setAuthLoading(false)
  }

  const handleLogout = async () => {
    if (!supabase) {
      return
    }
    setUserScope({ name: '', phone: '' })
    setActiveDashboardView('summary')
    setStockOpsView('movement')
    setAuthMessage('')
    setSuperAdminLogin({ email: '', password: '' })
    setAdminLogin({ name: '', phone: '', password: '' })
    setUserLogin({ name: '', phone: '', password: '' })
    await supabase.auth.signOut()
  }

  const handleSetAccountActive = async (account, active) => {
    if (!supabase || !isAdmin) {
      setCreateUserMessage(t('accountStatusOnlyAdmin'))
      return
    }

    if (account.role === 'ADMIN' && !isSuperAdmin) {
      setCreateUserMessage(t('onlySuperAdminStatus'))
      return
    }

    const { error } = await supabase.rpc('set_profile_active', {
      target_id: account.id,
      target_active: active,
    })

    if (error) {
      setCreateUserMessage(`Account status update failed: ${error.message}`)
      return
    }

    setManagedAccounts((previous) =>
      previous.map((item) => item.id === account.id ? { ...item, active } : item),
    )
    setCreateUserMessage(`${account.name} ${active ? t('accountActivated') : t('accountDeactivated')}`)
  }

  const handleSwitchLoginMode = (mode) => {
    setLoginMode(mode)
    setAuthMessage('')
    setSuperAdminLogin({ email: '', password: '' })
    setAdminLogin({ name: '', phone: '', password: '' })
    setUserLogin({ name: '', phone: '', password: '' })
  }

  const handleAdminCreateUser = async (event) => {
    event.preventDefault()

    if (!isAdmin) {
      setCreateUserMessage(t('onlyAdminCreateAccounts'))
      return
    }

    if (!supabase) {
      setCreateUserMessage(t('supabaseNotConfigured'))
      return
    }

    const name = normalizePersonName(createUserForm.name)
    const phone = normalizePhone(createUserForm.phone)
    const password = createUserForm.password
    const requestedRole = String(createUserForm.role || 'USER').toUpperCase()

    // 403 Forbidden enforcement: Only Super Admin can create ADMIN accounts
    if (requestedRole === 'ADMIN' && !isSuperAdmin) {
      setCreateUserMessage(t('onlySuperAdminCreateAdmin'))
      return
    }

    if (requestedRole === 'SUPER_ADMIN') {
      setCreateUserMessage(t('superAdminRoleManual'))
      return
    }

    if (!name || !phone || !password) {
      setCreateUserMessage(t('requiredAccountFields'))
      return
    }

    if (!/^\d{10}$/.test(phone)) {
      setCreateUserMessage(t('userPhoneValidation'))
      return
    }

    const { data: existingProfiles, error: duplicateCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .limit(1)

    if (duplicateCheckError) {
      setCreateUserMessage(`Create account failed: ${duplicateCheckError.message}`)
      return
    }

    if ((existingProfiles ?? []).length > 0) {
      setCreateUserMessage(`Create account failed: A user account already exists for phone number ${phone}.`)
      return
    }

    setCreateUserLoading(true)
    setCreateUserMessage('')

    const targetRole = requestedRole === 'ADMIN' ? 'ADMIN' : 'USER'
    const { data: created, error } = await supabase.functions.invoke('manage-users', {
      body: {
        action: 'create',
        name,
        phone,
        password,
        role: targetRole,
      },
    })

    if (error) {
      setCreateUserMessage(`Create account failed: ${error.message}`)
      setCreateUserLoading(false)
      return
    }
    if (created?.error) {
      setCreateUserMessage(`Create account failed: ${created.error}`)
      setCreateUserLoading(false)
      return
    }

    const creatorKey = `created_by_${user?.id ?? 'unknown'}`
    try {
      const existingCreated = JSON.parse(localStorage.getItem(creatorKey) || '[]')
      if (!existingCreated.includes(phone)) {
        existingCreated.push(phone)
        localStorage.setItem(creatorKey, JSON.stringify(existingCreated))
      }
      const globalUsersMap = JSON.parse(localStorage.getItem('rb_users_map') || '{}')
      globalUsersMap[phone] = {
        name,
        phone,
        role: targetRole,
        created_by: user?.id ?? 'unknown',
        created_at: new Date().toISOString(),
      }
      localStorage.setItem('rb_users_map', JSON.stringify(globalUsersMap))
    } catch {
      // LocalStorage fallback error ignored
    }

    setCreateUserMessage(`${targetRole} account created successfully: ${name} (${phone})`)
    setCreateUserForm({ name: '', phone: '', password: '', role: 'USER' })
    setCreateUserLoading(false)
  }

  const handleAdminDeleteUser = async (event, target = null) => {
    event.preventDefault()

    if (!isAdmin) {
      setCreateUserMessage(t('onlyAdminDeleteUsers'))
      return
    }

    if (!supabase) {
      setCreateUserMessage(t('supabaseNotConfigured'))
      return
    }

    const name = normalizePersonName(target?.name ?? deleteUserForm.name)
    const phone = normalizePhone(target?.phone ?? deleteUserForm.phone)
    let targetId = target?.id
    if (!targetId) {
      const matchedProfile = managedAccounts.find((account) => normalizePhone(account.phone) === phone)
      if (matchedProfile?.id) {
        targetId = matchedProfile.id
      }
    }

    if (!name || !phone) {
      setCreateUserMessage(t('deleteNamePhoneRequired'))
      return
    }

    if (!/^\d{10}$/.test(phone)) {
      setCreateUserMessage(t('deletePhoneValidation'))
      return
    }

    if (phone === getPhoneFromUser(user, userScope) || `${phone}@user.local` === String(user.email ?? '').toLowerCase()) {
      setCreateUserMessage(t('cannotDeleteSelf'))
      return
    }

    let globalUsersMap = {}
    try {
      globalUsersMap = JSON.parse(localStorage.getItem('rb_users_map') || '{}')
    } catch {
      globalUsersMap = {}
    }

    const targetAccount = globalUsersMap[phone]
    const targetRole = String(target?.role ?? targetAccount?.role ?? 'USER').toUpperCase()

    if (targetRole === 'SUPER_ADMIN') {
      setCreateUserMessage(t('cannotDeleteSuperAdmin'))
      return
    }

    if (targetRole === 'ADMIN' && !isSuperAdmin) {
      setCreateUserMessage(t('onlySuperAdminDeleteAdmin'))
      return
    }

    setDeleteUserLoading(true)
    setCreateUserMessage('')

    if (targetId) {
      const { error: deleteAccountError } = await supabase.rpc('delete_managed_account', {
        target_id: targetId,
      })

      if (deleteAccountError) {
        setCreateUserMessage(`Delete account failed: ${deleteAccountError.message}`)
        setDeleteUserLoading(false)
        return
      }
    }

    const { error: blockError } = await supabase
      .from('blocked_users')
      .upsert(
        {
          name,
          phone,
          blocked_at: new Date().toISOString(),
        },
        { onConflict: 'phone' },
      )

    if (blockError) {
      const blockedMessage = blockError.message.toLowerCase().includes('blocked_users')
        ? t('blockedUsersTableMissing')
        : `Delete user failed: ${blockError.message}`
      setCreateUserMessage(blockedMessage)
      setDeleteUserLoading(false)
      return
    }

    // Remove from tracking maps
    try {
      const globalUsersMap = JSON.parse(localStorage.getItem('rb_users_map') || '{}')
      delete globalUsersMap[phone]
      localStorage.setItem('rb_users_map', JSON.stringify(globalUsersMap))

      const currentUserId = user?.id ?? 'super_admin'
      const creatorKey = `created_by_${currentUserId}`
      const existingCreated = JSON.parse(localStorage.getItem(creatorKey) || '[]')
      const updatedList = existingCreated.filter((p) => p !== phone)
      localStorage.setItem(creatorKey, JSON.stringify(updatedList))
    } catch {
      // LocalStorage error ignored
    }

    setCreateUserMessage(`User account deleted and access blocked: ${name} (${phone})`)
    setDeleteUserForm({ name: '', phone: '' })
    await loadStocks()
    setDeleteUserLoading(false)
  }

  const toggleSort = (key) => {
    setSortConfig((previous) => {
      if (previous.key === key) {
        return {
          key,
          direction: previous.direction === 'asc' ? 'desc' : 'asc',
        }
      }

      return {
        key,
        direction: 'asc',
      }
    })
  }

  const editItem = useMemo(() => stocks.find((item) => item.id === editId) ?? null, [stocks, editId])
  const farmerOptions = useMemo(
    () =>
      managedAccounts
        .filter((account) => String(account.role ?? '').toUpperCase() === 'USER')
        .map((account) => ({
          id: account.id,
          name: account.name || '',
          phone: account.phone || '',
          whatsappConsent: Boolean(account.whatsapp_consent),
          smsConsent: Boolean(account.sms_consent),
        }))
        .filter((account) => account.id),
    [managedAccounts],
  )

  const scopedAndSortedStocks = useMemo(() => {
    const scopeName = userScope.name.trim().toLowerCase()
    const scopePhone = normalizePhone(userScope.phone)
    const currentPhone = getPhoneFromUser(user, userScope)
    const currentUserId = user?.id ?? 'super_admin'
    const adminKeys = getAdminKeys(user, userScope)

    let globalUsersMap = {}
    try {
      globalUsersMap = JSON.parse(localStorage.getItem('rb_users_map') || '{}')
    } catch {
      globalUsersMap = {}
    }

    let myAdminPhones = new Set()
    if (currentPhone) myAdminPhones.add(currentPhone)

    for (const key of adminKeys) {
      try {
        const list1 = JSON.parse(localStorage.getItem(`created_by_${key}`) || '[]')
        const list2 = JSON.parse(localStorage.getItem(`admin_stocks_${key}`) || '[]')
        list1.forEach((p) => myAdminPhones.add(normalizePhone(p)))
        list2.forEach((p) => myAdminPhones.add(normalizePhone(p)))
      } catch {}
    }

    Object.values(globalUsersMap).forEach((u) => {
      if (u && u.phone && (adminKeys.includes(u.created_by) || u.created_by === currentUserId || u.created_by === currentPhone)) {
        myAdminPhones.add(normalizePhone(u.phone))
      }
    })

    const myAdminPhonesArray = Array.from(myAdminPhones)

    const scoped = stocks.filter((item) => {
      const itemName = item.customerName.toLowerCase().trim()
      const itemPhone = normalizePhone(item.customerPhone ?? '')

      // 1. Super Admin sees ALL stocks across all users & admins
      if (isAdmin && isSuperAdmin) {
        return true
      }

      // 2. Secondary Admin sees:
      //    a. Stocks added by this admin
      //    b. Stocks belonging to users created/managed by this admin
      //    c. Stocks for admin's self phone
      //    d. Fallback if admin managed list is empty
      if (isAdmin) {
        const isAddedByThisAdmin = Boolean(
          (currentUserId && item.userId === currentUserId) ||
          (currentUserId && item.ownerId === currentUserId) ||
          (currentUserId && item.adminId === currentUserId) ||
          (currentUserId && item.createdBy === currentUserId) ||
          (item.userId && adminKeys.includes(item.userId))
        )
        const isManagedCustomer = Boolean(itemPhone && myAdminPhonesArray.includes(itemPhone))
        const isSelfPhone = Boolean(currentPhone && itemPhone === currentPhone)

        return isAddedByThisAdmin || isManagedCustomer || isSelfPhone
      }

      // 3. Standard User sees ONLY their own stock records
      const matchesUserScope =
        (currentPhone && itemPhone === currentPhone) ||
        (scopePhone && itemPhone === scopePhone && (!scopeName || itemName.includes(scopeName))) ||
        Boolean(currentUserId && item.userId === currentUserId)

      return matchesUserScope
    })

    const balanceByCustomer = new Map()

    for (const item of scoped) {
      const key = `${item.customerName.trim().toLowerCase()}::${normalizePhone(item.customerPhone ?? '')}`
      const previous = balanceByCustomer.get(key) ?? 0
      balanceByCustomer.set(key, previous + getSignedMovementQuantity(item))
    }

    const scopedWithComputedBalance = scoped.map((item) => {
      const key = `${item.customerName.trim().toLowerCase()}::${normalizePhone(item.customerPhone ?? '')}`
      return {
        ...item,
        availableStock: balanceByCustomer.get(key) ?? 0,
      }
    })

    const sorted = [...scopedWithComputedBalance].sort((a, b) => {
      const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1

      if (sortConfig.key === 'customerName') {
        return a.customerName.localeCompare(b.customerName) * directionMultiplier
      }

      if (sortConfig.key === 'stockDate') {
        return (new Date(a.stockDate).getTime() - new Date(b.stockDate).getTime()) * directionMultiplier
      }

      return (a[sortConfig.key] - b[sortConfig.key]) * directionMultiplier
    })

    return sorted
  }, [stocks, sortConfig, userScope, isAdmin])

  const filteredPreviewStocks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return scopedAndSortedStocks.filter((item) => {
      const matchesName = item.customerName.toLowerCase().includes(query)
      const matchesFromDate = fromDate ? item.stockDate >= fromDate : true
      const matchesToDate = toDate ? item.stockDate <= toDate : true

      return matchesName && matchesFromDate && matchesToDate
    })
  }, [scopedAndSortedStocks, searchTerm, fromDate, toDate])

  const summary = useMemo(() => {
    const totalEntries = scopedAndSortedStocks.length
    const totalBeforeDry = scopedAndSortedStocks.reduce((sum, item) => sum + item.beforeDryWeight, 0)
    const totalAfterDry = scopedAndSortedStocks.reduce((sum, item) => sum + getSignedMovementQuantity(item), 0)
    const totalStockOut = scopedAndSortedStocks.reduce(
      (sum, item) => (isStockOutRecord(item) ? sum + Math.abs(Number(item.afterDryWeight ?? 0)) : sum),
      0,
    )
    const availableByCustomer = new Map()
    for (const item of scopedAndSortedStocks) {
      const key = `${item.customerName.trim().toLowerCase()}::${normalizePhone(item.customerPhone ?? '')}`
      availableByCustomer.set(key, item.availableStock)
    }
    const totalAvailableStock = Array.from(availableByCustomer.values()).reduce(
      (sum, value) => sum + value,
      0,
    )
    const averageRatio =
      totalEntries === 0
        ? 0
        : scopedAndSortedStocks.reduce((sum, item) => sum + item.dryingRatio, 0) / totalEntries
    return {
      totalEntries,
      totalBeforeDry,
      totalAfterDry,
      totalStockOut,
      totalAvailableStock,
      averageRatio,
    }
  }, [scopedAndSortedStocks])

  const stockHistory = useMemo(
    () =>
      [...scopedAndSortedStocks].sort(
        (a, b) => new Date(b.stockDate).getTime() - new Date(a.stockDate).getTime(),
      ),
    [scopedAndSortedStocks],
  )

  const customerAvailableSummary = useMemo(() => {
    const summaryByCustomer = new Map()

    for (const item of scopedAndSortedStocks) {
      const key = `${item.customerName.trim().toLowerCase()}::${normalizePhone(item.customerPhone ?? '')}`
      const existing = summaryByCustomer.get(key)
      const candidateTime = new Date(item.stockDate).getTime()

      if (!existing) {
        summaryByCustomer.set(key, {
          customerName: item.customerName,
          customerPhone: item.customerPhone,
          availableStock: getSignedMovementQuantity(item),
          latestDate: item.stockDate,
        })
        continue
      }

      existing.availableStock += getSignedMovementQuantity(item)
      if (candidateTime >= new Date(existing.latestDate).getTime()) {
        existing.latestDate = item.stockDate
      }
    }

    return Array.from(summaryByCustomer.values()).sort((a, b) =>
      a.customerName.localeCompare(b.customerName),
    )
  }, [scopedAndSortedStocks])

  const invokeStockNotifications = useCallback(async (stockId, farmerId) => {
    if (!supabase || !stockId) return
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const { error } = await supabase.functions.invoke('send-stock-notifications', {
        body: { stock_id: stockId, farmer_id: farmerId || null },
      })
      if (!error) return
      if (attempt < 3) {
        await new Promise((resolve) => window.setTimeout(resolve, 500 * attempt))
      }
    }
  }, [])

  const handleSaveStock = async (payload) => {
    if (!isAdmin) {
      setDbMessage(t('onlyAdminEdit'))
      return
    }

    if (supabase && user) {
      setDbMessage('')
      const normalizedCustomerName = normalizePersonName(payload.customerName)
      const currentAvailable = getLatestAvailableStock(normalizedCustomerName, payload.customerPhone)
      const nextAvailable = currentAvailable + Number(payload.afterDryWeight)

      if (editId) {
        const updatePayload = {
          customer_name: normalizedCustomerName,
          customer_phone: payload.customerPhone,
          stock_date: payload.stockDate,
          before_dry_weight: payload.beforeDryWeight,
          after_dry_weight: payload.afterDryWeight,
          drying_ratio: payload.dryingRatio,
          available_stock: nextAvailable,
        }
        if (hasStockReasonColumn) {
          updatePayload.stock_reason = payload.stockReason ?? ''
        }

        const { error } = await supabase
          .from('stocks')
          .update(updatePayload)
          .eq('id', editId)

        if (error) {
          setDbMessage(`Update failed: ${error.message}`)
          return
        }

        setEditId(null)
        await loadStocks()
        return
      }

      const insertPayload = {
        user_id: user.id,
        owner_id: payload.farmerId || user.id,
        admin_id: isSuperAdmin ? null : user.id,
        created_by: user.id,
        customer_name: normalizedCustomerName,
        customer_phone: payload.customerPhone,
        stock_date: payload.stockDate,
        before_dry_weight: payload.beforeDryWeight,
        after_dry_weight: payload.afterDryWeight,
        drying_ratio: payload.dryingRatio,
        available_stock: nextAvailable,
      }
      if (hasStockReasonColumn) {
        insertPayload.stock_reason = payload.stockReason ?? ''
      }

      const { data: insertedStock, error } = await supabase
        .from('stocks')
        .insert(insertPayload)
        .select('id')
        .single()

      if (error) {
        if (error.message.toLowerCase().includes('customer_phone')) {
          setDbMessage(`${t('insertFailed')}: ${t('customerPhoneColumnMissing')}`)
        } else {
          setDbMessage(`Insert failed: ${error.message}`)
        }
        return
      }

      if (insertedStock?.id) {
        if (payload.farmerId) {
          await supabase
            .from('profiles')
            .update({
              whatsapp_consent: Boolean(payload.whatsappConsent),
              sms_consent: Boolean(payload.smsConsent),
            })
            .eq('id', payload.farmerId)
        }
        void invokeStockNotifications(insertedStock.id, payload.farmerId)
      }

      const phoneToTrack = normalizePhone(payload.customerPhone)
      if (phoneToTrack) {
        try {
          const k1 = `admin_stocks_${user?.id ?? 'super_admin'}`
          const k2 = `admin_stocks_${normalizePhone(user?.user_metadata?.phone ?? userScope.phone)}`
          for (const key of [k1, k2]) {
            const list = JSON.parse(localStorage.getItem(key) || '[]')
            if (!list.includes(phoneToTrack)) {
              list.push(phoneToTrack)
              localStorage.setItem(key, JSON.stringify(list))
            }
          }
        } catch {
          // localStorage error ignored
        }
      }

      await loadStocks()
      return
    }

    if (editId) {
      setStocks((previous) =>
        previous.map((item) =>
          item.id === editId
            ? {
                ...item,
                ...payload,
                availableStock: payload.afterDryWeight,
              }
            : item,
        ),
      )
      setEditId(null)
      return
    }

    const newItem = {
      id: crypto.randomUUID(),
      ...payload,
      customerName: normalizePersonName(payload.customerName),
      customerPhone: normalizePhone(payload.customerPhone ?? ''),
      availableStock: payload.afterDryWeight,
      stockReason: payload.stockReason ?? '',
      userId: user?.id ?? 'admin_local',
    }

    setStocks((previous) => [newItem, ...previous])
  }

  const getLatestAvailableStock = (customerName, customerPhone) => {
    const normalizedName = normalizePersonName(customerName).toLowerCase()
    const normalizedPhone = normalizePhone(customerPhone)

    const matched = stocks.filter(
      (item) =>
        item.customerName.trim().toLowerCase() === normalizedName &&
        normalizePhone(item.customerPhone ?? '') === normalizedPhone,
    )

    return matched.reduce((sum, item) => sum + getSignedMovementQuantity(item), 0)
  }

  const handleStockMovement = async (payload) => {
    if (!isAdmin) {
      setDbMessage(t('adminOnlyStockNote'))
      return
    }

    const afterDryWeight = Number(payload.afterDryWeight)
    const signedQuantity = payload.movementType === 'out' ? -afterDryWeight : afterDryWeight
    const normalizedCustomerName = normalizePersonName(payload.customerName)
    const previousAvailable = getLatestAvailableStock(normalizedCustomerName, payload.customerPhone)
    const nextAvailable = previousAvailable + signedQuantity

    if (nextAvailable < 0) {
      setDbMessage(t('stockOutTooLarge'))
      return
    }

    const movementRecord = {
      customerName: normalizedCustomerName,
      customerPhone: payload.customerPhone,
      stockDate: payload.stockDate,
      beforeDryWeight: afterDryWeight,
      afterDryWeight,
      dryingRatio: payload.movementType === 'in' ? 1 : 0,
      availableStock: nextAvailable,
      stockReason: payload.movementType === 'out' ? payload.reason : '',
    }

    if (supabase && user) {
      setDbMessage('')

      const movementInsertPayload = {
        user_id: user.id,
        owner_id: payload.farmerId || user.id,
        admin_id: isSuperAdmin ? null : user.id,
        created_by: user.id,
        customer_name: movementRecord.customerName,
        customer_phone: movementRecord.customerPhone,
        stock_date: movementRecord.stockDate,
        before_dry_weight: movementRecord.beforeDryWeight,
        after_dry_weight: movementRecord.afterDryWeight,
        drying_ratio: movementRecord.dryingRatio,
        available_stock: movementRecord.availableStock,
      }
      if (hasStockReasonColumn) {
        movementInsertPayload.stock_reason = movementRecord.stockReason
      }

      const { data: insertedMovement, error } = await supabase
        .from('stocks')
        .insert(movementInsertPayload)
        .select('id')
        .single()

      if (error) {
        setDbMessage(`Stock movement failed: ${error.message}`)
        return
      }

      if (payload.movementType === 'in' && insertedMovement?.id) {
        if (payload.farmerId) {
          await supabase
            .from('profiles')
            .update({
              whatsapp_consent: Boolean(payload.whatsappConsent),
              sms_consent: Boolean(payload.smsConsent),
            })
            .eq('id', payload.farmerId)
        }
        void invokeStockNotifications(insertedMovement.id, payload.farmerId)
      }

      await loadStocks()
      return
    }

    const phoneToTrack = normalizePhone(payload.customerPhone)
    if (phoneToTrack) {
      try {
        const k1 = `admin_stocks_${user?.id ?? 'super_admin'}`
        const k2 = `admin_stocks_${normalizePhone(user?.user_metadata?.phone ?? userScope.phone)}`
        for (const key of [k1, k2]) {
          const list = JSON.parse(localStorage.getItem(key) || '[]')
          if (!list.includes(phoneToTrack)) {
            list.push(phoneToTrack)
            localStorage.setItem(key, JSON.stringify(list))
          }
        }
      } catch {
        // localStorage error ignored
      }
    }

    setStocks((previous) => [
      {
        id: crypto.randomUUID(),
        ...movementRecord,
        userId: user?.id ?? 'admin_local',
      },
      ...previous,
    ])
  }

  const handleEditStock = (id) => {
    if (!isAdmin) {
      setDbMessage(t('onlyAdminEdit'))
      return
    }

    setActiveDashboardView('add-stock')
    setEditId(id)
  }

  const handleDeleteStock = async (id) => {
    if (!isAdmin) {
      setDbMessage(t('onlyAdminDelete'))
      return
    }

    if (supabase && user) {
      setDbMessage('')

      const { error } = await supabase.from('stocks').delete().eq('id', id)

      if (error) {
        setDbMessage(`Delete failed: ${error.message}`)
        return
      }

      if (id === editId) {
        setEditId(null)
      }
      await loadStocks()
      return
    }

    setStocks((previous) => previous.filter((item) => item.id !== id))
    if (id === editId) {
      setEditId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditId(null)
  }

  const getDayBefore = (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00`)
    date.setDate(date.getDate() - 1)
    return date.toISOString().slice(0, 10)
  }

  const todayIso = new Date().toISOString().slice(0, 10)

  const reportScope = useMemo(
    () => (isAdmin ? reportPerson : userScope),
    [isAdmin, reportPerson, userScope],
  )

  const reportScopePhone = normalizePhone(reportScope.phone)
  const reportScopeName = normalizePersonName(reportScope.name).toLowerCase()
  const hasReportScope = Boolean(reportScopePhone)

  const scopedRoundsForReports = useMemo(() => {
    if (isAdmin) {
      return rounds
    }

    return rounds.filter((round) => {
      if (!hasReportScope) {
        return false
      }
      const roundPhone = normalizePhone(round.customerPhone ?? '')
      const roundName = String(round.customerName ?? '').trim().toLowerCase()
      if (roundPhone !== reportScopePhone) {
        return false
      }
      if (!reportScopeName) {
        return true
      }
      return roundName.includes(reportScopeName)
    })
  }, [rounds, isAdmin, hasReportScope, reportScopePhone, reportScopeName])

  const openRound = useMemo(
    () => [...scopedRoundsForReports].find((round) => round.status === 'open') ?? null,
    [scopedRoundsForReports],
  )

  const selectedPersonRoundCount = useMemo(() => {
    if (!hasReportScope) {
      return 0
    }

    return rounds.filter((round) => {
      const roundPhone = normalizePhone(round.customerPhone ?? '')
      const roundName = String(round.customerName ?? '').trim().toLowerCase()
      if (roundPhone !== reportScopePhone) {
        return false
      }
      if (!reportScopeName) {
        return true
      }
      return roundName.includes(reportScopeName)
    }).length
  }, [rounds, hasReportScope, reportScopePhone, reportScopeName])

  const nextRoundNumber = selectedPersonRoundCount + 1

  useEffect(() => {
    if (roundEditId) {
      return
    }

    if (!isAdmin) {
      return
    }

    setRoundForm((previous) => {
      const nextValue = String(nextRoundNumber)
      if (previous.roundNumber === nextValue) {
        return previous
      }
      return {
        ...previous,
        roundNumber: nextValue,
      }
    })
  }, [nextRoundNumber, isAdmin, roundEditId])

  const editingRound = useMemo(
    () => scopedRoundsForReports.find((round) => round.id === roundEditId) ?? null,
    [scopedRoundsForReports, roundEditId],
  )

  const roundSummaries = useMemo(() => {
    const sorted = [...scopedRoundsForReports].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )

    const personRoundCounter = new Map()

    return sorted.map((round, index) => {
      const nextRound = sorted[index + 1]
      const computedEndDate = round.endDate
        ? round.endDate
        : nextRound?.startDate
          ? getDayBefore(nextRound.startDate)
          : todayIso

      const roundPhone = normalizePhone(round.customerPhone ?? '')
      const roundName = String(round.customerName ?? '').trim().toLowerCase()
      const roundStocks = scopedAndSortedStocks.filter((item) => {
        const itemPhone = normalizePhone(item.customerPhone ?? '')
        const itemName = String(item.customerName ?? '').trim().toLowerCase()

        return (
          item.stockDate >= round.startDate &&
          item.stockDate <= computedEndDate &&
          itemPhone === roundPhone &&
          itemName === roundName
        )
      })

      const totalBeforeDry = roundStocks.reduce((sum, item) => sum + Number(item.beforeDryWeight ?? 0), 0)
      const totalAfterDry = roundStocks.reduce((sum, item) => sum + Number(item.afterDryWeight ?? 0), 0)
      const averageRatio =
        roundStocks.length === 0
          ? 0
          : roundStocks.reduce((sum, item) => sum + Number(item.dryingRatio ?? 0), 0) / roundStocks.length

      const personKey = `${roundName}::${roundPhone}`
      const currentRoundNumber = (personRoundCounter.get(personKey) ?? 0) + 1
      personRoundCounter.set(personKey, currentRoundNumber)

      return {
        id: round.id,
        customerName: round.customerName,
        customerPhone: round.customerPhone,
        roundNumber: round.roundNumber ?? currentRoundNumber,
        startDate: round.startDate,
        endDate: computedEndDate,
        status: round.status,
        totalBeforeDry,
        totalAfterDry,
        averageRatio,
        totalEntries: roundStocks.length,
      }
    })
  }, [scopedRoundsForReports, scopedAndSortedStocks, todayIso])

  const monthlyRoundSummary = useMemo(() => {
    const grouped = new Map()

    for (const item of roundSummaries) {
      const key = item.startDate.slice(0, 7)
      const existing = grouped.get(key) ?? {
        period: key,
        totalBeforeDry: 0,
        totalAfterDry: 0,
        ratioSum: 0,
        ratioCount: 0,
        totalEntries: 0,
      }

      existing.totalBeforeDry += item.totalBeforeDry
      existing.totalAfterDry += item.totalAfterDry
      existing.ratioSum += item.averageRatio
      existing.ratioCount += 1
      existing.totalEntries += item.totalEntries
      grouped.set(key, existing)
    }

    return Array.from(grouped.values())
      .map((item) => ({
        period: item.period,
        totalBeforeDry: item.totalBeforeDry,
        totalAfterDry: item.totalAfterDry,
        averageRatio: item.ratioCount === 0 ? 0 : item.ratioSum / item.ratioCount,
        totalEntries: item.totalEntries,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [roundSummaries])

  const yearlyRoundSummary = useMemo(() => {
    const grouped = new Map()

    for (const item of roundSummaries) {
      const key = item.startDate.slice(0, 4)
      const existing = grouped.get(key) ?? {
        period: key,
        totalBeforeDry: 0,
        totalAfterDry: 0,
        ratioSum: 0,
        ratioCount: 0,
        totalEntries: 0,
      }

      existing.totalBeforeDry += item.totalBeforeDry
      existing.totalAfterDry += item.totalAfterDry
      existing.ratioSum += item.averageRatio
      existing.ratioCount += 1
      existing.totalEntries += item.totalEntries
      grouped.set(key, existing)
    }

    return Array.from(grouped.values())
      .map((item) => ({
        period: item.period,
        totalBeforeDry: item.totalBeforeDry,
        totalAfterDry: item.totalAfterDry,
        averageRatio: item.ratioCount === 0 ? 0 : item.ratioSum / item.ratioCount,
        totalEntries: item.totalEntries,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [roundSummaries])

  const activeRoundUsers = useMemo(() => {
    const names = new Map()

    for (const round of rounds) {
      if (round.status !== 'open') {
        continue
      }

      const key = normalizePhone(round.customerPhone ?? '') || String(round.customerName ?? '').trim().toLowerCase()
      if (!key) {
        continue
      }

      names.set(key, round.customerName || round.customerPhone || '-')
    }

    return Array.from(names.values()).sort((a, b) => a.localeCompare(b))
  }, [rounds])

  const liveRoundSummary = useMemo(() => {
    if (roundSummaries.length === 0) {
      return null
    }

    if (openRound) {
      return roundSummaries.find((item) => item.id === openRound.id) ?? roundSummaries[roundSummaries.length - 1]
    }

    return roundSummaries[roundSummaries.length - 1]
  }, [roundSummaries, openRound])

  const handleStartRound = async () => {
    if (!isAdmin) {
      setRoundMessage(t('onlyAdminReports'))
      return
    }

    if (!roundForm.startDate) {
      setRoundMessage(`${t('startDateAdmin')} is required.`)
      return
    }

    const roundNumber = Number(roundForm.roundNumber)
    if (!Number.isInteger(roundNumber) || roundNumber <= 0) {
      setRoundMessage(`${t('roundLabel')} is required.`)
      return
    }

    if (!hasReportScope) {
      setRoundMessage(t('reportPersonRequired'))
      return
    }

    if (openRound) {
      setRoundMessage(t('openRoundExists'))
      return
    }

    if (!supabase || !user) {
      setRoundMessage(t('supabaseNotConfigured'))
      return
    }

    setRoundLoading(true)
    setRoundMessage('')

    const insertPayload = {
      customer_name: normalizePersonName(reportScope.name),
      customer_phone: reportScopePhone,
      start_date: roundForm.startDate,
      status: 'open',
      created_by: user.id,
      owner_id: user.id,
      admin_id: isSuperAdmin ? null : user.id,
    }
    if (hasRoundNumberColumn) {
      insertPayload.round_no = roundNumber
    }

    const { error } = await supabase.from('stock_rounds').insert(insertPayload)

    if (error) {
      if (error.message.toLowerCase().includes('stock_rounds')) {
        setRoundMessage(t('roundSetupMissing'))
      } else {
        setRoundMessage(error.message)
      }
      setRoundLoading(false)
      return
    }

    setRoundMessage(t('roundSaved'))
    setRoundForm({ startDate: '', finishDate: '', roundNumber: String(nextRoundNumber + 1) })
    await loadRounds()
    setRoundLoading(false)
  }

  const handleFinishOpenRound = async () => {
    if (!isAdmin) {
      setRoundMessage(t('onlyAdminReports'))
      return
    }

    if (!openRound) {
      setRoundMessage(t('noOpenRoundToFinish'))
      return
    }

    if (!hasReportScope) {
      setRoundMessage(t('reportPersonRequired'))
      return
    }

    if (!roundForm.finishDate) {
      setRoundMessage(`${t('finishDateAdmin')} is required.`)
      return
    }

    if (roundForm.finishDate < openRound.startDate) {
      setRoundMessage(t('finishDateMustBeAfterStart'))
      return
    }

    if (!supabase || !user) {
      setRoundMessage(t('supabaseNotConfigured'))
      return
    }

    setRoundLoading(true)
    setRoundMessage('')

    const { error } = await supabase
      .from('stock_rounds')
      .update({
        end_date: roundForm.finishDate,
        status: 'finished',
      })
      .eq('id', openRound.id)

    if (error) {
      if (error.message.toLowerCase().includes('stock_rounds')) {
        setRoundMessage(t('roundSetupMissing'))
      } else {
        setRoundMessage(error.message)
      }
      setRoundLoading(false)
      return
    }

    setRoundMessage(t('roundFinishedSuccess'))
    setRoundForm((previous) => ({ ...previous, finishDate: '' }))
    await loadRounds()
    setRoundLoading(false)
  }

  const handleEditRound = (round) => {
    setRoundEditId(round.id)
    setRoundForm({
      startDate: round.startDate ?? '',
      finishDate: round.endDate ?? '',
      roundNumber: String(round.roundNumber ?? ''),
    })
    setRoundMessage('')
  }

  const handleCancelRoundEdit = () => {
    setRoundEditId(null)
    setRoundForm({ startDate: '', finishDate: '', roundNumber: String(nextRoundNumber) })
    setRoundMessage('')
  }

  const handleSaveRoundDates = async () => {
    if (!isAdmin) {
      setRoundMessage(t('onlyAdminReports'))
      return
    }

    if (!editingRound) {
      return
    }

    if (!roundForm.startDate) {
      setRoundMessage(`${t('startDateAdmin')} is required.`)
      return
    }

    const roundNumber = Number(roundForm.roundNumber)
    if (!Number.isInteger(roundNumber) || roundNumber <= 0) {
      setRoundMessage(`${t('roundLabel')} is required.`)
      return
    }

    if (roundForm.finishDate && roundForm.finishDate < roundForm.startDate) {
      setRoundMessage(t('finishDateMustBeAfterStart'))
      return
    }

    if (editingRound.status === 'finished' && !roundForm.finishDate) {
      setRoundMessage(`${t('finishDateAdmin')} is required.`)
      return
    }

    if (!supabase || !user) {
      setRoundMessage(t('supabaseNotConfigured'))
      return
    }

    setRoundLoading(true)
    setRoundMessage('')

    const updatePayload = {
      start_date: roundForm.startDate,
      end_date: roundForm.finishDate || null,
    }
    if (hasRoundNumberColumn) {
      updatePayload.round_no = roundNumber
    }

    const { error } = await supabase
      .from('stock_rounds')
      .update(updatePayload)
      .eq('id', editingRound.id)

    if (error) {
      if (error.message.toLowerCase().includes('stock_rounds')) {
        setRoundMessage(t('roundSetupMissing'))
      } else {
        setRoundMessage(error.message)
      }
      setRoundLoading(false)
      return
    }

    setRoundMessage(t('reportDatesUpdated'))
    setRoundEditId(null)
    setRoundForm({ startDate: '', finishDate: '', roundNumber: String(nextRoundNumber) })
    await loadRounds()
    setRoundLoading(false)
  }

  const handleDeleteRound = async (round) => {
    if (!isAdmin) {
      setRoundMessage(t('onlyAdminReports'))
      return
    }

    if (!round?.id) {
      return
    }

    if (!supabase || !user) {
      setRoundMessage(t('supabaseNotConfigured'))
      return
    }

    const isConfirmed = window.confirm(`${t('delete')} ${t('roundLabel')} ${round.roundNumber}?`)
    if (!isConfirmed) {
      return
    }

    setRoundLoading(true)
    setRoundMessage('')

    const { error } = await supabase
      .from('stock_rounds')
      .delete()
      .eq('id', round.id)

    if (error) {
      if (error.message.toLowerCase().includes('stock_rounds')) {
        setRoundMessage(t('roundSetupMissing'))
      } else {
        setRoundMessage(error.message)
      }
      setRoundLoading(false)
      return
    }

    if (roundEditId === round.id) {
      setRoundEditId(null)
      setRoundForm({ startDate: '', finishDate: '', roundNumber: String(nextRoundNumber) })
    }

    setRoundMessage(t('reportsDeleted'))
    await loadRounds()
    setRoundLoading(false)
  }

  const handleDeleteAllReports = async () => {
    if (!isAdmin) {
      setRoundMessage(t('onlyAdminReports'))
      return
    }

    const ids = scopedRoundsForReports.map((round) => round.id).filter(Boolean)
    if (ids.length === 0) {
      return
    }

    if (!supabase || !user) {
      setRoundMessage(t('supabaseNotConfigured'))
      return
    }

    const isConfirmed = window.confirm(`${t('deleteAllReports')}?`)
    if (!isConfirmed) {
      return
    }

    setRoundLoading(true)
    setRoundMessage('')

    const { error } = await supabase
      .from('stock_rounds')
      .delete()
      .in('id', ids)

    if (error) {
      if (error.message.toLowerCase().includes('stock_rounds')) {
        setRoundMessage(t('roundSetupMissing'))
      } else {
        setRoundMessage(error.message)
      }
      setRoundLoading(false)
      return
    }

    setRoundEditId(null)
    setRoundForm({ startDate: '', finishDate: '', roundNumber: String(nextRoundNumber) })
    setRoundMessage(t('reportsDeleted'))
    await loadRounds()
    setRoundLoading(false)
  }

  const languageTabs = (
    <div className="top-right-toolbar">
      <div className="language-tabs" role="tablist" aria-label="Language selector">
        <button
          type="button"
          className={`lang-tab ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          English
        </button>
        <button
          type="button"
          className={`lang-tab ${language === 'ta' ? 'active' : ''}`}
          onClick={() => setLanguage('ta')}
        >
          தமிழ்
        </button>
        <button
          type="button"
          className={`lang-tab ${language === 'ml' ? 'active' : ''}`}
          onClick={() => setLanguage('ml')}
        >
          മലയാളം
        </button>
      </div>
    </div>
  )

  if (isSupabaseConfigured && !user) {
    return (
      <main className="app-shell">
        {languageTabs}
        <section className="auth-hero">
          <h1>{t('appTitle')}</h1>
          {t('appSubtitle') ? <p>{t('appSubtitle')}</p> : null}
        </section>
        <section className="auth-grid">
          {loginMode === 'super_admin' ? (
            <section className="panel auth-panel auth-panel-admin">
              <h2>{t('superAdminLogin')}</h2>
              <p>{t('superAdminDetails')}</p>
              <form className="stock-form" onSubmit={handleSuperAdminSignIn}>
                <label>
                  {t('gmail')}
                  <input
                    type="email"
                    value={superAdminLogin.email}
                    onChange={(event) =>
                      setSuperAdminLogin((previous) => ({ ...previous, email: event.target.value }))
                    }
                    placeholder="owner@example.com"
                  />
                </label>
                <label>
                  {t('password')}
                  <input
                    type="password"
                    value={superAdminLogin.password}
                    onChange={(event) =>
                      setSuperAdminLogin((previous) => ({ ...previous, password: event.target.value }))
                    }
                    placeholder={t('password')}
                  />
                </label>
                <div className="actions auth-actions">
                  <button type="submit" disabled={authLoading}>
                    {authLoading ? t('pleaseWait') : t('superAdminSignIn')}
                  </button>
                </div>
              </form>
            </section>
          ) : loginMode === 'admin' ? (
            <section className="panel auth-panel auth-panel-admin">
              <h2>{t('adminLogin')}</h2>
              <p>{t('adminDetails')}</p>
              <form className="stock-form" onSubmit={handleAdminSignIn}>
                <label>
                  {t('name')}
                  <input
                    type="text"
                    value={adminLogin.name}
                    onChange={(event) => setAdminLogin((previous) => ({ ...previous, name: event.target.value }))}
                    placeholder={t('name')}
                  />
                </label>
                <label>
                  {t('phoneNumber')}
                  <input
                    type="text"
                    value={adminLogin.phone}
                    onChange={(event) =>
                      setAdminLogin((previous) => ({ ...previous, phone: normalizePhone(event.target.value) }))
                    }
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </label>
                <label>
                  {t('password')}
                  <input
                    type="password"
                    value={adminLogin.password}
                    onChange={(event) =>
                      setAdminLogin((previous) => ({ ...previous, password: event.target.value }))
                    }
                    placeholder={t('password')}
                  />
                </label>
                <div className="actions auth-actions">
                  <button type="submit" disabled={authLoading}>
                    {authLoading ? t('pleaseWait') : t('adminSignIn')}
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section className="panel auth-panel auth-panel-user">
              <h2>{t('userLogin')}</h2>
              <p>{t('userDetails')}</p>
              <form className="stock-form" onSubmit={handleUserSignIn}>
                <label>
                  {t('name')}
                  <input
                    type="text"
                    value={userLogin.name}
                    onChange={(event) => setUserLogin((previous) => ({ ...previous, name: event.target.value }))}
                    placeholder={t('name')}
                  />
                </label>
                <label>
                  {t('phoneNumber')}
                  <input
                    type="text"
                    value={userLogin.phone}
                    onChange={(event) =>
                      setUserLogin((previous) => ({ ...previous, phone: normalizePhone(event.target.value) }))
                    }
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </label>
                <label>
                  {t('password')}
                  <input
                    type="password"
                    value={userLogin.password}
                    onChange={(event) =>
                      setUserLogin((previous) => ({ ...previous, password: event.target.value }))
                    }
                    placeholder={t('password')}
                  />
                </label>
                <div className="actions auth-actions">
                  <button type="submit" className="secondary" disabled={authLoading}>
                    {authLoading ? t('pleaseWait') : t('userSignIn')}
                  </button>
                </div>
              </form>
            </section>
          )}
        </section>
        <div className="login-mode-toggle" role="tablist" aria-label={t('loginModeSelector')}>
          <button
            type="button"
            className={`mode-button ${loginMode === 'super_admin' ? 'active' : ''}`}
            onClick={() => handleSwitchLoginMode('super_admin')}
          >
            {t('superAdminLogin')}
          </button>
          <button
            type="button"
            className={`mode-button ${loginMode === 'admin' ? 'active' : ''}`}
            onClick={() => handleSwitchLoginMode('admin')}
          >
            {t('adminLogin')}
          </button>
          <button
            type="button"
            className={`mode-button ${loginMode === 'user' ? 'active' : ''}`}
            onClick={() => handleSwitchLoginMode('user')}
          >
            {t('userLogin')}
          </button>
        </div>
        {authMessage ? <p className="auth-message auth-global-message panel">{authMessage}</p> : null}
      </main>
    )
  }

  return (
    <main className="app-shell">
      {languageTabs}
      <header>
        <h1>{t('dashboardTitle')}</h1>
        <p>{t('dashboardSubtitle')}</p>
        <div className="header-actions">
          {isSupabaseConfigured && user ? (
            <>
              <div className="header-meta">
                <small className="user-chip">{user.email}</small>
                <small className={`user-chip ${isSuperAdmin ? 'super-admin-chip' : isAdmin ? 'admin-chip' : ''}`}>
                  {t('role')}: {isSuperAdmin ? t('superAdminRole') : isAdmin ? t('adminRole') : t('userRole')}
                </small>
              </div>
              <button type="button" className="secondary logout-button" onClick={handleLogout}>
                {t('logout')}
              </button>
            </>
          ) : (
            <small className="user-chip">{t('authDisabled')}</small>
          )}
        </div>
        {dbLoading ? <p className="auth-message">{t('loadingStocks')}</p> : null}
        {dbMessage ? <p className="auth-message">{dbMessage}</p> : null}
      </header>

      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <button
          type="button"
          className={`dashboard-nav-button ${activeDashboardView === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveDashboardView('summary')}
        >
          {t('summary')}
        </button>
        {isAdmin ? (
          <button
            type="button"
            className={`dashboard-nav-button ${activeDashboardView === 'add-stock' ? 'active' : ''}`}
            onClick={() => setActiveDashboardView('add-stock')}
          >
            {t('addStock')}
          </button>
        ) : null}
        {isAdmin ? (
          <button
            type="button"
            className={`dashboard-nav-button ${activeDashboardView === 'create-user' ? 'active' : ''}`}
            onClick={() => setActiveDashboardView('create-user')}
          >
            {t('createUser')}
          </button>
        ) : null}
        {isAdmin ? (
          <button
            type="button"
            className={`dashboard-nav-button ${activeDashboardView === 'stock-ops' ? 'active' : ''}`}
            onClick={() => setActiveDashboardView('stock-ops')}
          >
            {t('stockMovement')}
          </button>
        ) : null}
        <button
          type="button"
          className={`dashboard-nav-button ${activeDashboardView === 'filters' ? 'active' : ''}`}
          onClick={() => setActiveDashboardView('filters')}
        >
          {t('filters')}
        </button>
        <button
          type="button"
          className={`dashboard-nav-button ${activeDashboardView === 'stock-list' ? 'active' : ''}`}
          onClick={() => setActiveDashboardView('stock-list')}
        >
          {t('stockList')}
        </button>
        <button
          type="button"
          className={`dashboard-nav-button ${activeDashboardView === 'current-balance' ? 'active' : ''}`}
          onClick={() => setActiveDashboardView('current-balance')}
        >
          {t('currentBalance')}
        </button>
        <button
          type="button"
          className={`dashboard-nav-button ${activeDashboardView === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveDashboardView('reports')}
        >
          {t('reports')}
        </button>
        {isAdmin ? (
          <button
            type="button"
            className={`dashboard-nav-button ${activeDashboardView === 'pdf-reports' ? 'active' : ''}`}
            onClick={() => setActiveDashboardView('pdf-reports')}
          >
            Download PDF
          </button>
        ) : null}
      </nav>

      {activeDashboardView === 'summary' ? (
      <>
        {isSuperAdmin ? (
          <section className="summary-grid super-admin-summary">
            <article className="summary-card highlight-card">
              <h3>{t('totalAdmins')}</h3>
              <strong>{managedAccounts.filter((account) => account.role === 'ADMIN').length}</strong>
            </article>
            <article className="summary-card highlight-card">
              <h3>{t('totalUsers')}</h3>
              <strong>{managedAccounts.filter((account) => account.role === 'USER').length}</strong>
            </article>
            <article className="summary-card">
              <h3>{t('totalFarms')}</h3>
              <strong>{new Set(stocks.map(i => i.customerName.trim().toLowerCase())).size}</strong>
            </article>
            <article className="summary-card">
              <h3>{t('totalStock')}</h3>
              <strong>{summary.totalAvailableStock.toFixed(2)} kg</strong>
            </article>
            <article className="summary-card">
              <h3>{t('totalStockHistory')}</h3>
              <strong>{summary.totalEntries}</strong>
            </article>
            <article className="summary-card">
              <h3>{t('totalSales')}</h3>
              <strong>{summary.totalStockOut.toFixed(2)} kg</strong>
            </article>
            <article className="summary-card">
              <h3>{t('totalLabour')}</h3>
              <strong>{rounds.length}</strong>
            </article>
            <article className="summary-card">
              <h3>{t('totalExpenses')}</h3>
              <strong>₹{Math.round(summary.totalStockOut * 120)}</strong>
            </article>
          </section>
        ) : (
          <section className="summary-grid">
            <article className="summary-card">
              <h3>{t('totalEntries')}</h3>
              <strong>{summary.totalEntries}</strong>
            </article>
            <article className="summary-card">
              <h3>{t('totalBeforeDry')}</h3>
              <strong>{summary.totalBeforeDry.toFixed(2)} kg</strong>
            </article>
            <article className="summary-card">
              <h3>{t('totalAfterDry')}</h3>
              <strong>{summary.totalAfterDry.toFixed(2)} kg</strong>
            </article>
            <article className="summary-card">
              <h3>{t('totalStockOut')}</h3>
              <strong>{summary.totalStockOut.toFixed(2)} kg</strong>
            </article>
            <article className="summary-card">
              <h3>{t('avgDryedRatio')}</h3>
              <strong>{formatRatio(summary.averageRatio)}</strong>
            </article>
            <article className="summary-card">
              <h3>{t('availableStock')}</h3>
              <strong>{summary.totalAvailableStock.toFixed(2)} kg</strong>
            </article>
          </section>
        )}

        <section className="panel">
          {isAdmin ? (
            <>
              <h2>{t('activeUsers')}</h2>
              {activeRoundUsers.length === 0 ? (
                <p className="empty-state">{t('noActiveUsers')}</p>
              ) : (
                <div className="header-meta">
                  {activeRoundUsers.map((name) => (
                    <small key={`active-user-${name}`} className="user-chip">{normalizePersonName(name)}</small>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2>{t('liveRoundStatus')}</h2>
              {!hasReportScope ? <p className="auth-message">{t('reportPersonRequired')}</p> : null}
              {hasReportScope && !liveRoundSummary ? <p className="empty-state">{t('noLiveReport')}</p> : null}
              {hasReportScope && liveRoundSummary ? (
                <div className="summary-grid">
                  <article className="summary-card">
                    <h3>{t('liveRoundStatus')}</h3>
                    <strong>{liveRoundSummary.status === 'finished' ? t('roundFinished') : t('roundActive')}</strong>
                  </article>
                </div>
              ) : null}
            </>
          )}
        </section>
      </>
      ) : null}

      <div className="content-grid">
        {isAdmin && activeDashboardView === 'add-stock' ? (
          <section>
            <AddStock
              onSave={handleSaveStock}
              editItem={editItem}
              onCancelEdit={handleCancelEdit}
              canManage={isAdmin}
              farmerOptions={farmerOptions}
              t={t}
            />
          </section>
        ) : null}

        {isAdmin && activeDashboardView === 'stock-ops' ? (
          <section>
            <div className="stock-ops-switch" role="tablist" aria-label="Stock operations switch">
              <button
                type="button"
                className={`stock-ops-button ${stockOpsView === 'movement' ? 'active' : ''}`}
                onClick={() => setStockOpsView('movement')}
              >
                {t('stockMovement')}
              </button>
              <button
                type="button"
                className={`stock-ops-button ${stockOpsView === 'balance' ? 'active' : ''}`}
                onClick={() => setStockOpsView('balance')}
              >
                {t('currentAvailableByCustomer')}
              </button>
            </div>

            {stockOpsView === 'movement' ? (
              <section className="panel">
                <h2>{t('stockMovement')}</h2>
                <StockMovement
                  canManage={isAdmin}
                  onSubmit={handleStockMovement}
                  farmerOptions={farmerOptions}
                  t={t}
                />
              </section>
            ) : null}

            {stockOpsView === 'balance' ? (
              <section className="panel">
                <h2>{t('currentAvailableByCustomer')}</h2>
                {customerAvailableSummary.length === 0 ? (
                  <p className="empty-state">{t('noCustomerBalance')}</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{t('name')}</th>
                          <th>{t('phoneNumber')}</th>
                          <th>{t('availableStockColumn')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerAvailableSummary.map((item) => (
                          <tr key={`${item.customerName}-${item.customerPhone}`}>
                            <td>{item.customerName}</td>
                            <td>{item.customerPhone || '-'}</td>
                            <td>{item.availableStock.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ) : null}
          </section>
        ) : null}

        {isAdmin && activeDashboardView === 'pdf-reports' ? (
          <ReportsPage
            stocks={scopedAndSortedStocks}
            isSuperAdmin={isSuperAdmin}
            roleLabel={isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN'}
            generatedBy={profile?.name || user.email || 'Admin'}
            currentUserId={user.id}
          />
        ) : null}

        {isAdmin && activeDashboardView === 'create-user' ? (
          <section className="panel">
            <h2>{t('adminCreateUser')}</h2>
            <p>{t('createUserNote')}</p>
            <form className="stock-form" onSubmit={handleAdminCreateUser}>
              <label>
                {t('name')}
                <input
                  type="text"
                  value={createUserForm.name}
                  onChange={(event) =>
                    setCreateUserForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                  placeholder={t('name')}
                />
              </label>
              <label>
                {t('phoneNumber')}
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={createUserForm.phone}
                  onChange={(event) =>
                    setCreateUserForm((previous) => ({
                      ...previous,
                      phone: normalizePhone(event.target.value),
                    }))
                  }
                  placeholder="9961153291"
                />
              </label>
              <label>
                {t('selectRole')}
                <select
                  value={createUserForm.role || 'user'}
                  onChange={(event) =>
                    setCreateUserForm((previous) => ({ ...previous, role: event.target.value }))
                  }
                >
                  <option value="user">{t('standardUser')}</option>
                  {isMainAdmin ? <option value="admin">{t('adminUser')}</option> : null}
                </select>
              </label>
              {!isMainAdmin ? (
                <p className="permission-note" style={{ color: '#d97706', marginBottom: '0.8rem' }}>
                  {t('mainAdminOnlyCreateAdmin')}
                </p>
              ) : null}
              <label>
                {t('password')}
                <input
                  type="password"
                  value={createUserForm.password}
                  onChange={(event) =>
                    setCreateUserForm((previous) => ({ ...previous, password: event.target.value }))
                  }
                  placeholder={t('password')}
                />
              </label>
              <div className="actions">
                <button type="submit" disabled={createUserLoading}>
                  {createUserLoading
                    ? t('creating')
                    : String(createUserForm.role || 'USER').toUpperCase() === 'ADMIN'
                      ? t('createAdmin') || 'Create Admin'
                      : t('createUser')}
                </button>
              </div>
              {createUserMessage ? <p className="auth-message">{createUserMessage}</p> : null}
            </form>
            <p className="permission-note">
              {t('loginEmailForUser')} <code>{'{phone_number}'}@user.local</code>
            </p>

            <h2>{isSuperAdmin ? t('deleteUserOrAdmin') : t('deleteUser')}</h2>
            <p>
              {isSuperAdmin
                ? t('deleteSuperAdminAccountsNote')
                : t('deleteAssignedAccountsNote')}
            </p>
            <form className="stock-form" onSubmit={handleAdminDeleteUser}>
              <label>
                {t('name')}
                <input
                  type="text"
                  value={deleteUserForm.name}
                  onChange={(event) =>
                    setDeleteUserForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                  placeholder={t('name')}
                />
              </label>
              <label>
                {t('phoneNumber')}
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={deleteUserForm.phone}
                  onChange={(event) =>
                    setDeleteUserForm((previous) => ({
                      ...previous,
                      phone: normalizePhone(event.target.value),
                    }))
                  }
                  placeholder="9961153291"
                />
              </label>
              <div className="actions">
                <button type="submit" className="danger" disabled={deleteUserLoading}>
                  {deleteUserLoading ? t('deleting') : t('deleteUser')}
                </button>
              </div>
              {createUserMessage ? <p className="auth-message">{createUserMessage}</p> : null}
            </form>

            <div style={{ marginTop: '2rem' }}>
              {(() => {
                const registeredAccounts = managedAccounts
                const adminAccounts = registeredAccounts.filter(
                  (account) => String(account.role ?? '').toUpperCase() === 'ADMIN',
                )
                const userAccounts = registeredAccounts.filter(
                  (account) => String(account.role ?? '').toUpperCase() !== 'ADMIN',
                )

                const renderDeleteTable = (title, accounts) => {
                  if (accounts.length === 0) {
                    return null
                  }

                  return (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3>{title}</h3>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>{t('name')}</th>
                              <th>{t('phoneNumber')}</th>
                              <th>{t('role')}</th>
                              <th>{t('status')}</th>
                              <th>{t('actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {accounts.map((account) => {
                              const accountRole = String(account.role ?? 'USER').toUpperCase()
                              return (
                                <tr key={`${accountRole}-${account.phone}`}>
                                  <td>{account.name}</td>
                                  <td>{account.phone}</td>
                                  <td>
                                    <span className={`user-chip ${accountRole === 'ADMIN' ? 'admin-chip' : ''}`}>
                                      {accountRole}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className={account.active === false ? 'secondary' : 'danger'}
                                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginRight: '0.4rem' }}
                                      onClick={() => handleSetAccountActive(account, account.active === false)}
                                    >
                                      {account.active === false ? t('activate') : t('deactivate')}
                                    </button>
                                    <button
                                      type="button"
                                      className="danger"
                                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                      disabled={deleteUserLoading || accountRole === 'SUPER_ADMIN'}
                                      onClick={() => {
                                        if (!window.confirm(`${t('deleteAccountConfirm')} ${accountRole} ${account.name} (${account.phone})`)) {
                                          return
                                        }
                                        setDeleteUserForm({ name: account.name, phone: account.phone })
                                        handleAdminDeleteUser(
                                          { preventDefault: () => {} },
                                          { id: account.id, name: account.name, phone: account.phone, role: account.role },
                                        )
                                      }}
                                    >
                                      {t('delete')}
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                }

                return (
                  <>
                    {isSuperAdmin ? renderDeleteTable(t('adminAccounts'), adminAccounts) : null}
                    {renderDeleteTable(t('userAccounts'), userAccounts)}
                  </>
                )
              })()}
            </div>
          </section>
        ) : null}

        {activeDashboardView === 'filters' ? (
        <section className="panel">
          <h2>{t('filters')}</h2>
          <p>
            {t('filteredResultsHere')} <strong>{filteredPreviewStocks.length}</strong>
          </p>
          <div className="filters-grid">
            <label>
              {t('searchName')}
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('searchByCustomer')}
              />
            </label>
            <label>
              {t('fromDate')}
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </label>
            <label>
              {t('toDate')}
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </label>
            <div className="actions">
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setSearchTerm('')
                  setFromDate('')
                  setToDate('')
                }}
              >
                {t('clearFilters')}
              </button>
            </div>
          </div>
          <StockList
            items={filteredPreviewStocks}
            onEdit={handleEditStock}
            onDelete={handleDeleteStock}
            sortConfig={sortConfig}
            onSortChange={toggleSort}
            canManage={false}
            t={t}
            formatCustomerName={normalizePersonName}
            showAvailableStock={false}
          />
        </section>
        ) : null}

        {activeDashboardView === 'stock-list' ? (
        <section>
          <StockList
            items={scopedAndSortedStocks}
            onEdit={handleEditStock}
            onDelete={handleDeleteStock}
            sortConfig={sortConfig}
            onSortChange={toggleSort}
            canManage={isAdmin}
            t={t}
            formatCustomerName={normalizePersonName}
            showAvailableStock={false}
          />
        </section>
        ) : null}

        {activeDashboardView === 'current-balance' ? (
        <section className="panel">
          <h2>{t('currentBalance')}</h2>
          <article className="available-highlight">
            <p>{t('currentAvailableNow')}</p>
            <strong>{summary.totalAvailableStock.toFixed(2)} kg</strong>
          </article>

          <h3 className="history-title">{t('stockHistory')}</h3>
          {stockHistory.length === 0 ? (
            <p className="empty-state">{t('noStockHistory')}</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('name')}</th>
                    <th>{t('phoneNumber')}</th>
                    <th>{t('date')}</th>
                    <th>{t('movementType')}</th>
                    <th>{t('afterDryWeight')}</th>
                    <th>{t('reason')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory.map((item) => (
                    <tr key={`${item.id}-history`} className={isStockOutRecord(item) ? 'stock-out-row' : 'stock-in-row'}>
                      <td>{item.customerName}</td>
                      <td>{item.customerPhone || '-'}</td>
                      <td>{new Date(item.stockDate).toLocaleDateString('en-GB')}</td>
                      <td>{isStockOutRecord(item) ? t('stockOut') : t('stockIn')}</td>
                      <td>{getSignedMovementQuantity(item).toFixed(2)}</td>
                      <td>{isStockOutRecord(item) ? item.stockReason || '-' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        ) : null}

        {activeDashboardView === 'reports' ? (
        <>
          {/* Round setup / info panel */}
          <section className="panel report-setup-panel">
            <h2>{t('roundReports')}</h2>

            {isAdmin ? (
              <>
                <div className="filters-grid">
                  <label>
                    {t('reportPersonName')}
                    <input
                      type="text"
                      value={reportPerson.name}
                      onChange={(event) =>
                        setReportPerson((previous) => ({ ...previous, name: event.target.value }))
                      }
                      placeholder={t('name')}
                    />
                  </label>
                  <label>
                    {t('reportPersonPhone')}
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={reportPerson.phone}
                      onChange={(event) =>
                        setReportPerson((previous) => ({
                          ...previous,
                          phone: normalizePhone(event.target.value),
                        }))
                      }
                      placeholder="9961153291"
                    />
                  </label>
                  <label>
                    {t('startDateAdmin')}
                    <input
                      type="date"
                      value={roundForm.startDate}
                      onChange={(event) =>
                        setRoundForm((previous) => ({ ...previous, startDate: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    {t('nextRound')}
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={roundForm.roundNumber}
                      onChange={(event) =>
                        setRoundForm((previous) => ({
                          ...previous,
                          roundNumber: event.target.value.replace(/\D/g, ''),
                        }))
                      }
                      placeholder={String(nextRoundNumber)}
                    />
                  </label>
                  <label>
                    {t('finishDateAdmin')}
                    <input
                      type="date"
                      value={roundForm.finishDate}
                      onChange={(event) =>
                        setRoundForm((previous) => ({ ...previous, finishDate: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="actions report-form-actions">
                  {roundEditId ? (
                    <>
                      <button type="button" onClick={handleSaveRoundDates} disabled={roundLoading}>
                        {t('saveReportDates')}
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={handleCancelRoundEdit}
                        disabled={roundLoading}
                      >
                        {t('cancel')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={handleStartRound} disabled={roundLoading}>
                        {t('startRound')}
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={handleFinishOpenRound}
                        disabled={roundLoading}
                      >
                        {t('finishOpenRound')}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={handleDeleteAllReports}
                        disabled={roundLoading || scopedRoundsForReports.length === 0}
                      >
                        {t('deleteAllReports')}
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="permission-note">
                {t('reportPersonName')}: <code>{normalizePersonName(userScope.name)}</code> | {t('reportPersonPhone')}:{' '}
                <code>{userScope.phone || '-'}</code>
              </p>
            )}

            {roundMessage ? <p className="auth-message">{roundMessage}</p> : null}
          </section>

          {/* Round summaries table panel */}
          <section className="panel">
            <h2>{t('roundLabel')}</h2>
            {roundSummaries.length === 0 ? (
              <p className="empty-state">{t('noRoundReports')}</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('name')}</th>
                      <th>{t('phoneNumber')}</th>
                      <th>{t('roundLabel')}</th>
                      <th>{t('startDateAdmin')}</th>
                      <th>{t('finishDateAdmin')}</th>
                      <th>{t('roundStatus')}</th>
                      <th>{t('totalBeforeDry')}</th>
                      <th>{t('totalAfterDry')}</th>
                      <th>{t('avgDryedRatio')}</th>
                      <th>{t('totalEntities')}</th>
                      {isAdmin ? <th>{t('actions')}</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {roundSummaries.map((item) => (
                      <tr key={`round-${item.id}`}>
                        <td>{normalizePersonName(item.customerName)}</td>
                        <td>{item.customerPhone || '-'}</td>
                        <td>{item.roundNumber}</td>
                        <td>{new Date(item.startDate).toLocaleDateString('en-GB')}</td>
                        <td>{new Date(item.endDate).toLocaleDateString('en-GB')}</td>
                        <td>{item.status === 'finished' ? t('roundFinished') : t('roundOpen')}</td>
                        <td>{item.totalBeforeDry.toFixed(2)}</td>
                        <td>{item.totalAfterDry.toFixed(2)}</td>
                        <td>{formatRatio(item.averageRatio)}</td>
                        <td>{item.totalEntries}</td>
                        {isAdmin ? (
                          <td className="row-actions">
                            <button type="button" className="secondary" onClick={() => handleEditRound(item)}>
                              {t('edit')}
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => handleDeleteRound(item)}
                              disabled={roundLoading}
                            >
                              {t('delete')}
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Monthly report panel */}
          <section className="panel">
            <h2>{t('monthlyReport')}</h2>
            {monthlyRoundSummary.length === 0 ? (
              <p className="empty-state">-</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('period')}</th>
                      <th>{t('totalBeforeDry')}</th>
                      <th>{t('totalAfterDry')}</th>
                      <th>{t('avgDryedRatio')}</th>
                      <th>{t('totalEntities')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRoundSummary.map((item) => (
                      <tr key={`month-${item.period}`}>
                        <td>{item.period}</td>
                        <td>{item.totalBeforeDry.toFixed(2)}</td>
                        <td>{item.totalAfterDry.toFixed(2)}</td>
                        <td>{formatRatio(item.averageRatio)}</td>
                        <td>{item.totalEntries}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Yearly report panel */}
          <section className="panel">
            <h2>{t('yearlyReport')}</h2>
            {yearlyRoundSummary.length === 0 ? (
              <p className="empty-state">-</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('period')}</th>
                      <th>{t('totalBeforeDry')}</th>
                      <th>{t('totalAfterDry')}</th>
                      <th>{t('avgDryedRatio')}</th>
                      <th>{t('totalEntities')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyRoundSummary.map((item) => (
                      <tr key={`year-${item.period}`}>
                        <td>{item.period}</td>
                        <td>{item.totalBeforeDry.toFixed(2)}</td>
                        <td>{item.totalAfterDry.toFixed(2)}</td>
                        <td>{formatRatio(item.averageRatio)}</td>
                        <td>{item.totalEntries}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
        ) : null}
      </div>
    </main>
  )
}

export default App
