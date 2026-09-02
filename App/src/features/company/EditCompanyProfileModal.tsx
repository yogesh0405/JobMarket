import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ArrowLeft, 
  Check, 
  Camera, 
  Building2, 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  FileText,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';

interface EditCompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: any;
  onSaveSuccess: (updatedCompany: any) => void;
}

const INDUSTRY_OPTIONS = [
  'Automotive & Auto Components',
  'Industrial Manufacturing',
  'Electronics & Electricals',
  'Pharmaceuticals & Chemicals',
  'Textiles & Garments',
  'Construction & Infrastructure',
  'Logistics & Warehousing',
  'Precision Machining & Forging',
  'Sheet Metal & Plastics',
  'Wiring Harness & Automotive Electronics',
  'Services & General Engineering',
  'Other Industrial Trade...'
];

const SIZE_OPTIONS = [
  '1-50 employees',
  '50-200 employees',
  '200-500 employees',
  '500-1,000 employees',
  '1,000-5,000 employees',
  '5,000-10,000 employees',
  '10,000+ employees'
];

const MIDC_OPTIONS = [
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Chikalthana MIDC (Chhatrapati Sambhajinagar)',
  'Paithan MIDC (Chhatrapati Sambhajinagar)',
  'Shendra DMIC / MIDC (Chhatrapati Sambhajinagar)',
  'Bidkin DMIC / MIDC (Chhatrapati Sambhajinagar)',
  'Railway Station Industrial Area (Chhatrapati Sambhajinagar)',
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (Pune)',
  'Ranjangaon MIDC (Pune)',
  'Hinjawadi MIDC (Pune)',
  'Rabale MIDC (Navi Mumbai)',
  'Taloja MIDC (Navi Mumbai)',
  'Tarapur MIDC (Palghar)',
  'Butibori MIDC (Nagpur)',
  'Non-MIDC Private Industrial Zone'
];

export const EditCompanyProfileModal: React.FC<EditCompanyProfileModalProps> = ({
  isOpen,
  onClose,
  company,
  onSaveSuccess
}) => {
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);

  // Intercept Mobile/Laptop Browser Back Button & Unsaved Tab Close when Modal is Open
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ companyProfileExitGuard: true }, '');

    const handlePopState = () => {
      window.history.pushState({ companyProfileExitGuard: true }, '');
      setShowExitConfirmModal(true);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen]);

  const handleConfirmExit = () => {
    setShowExitConfirmModal(false);
    onClose();
  };

  const getInitialValues = (c: any) => {
    const rawInd = (c?.industry || c?.tradeSpecialization || c?.trade_specialization || '').trim();
    const isKnown = INDUSTRY_OPTIONS.includes(rawInd) && rawInd !== 'Other Industrial Trade...';
    const initialIndustry = isKnown ? rawInd : rawInd ? 'Other Industrial Trade...' : 'Industrial Manufacturing';
    const initialOtherIndustry = !isKnown && rawInd && rawInd !== 'Other Industrial Trade...' ? rawInd : '';

    return {
      name: c?.companyName || c?.company_name || c?.name || '',
      logo: c?.logo || c?.profilePictureUrl || c?.profile_picture_url || c?.companyLogo || '',
      industry: initialIndustry,
      otherIndustry: initialOtherIndustry,
      companyType: c?.company_type || c?.companyType || 'Private Limited',
      companySize: c?.company_size || c?.companySize || '200-500 employees',
      foundedYear: c?.founded_year || c?.foundedYear || 2005,
      website: c?.website || '',
      phone: c?.phone || '',
      email: c?.email || '',
      address: c?.address || (typeof c?.location === 'string' && !c?.location.includes('MIDC') ? c.location : '') || '',
      city: c?.city || (typeof c?.location === 'string' ? c.location.split(',')[0].trim() : '') || 'Chhatrapati Sambhajinagar',
      midcZone: c?.midc_zone || c?.midcZone || 'Waluj MIDC (Chhatrapati Sambhajinagar)',
      description: c?.description || c?.companyDescription || c?.bio || '',
      gstNumber: c?.gst_number || c?.gstNumber || '',
    };
  };

  const initial = getInitialValues(company);

  // 4-Step Stepper State: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState(initial.name);
  const [logo, setLogo] = useState(initial.logo);
  const [industry, setIndustry] = useState(initial.industry);
  const [otherIndustry, setOtherIndustry] = useState(initial.otherIndustry);
  const [companyType, setCompanyType] = useState(initial.companyType);
  const [companySize, setCompanySize] = useState(initial.companySize);
  const [foundedYear, setFoundedYear] = useState<number | string>(initial.foundedYear);
  const [website, setWebsite] = useState(initial.website);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [address, setAddress] = useState(initial.address);
  const [city, setCity] = useState(initial.city);
  const [midcZone, setMidcZone] = useState(initial.midcZone);
  const [description, setDescription] = useState(initial.description);
  const [gstNumber, setGstNumber] = useState(initial.gstNumber);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize form fields whenever modal opens or company prop changes
  useEffect(() => {
    if (isOpen) {
      const vals = getInitialValues(company);
      setName(vals.name);
      setLogo(vals.logo);
      setIndustry(vals.industry);
      setOtherIndustry(vals.otherIndustry);
      setCompanyType(vals.companyType);
      setCompanySize(vals.companySize);
      setFoundedYear(vals.foundedYear);
      setWebsite(vals.website);
      setPhone(vals.phone);
      setEmail(vals.email);
      setAddress(vals.address);
      setCity(vals.city);
      setMidcZone(vals.midcZone);
      setDescription(vals.description);
      setGstNumber(vals.gstNumber);
      setCurrentStep(1);
      setErrorMsg(null);
    }
  }, [isOpen, company]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setErrorMsg('Company name is required.');
        return;
      }
      if (!industry.trim()) {
        setErrorMsg('Industry sector is required.');
        return;
      }
      if (industry === 'Other Industrial Trade...' && !otherIndustry.trim()) {
        setErrorMsg('Please specify your custom trade / industry sector.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!city.trim()) {
        setErrorMsg('City / Location is required.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  // Submit Handler on Step 4
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Company name is required.');
      setCurrentStep(1);
      return;
    }

    if (industry === 'Other Industrial Trade...' && !otherIndustry.trim()) {
      setErrorMsg('Please specify your custom trade / industry sector.');
      setCurrentStep(1);
      return;
    }

    const finalIndustry = industry === 'Other Industrial Trade...' ? otherIndustry.trim() : industry.trim();

    setIsSubmitting(true);

    try {
      const targetCompanyId = company?.id || (company?.name ? encodeURIComponent(company.name) : encodeURIComponent(name.trim()));
      const res = await apiFetch(`/api/v1/companies/${targetCompanyId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          logo: (logo || '').trim(),
          industry: finalIndustry,
          company_type: companyType,
          company_size: companySize,
          founded_year: Number(foundedYear) || 2005,
          website: website.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          midc_zone: midcZone.trim(),
          description: description.trim(),
          gst_number: gstNumber.trim().toUpperCase()
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || 'Failed to update company profile.');
      }

      onSaveSuccess(json.data || json);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="edit-profile-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="edit-profile-modal-container company-edit-modal"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '0px',
          border: '1px solid #CBD5E1',
          width: '100%',
          maxWidth: '580px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#FFFFFF'
        }}>
          <button
            type="button"
            onClick={() => setShowExitConfirmModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0F172A',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
              Edit Company Profile
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Update factory details & business preferences
            </p>
          </div>
        </div>

        {/* 4-Step Stepper Header */}
        <div style={{
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          padding: '14px 16px 12px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            
            {/* Step 1 */}
            <div 
              onClick={() => setCurrentStep(1)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer' }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 1 ? '#FFFFFF' : currentStep > 1 ? '#2563EB' : '#F1F5F9',
                border: currentStep === 1 ? '2px solid #2563EB' : currentStep > 1 ? 'none' : '1px solid #CBD5E1',
                color: currentStep === 1 ? '#2563EB' : currentStep > 1 ? '#FFFFFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                transition: 'all 0.2s ease'
              }}>
                {currentStep > 1 ? <Check size={16} strokeWidth={3} /> : '1'}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: currentStep === 1 ? '800' : '600',
                color: currentStep === 1 ? '#0F172A' : '#64748B',
                marginTop: '6px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Basic Details
              </span>
            </div>

            {/* Line 1-2 */}
            <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > 1 ? '#2563EB' : '#E2E8F0', margin: '0 4px', marginTop: '-18px' }} />

            {/* Step 2 */}
            <div 
              onClick={() => currentStep > 1 && setCurrentStep(2)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: currentStep > 1 ? 'pointer' : 'default' }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 2 ? '#FFFFFF' : currentStep > 2 ? '#2563EB' : '#F1F5F9',
                border: currentStep === 2 ? '2px solid #2563EB' : currentStep > 2 ? 'none' : '1px solid #CBD5E1',
                color: currentStep === 2 ? '#2563EB' : currentStep > 2 ? '#FFFFFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                transition: 'all 0.2s ease'
              }}>
                {currentStep > 2 ? <Check size={16} strokeWidth={3} /> : '2'}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: currentStep === 2 ? '800' : '600',
                color: currentStep === 2 ? '#0F172A' : '#64748B',
                marginTop: '6px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Overview
              </span>
            </div>

            {/* Line 2-3 */}
            <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > 2 ? '#2563EB' : '#E2E8F0', margin: '0 4px', marginTop: '-18px' }} />

            {/* Step 3 */}
            <div 
              onClick={() => currentStep > 2 && setCurrentStep(3)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: currentStep > 2 ? 'pointer' : 'default' }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 3 ? '#FFFFFF' : currentStep > 3 ? '#2563EB' : '#F1F5F9',
                border: currentStep === 3 ? '2px solid #2563EB' : currentStep > 3 ? 'none' : '1px solid #CBD5E1',
                color: currentStep === 3 ? '#2563EB' : currentStep > 3 ? '#FFFFFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                transition: 'all 0.2s ease'
              }}>
                {currentStep > 3 ? <Check size={16} strokeWidth={3} /> : '3'}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: currentStep === 3 ? '800' : '600',
                color: currentStep === 3 ? '#0F172A' : '#64748B',
                marginTop: '6px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Location
              </span>
            </div>

            {/* Line 3-4 */}
            <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > 3 ? '#2563EB' : '#E2E8F0', margin: '0 4px', marginTop: '-18px' }} />

            {/* Step 4 */}
            <div 
              onClick={() => currentStep > 3 && setCurrentStep(4)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: currentStep > 3 ? 'pointer' : 'default' }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 4 ? '#FFFFFF' : currentStep > 4 ? '#2563EB' : '#F1F5F9',
                border: currentStep === 4 ? '2px solid #2563EB' : currentStep > 4 ? 'none' : '1px solid #CBD5E1',
                color: currentStep === 4 ? '#2563EB' : currentStep > 4 ? '#FFFFFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                transition: 'all 0.2s ease'
              }}>
                4
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: currentStep === 4 ? '800' : '600',
                color: currentStep === 4 ? '#0F172A' : '#64748B',
                marginTop: '6px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Contact
              </span>
            </div>

          </div>
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div style={{
            margin: '12px 18px 0 18px',
            padding: '10px 14px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            fontSize: '12.5px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step Body Content - Scrollable */}
        <div style={{
          padding: '16px 18px',
          overflowY: 'auto',
          flex: 1
        }}>

          {/* STEP 1: Basic Details & Logo */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Photo Upload Avatar Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                  <CompanyDefaultLogo
                    logoUrl={logo}
                    companyName={name || 'Company'}
                    size={64}
                    borderRadius="0px"
                  />
                  <label 
                    htmlFor="employer-logo-upload-input"
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#2563EB',
                      border: '2px solid #FFFFFF',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Camera size={16} color="#FFFFFF" />
                  </label>
                  <input
                    id="employer-logo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: '600' }}>
                  Tap camera to update logo
                </span>
              </div>

              {/* Company Information Form Box */}
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 14px 0' }}>
                  Company Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      Company Name <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bajaj Auto Limited"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        outline: 'none',
                        color: '#0F172A'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      Industry Sector <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => {
                        setIndustry(e.target.value);
                        if (e.target.value !== 'Other Industrial Trade...') {
                          setOtherIndustry('');
                        }
                        if (errorMsg) setErrorMsg(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        outline: 'none',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    {industry === 'Other Industrial Trade...' && (
                      <div style={{ marginTop: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2563EB', marginBottom: '4px' }}>
                          Specify Custom Trade / Industry Sector <span style={{ color: '#DC2626' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={otherIndustry}
                          onChange={(e) => {
                            setOtherIndustry(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="e.g. Aerospace Engineering, Defense Components, Solar Equipment..."
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '1.5px solid #2563EB',
                            borderRadius: '0px',
                            fontSize: '13px',
                            outline: 'none',
                            color: '#0F172A',
                            backgroundColor: '#F8FAFC'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      Company Legal Type
                    </label>
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        outline: 'none',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                      <option value="Public Limited">Public Limited (PLC)</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership Firm">Partnership Firm</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="MNC Branch">MNC Branch</option>
                      <option value="Govt Enterprise">Government / PSU</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Business Overview */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 14px 0' }}>
                  Business Overview & Operations
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      Company Bio / Description
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief summary of your manufacturing operations, plant capacity, and career growth opportunities for technical candidates..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#0F172A',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                        Company Size
                      </label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '0px',
                          fontSize: '13px',
                          outline: 'none',
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {SIZE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                        Founded Year
                      </label>
                      <input
                        type="number"
                        value={foundedYear}
                        onChange={(e) => setFoundedYear(e.target.value)}
                        placeholder="e.g. 2005"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '0px',
                          fontSize: '13px',
                          outline: 'none',
                          color: '#0F172A'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      GST Registration Number (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 27AAACB2211R1ZM"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        outline: 'none',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Location & MIDC Zone */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 14px 0' }}>
                  Location & MIDC Zone
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      City / Location <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Chhatrapati Sambhajinagar"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        outline: 'none',
                        color: '#0F172A'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      MIDC Industrial Zone <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      value={midcZone}
                      onChange={(e) => setMidcZone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {MIDC_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      Factory / Plant Address
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Plot No. E-10, MIDC Waluj Industrial Area, Gate No. 4..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#0F172A',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Contact & Website */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 14px 0' }}>
                  Contact Information & Digital Presence
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      Mobile / Helpline Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        outline: 'none',
                        color: '#0F172A'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      Official HR Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. hr@company.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        outline: 'none',
                        color: '#0F172A'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                      Official Website URL
                    </label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. https://www.company.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        outline: 'none',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer Bar */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              style={{
                padding: '11px 18px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: '13.5px',
                fontWeight: '700',
                borderRadius: '0px',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              style={{
                flex: 1,
                padding: '11px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '700',
                borderRadius: '0px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Continue to Step {currentStep + 1}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '11px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '700',
                borderRadius: '0px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Saving Profile...' : 'Save Profile'}
            </button>
          )}
        </div>

      </div>

      {/* Exit Confirmation Dialog Modal */}
      {showExitConfirmModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px 20px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
            boxSizing: 'border-box',
            animation: 'fadeInUp 200ms ease forwards'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
              Discard Company Profile Changes?
            </h3>

            <p style={{ margin: '0 0 24px 0', fontSize: '13.5px', color: '#64748B', lineHeight: '1.5', fontWeight: '500' }}>
              You have unsaved changes in your company profile. Are you sure you want to exit? All progress entered so far will be lost.
            </p>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Keep Editing
              </button>

              <button
                type="button"
                onClick={handleConfirmExit}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
