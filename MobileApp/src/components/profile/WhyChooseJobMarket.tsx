import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop, G, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  Illustration: React.FC<{ width?: number; height?: number }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// FLAT VECTOR CHARACTER SCENE ILLUSTRATIONS (Matching Reference Image Style)
// ─────────────────────────────────────────────────────────────────────────────

// Candidate 1: Discover Jobs (Person sitting on couch with laptop browsing job options)
const DiscoverJobsScene: React.FC<{ width?: number; height?: number }> = ({ width = 160, height = 110 }) => (
  <View style={styles.sceneWrapper}>
    <Svg width={width} height={height} viewBox="0 0 200 138" fill="none">
      <Defs>
        <LinearGradient id="peachBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFF5ED" />
          <Stop offset="100%" stopColor="#FFEAD8" />
        </LinearGradient>
      </Defs>

      {/* Pastel Rounded Arch Backdrop */}
      <Rect x="10" y="8" width="180" height="120" rx="24" fill="url(#peachBackdrop)" stroke="#FED7AA" strokeWidth="1" />

      {/* Floor Line */}
      <Path d="M25 116H175" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Background Decor: Hanging Lamp */}
      <Path d="M150 8V35" stroke="#FB923C" strokeWidth="1.5" />
      <Path d="M142 35H158L153 45H147L142 35Z" fill="#FDBA74" />

      {/* Modern Sofa / Couch */}
      <Rect x="40" y="68" width="120" height="42" rx="8" fill="#F87171" />
      <Rect x="34" y="60" width="132" height="16" rx="6" fill="#EF4444" />
      <Rect x="44" y="82" width="52" height="24" rx="4" fill="#DC2626" />
      <Rect x="104" y="82" width="52" height="24" rx="4" fill="#DC2626" />
      {/* Sofa Legs */}
      <Rect x="46" y="110" width="6" height="8" rx="2" fill="#78350F" />
      <Rect x="148" y="110" width="6" height="8" rx="2" fill="#78350F" />

      {/* Character Sitting on Sofa */}
      {/* Head */}
      <Circle cx="82" cy="44" r="10" fill="#78350F" />
      <Circle cx="82" cy="46" r="8" fill="#FDBA74" />
      <Path d="M74 44C74 38 78 36 84 36C90 36 91 40 91 44" fill="#451A03" />
      {/* Body / Torso (Teal shirt) */}
      <Path d="M70 60C70 54 75 52 82 52C89 52 94 54 94 60V78H70V60Z" fill="#0D9488" />
      {/* Legs (Blue jeans) */}
      <Rect x="72" y="78" width="10" height="26" rx="4" fill="#1D4ED8" />
      <Rect x="84" y="78" width="10" height="26" rx="4" fill="#1D4ED8" />

      {/* Laptop on Lap */}
      <Rect x="68" y="72" width="28" height="18" rx="3" fill="#1B4FDF" />
      <Rect x="70" y="74" width="24" height="13" rx="2" fill="#FFFFFF" />
      {/* Search Lens graphic on screen */}
      <Circle cx="80" cy="80" r="4" stroke="#1B4FDF" strokeWidth="1.5" />
      <Path d="M83 83L87 87" stroke="#1B4FDF" strokeWidth="1.5" strokeLinecap="round" />
      <Rect x="64" y="90" width="36" height="3" rx="1.5" fill="#94A3B8" />

      {/* Floating Job Badge Cards */}
      <G transform="translate(118, 25)">
        <Rect x="0" y="0" width="54" height="32" rx="6" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="1" />
        <Circle cx="12" cy="12" r="5" fill="#1B4FDF" />
        <Rect x="21" y="8" width="24" height="3" rx="1.5" fill="#0F172A" />
        <Rect x="21" y="14" width="18" height="2.5" rx="1" fill="#94A3B8" />
        <Rect x="8" y="21" width="38" height="5" rx="2.5" fill="#EFF6FF" />
        <SvgText x="14" y="25" fontSize="3.5" fontWeight="bold" fill="#1B4FDF">MIDC TECH</SvgText>
      </G>
    </Svg>
  </View>
);

// Candidate 2: Digital Profile & Resume (Person standing next to digital resume board)
const CandidateProfileScene: React.FC<{ width?: number; height?: number }> = ({ width = 160, height = 110 }) => (
  <View style={styles.sceneWrapper}>
    <Svg width={width} height={height} viewBox="0 0 200 138" fill="none">
      <Defs>
        <LinearGradient id="purpleBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#F5F3FF" />
          <Stop offset="100%" stopColor="#EDE9FE" />
        </LinearGradient>
      </Defs>

      {/* Pastel Arch Backdrop */}
      <Rect x="10" y="8" width="180" height="120" rx="24" fill="url(#purpleBackdrop)" stroke="#DDD6FE" strokeWidth="1" />

      {/* Floor */}
      <Path d="M25 116H175" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Large Digital Profile Stand / Board */}
      <Rect x="32" y="20" width="90" height="92" rx="8" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="1.5" />
      <Rect x="32" y="20" width="90" height="20" rx="8" fill="#7C3AED" />

      {/* Profile Header Elements */}
      <Circle cx="50" cy="30" r="7" fill="#EDE9FE" stroke="#FFFFFF" strokeWidth="1.5" />
      <Rect x="62" y="26" width="45" height="4" rx="2" fill="#FFFFFF" />
      <Rect x="62" y="32" width="30" height="3" rx="1.5" fill="#DDD6FE" />

      {/* Resume Content Mockup */}
      <Rect x="42" y="48" width="70" height="4" rx="2" fill="#4C1D95" />
      <Rect x="42" y="56" width="55" height="3" rx="1.5" fill="#94A3B8" />
      <Rect x="42" y="62" width="62" height="3" rx="1.5" fill="#CBD5E1" />

      {/* Skill Chips */}
      <Rect x="42" y="72" width="20" height="8" rx="4" fill="#F3E8FF" stroke="#C084FC" strokeWidth="1" />
      <Rect x="66" y="72" width="22" height="8" rx="4" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1" />
      <Rect x="42" y="84" width="46" height="16" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

      {/* Verified Badge Icon on Card */}
      <Circle cx="108" cy="94" r="9" fill="#059669" />
      <Path d="M104 94L107 97L112 91" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Character Standing Next to Board */}
      {/* Head */}
      <Circle cx="152" cy="38" r="9" fill="#451A03" />
      <Circle cx="152" cy="40" r="7" fill="#FDBA74" />
      {/* Hair */}
      <Path d="M145 38C145 32 150 30 155 30C160 30 161 34 161 38" fill="#1E293B" />
      {/* Torso (Coral pink shirt) */}
      <Path d="M142 54C142 49 146 47 152 47C158 47 162 49 162 54V82H142V54Z" fill="#EC4899" />
      {/* Legs (Dark trousers) */}
      <Rect x="144" y="82" width="7" height="32" rx="3.5" fill="#1E293B" />
      <Rect x="153" y="82" width="7" height="32" rx="3.5" fill="#1E293B" />
      {/* Arm pointing to board */}
      <Path d="M144 54L128 64" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" />
      <Circle cx="127" cy="65" r="3" fill="#FDBA74" />
    </Svg>
  </View>
);

// Candidate 3: 1-Tap Quick Apply (Person at desk with headphones launching application)
const OneTapApplyScene: React.FC<{ width?: number; height?: number }> = ({ width = 160, height = 110 }) => (
  <View style={styles.sceneWrapper}>
    <Svg width={width} height={height} viewBox="0 0 200 138" fill="none">
      <Defs>
        <LinearGradient id="blueBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#F0F9FF" />
          <Stop offset="100%" stopColor="#E0F2FE" />
        </LinearGradient>
      </Defs>

      {/* Arch Backdrop */}
      <Rect x="10" y="8" width="180" height="120" rx="24" fill="url(#blueBackdrop)" stroke="#BAE6FD" strokeWidth="1" />

      {/* Floor */}
      <Path d="M25 116H175" stroke="#7DD3FC" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Desk */}
      <Rect x="50" y="76" width="100" height="8" rx="2" fill="#78350F" />
      <Rect x="56" y="84" width="6" height="32" rx="2" fill="#9A3412" />
      <Rect x="138" y="84" width="6" height="32" rx="2" fill="#9A3412" />

      {/* Chair */}
      <Rect x="82" y="65" width="36" height="45" rx="6" fill="#1E293B" />

      {/* Character Sitting at Desk with Headphones */}
      <Circle cx="100" cy="38" r="9" fill="#FDBA74" />
      {/* Hair */}
      <Path d="M92 36C92 30 96 28 100 28C104 28 108 30 108 36" fill="#1B4FDF" />
      {/* Headphones */}
      <Path d="M90 38C90 32 94 30 100 30C106 30 110 32 110 38" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
      <Rect x="89" y="35" width="4" height="8" rx="2" fill="#EF4444" />
      <Rect x="107" y="35" width="4" height="8" rx="2" fill="#EF4444" />

      {/* Body (Bright Blue shirt) */}
      <Path d="M90 52C90 47 94 45 100 45C106 45 110 47 110 52V76H90V52Z" fill="#2563EB" />

      {/* Laptop on Desk */}
      <Rect x="86" y="62" width="28" height="16" rx="3" fill="#0F172A" />
      <Rect x="88" y="64" width="24" height="12" rx="2" fill="#FFFFFF" />
      {/* Success Apply Check graphic */}
      <Circle cx="100" cy="70" r="4" fill="#059669" />
      <Path d="M98 70L99.5 71.5L102 68.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />

      {/* Rocket Launch Effect Out of Laptop */}
      <G transform="translate(132, 22)">
        <Circle cx="20" cy="20" r="18" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
        <Path d="M20 9L27 27L20 23L13 27L20 9Z" fill="#1B4FDF" />
        <Circle cx="20" cy="32" r="3" fill="#F59E0B" />
      </G>
    </Svg>
  </View>
);

// Candidate 4: Track Progress & HR Interview (Interview scene at table with 2 people)
const TrackingScene: React.FC<{ width?: number; height?: number }> = ({ width = 160, height = 110 }) => (
  <View style={styles.sceneWrapper}>
    <Svg width={width} height={height} viewBox="0 0 200 138" fill="none">
      <Defs>
        <LinearGradient id="yellowBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FEFCE8" />
          <Stop offset="100%" stopColor="#FEF08A" />
        </LinearGradient>
      </Defs>

      {/* Arch Backdrop */}
      <Rect x="10" y="8" width="180" height="120" rx="24" fill="url(#yellowBackdrop)" stroke="#FDE047" strokeWidth="1" />

      {/* Floor */}
      <Path d="M25 116H175" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Table */}
      <Rect x="40" y="78" width="120" height="8" rx="2" fill="#B45309" />
      <Rect x="50" y="86" width="6" height="30" rx="2" fill="#78350F" />
      <Rect x="144" y="86" width="6" height="30" rx="2" fill="#78350F" />

      {/* Left Person (HR Recruiter) */}
      <Circle cx="62" cy="46" r="8" fill="#FDBA74" />
      <Path d="M55 44C55 38 60 36 65 36C70 36 71 40 71 44" fill="#78350F" />
      <Path d="M52 60C52 54 56 52 62 52C68 52 72 54 72 60V78H52V60Z" fill="#7C3AED" />

      {/* Right Person (Candidate) */}
      <Circle cx="138" cy="46" r="8" fill="#FDBA74" />
      <Path d="M131 44C131 38 136 36 141 36C146 36 147 40 147 44" fill="#0F172A" />
      <Path d="M128 60C128 54 132 52 138 52C144 52 148 54 148 60V78H128V60Z" fill="#059669" />

      {/* Speech Bubbles */}
      <Rect x="74" y="24" width="26" height="16" rx="5" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="1.2" />
      <Path d="M80 40L84 45L86 40H80Z" fill="#FFFFFF" />
      <Rect x="78" y="29" width="18" height="2" rx="1" fill="#7C3AED" />
      <Rect x="78" y="34" width="12" height="2" rx="1" fill="#DDD6FE" />

      <Rect x="104" y="24" width="26" height="16" rx="5" fill="#FFFFFF" stroke="#059669" strokeWidth="1.2" />
      <Path d="M120 40L116 45L114 40H120Z" fill="#FFFFFF" />
      <Rect x="108" y="29" width="18" height="2" rx="1" fill="#059669" />
      <Rect x="108" y="34" width="14" height="2" rx="1" fill="#A7F3D0" />

      {/* Laptop & Coffee Cup on Table */}
      <Rect x="92" y="68" width="16" height="10" rx="2" fill="#64748B" />
      <Rect x="114" y="70" width="6" height="8" rx="2" fill="#EF4444" />
    </Svg>
  </View>
);

// Employer 1: Publish Vacancies (Recruiter posting job at desktop monitor)
const PostJobScene: React.FC<{ width?: number; height?: number }> = ({ width = 160, height = 110 }) => (
  <View style={styles.sceneWrapper}>
    <Svg width={width} height={height} viewBox="0 0 200 138" fill="none">
      <Defs>
        <LinearGradient id="empPeachBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFF5ED" />
          <Stop offset="100%" stopColor="#FFEAD8" />
        </LinearGradient>
      </Defs>

      <Rect x="10" y="8" width="180" height="120" rx="24" fill="url(#empPeachBackdrop)" stroke="#FED7AA" strokeWidth="1" />
      <Path d="M25 116H175" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Big Desktop Monitor */}
      <Rect x="45" y="22" width="75" height="52" rx="6" fill="#FFFFFF" stroke="#1B4FDF" strokeWidth="1.5" />
      <Rect x="45" y="22" width="75" height="12" rx="6" fill="#1B4FDF" />
      <Rect x="75" y="74" width="15" height="10" fill="#94A3B8" />
      <Rect x="65" y="84" width="35" height="4" rx="2" fill="#64748B" />

      {/* Form content on Desktop */}
      <Rect x="52" y="40" width="35" height="4" rx="2" fill="#1E293B" />
      <Rect x="52" y="47" width="45" height="3" rx="1.5" fill="#94A3B8" />
      <Rect x="52" y="53" width="28" height="3" rx="1.5" fill="#CBD5E1" />
      <Rect x="52" y="60" width="20" height="8" rx="3" fill="#059669" />

      {/* Recruiter Character Sitting at Desk */}
      <Circle cx="145" cy="48" r="9" fill="#FDBA74" />
      <Path d="M137 46C137 40 142 38 147 38C152 38 153 42 153 46" fill="#1E293B" />
      <Path d="M135 64C135 58 139 56 145 56C151 56 155 58 155 64V86H135V64Z" fill="#2563EB" />

      {/* Plus Post Badge */}
      <Circle cx="106" cy="30" r="10" fill="#1B4FDF" />
      <Path d="M106 24V36M100 30H112" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  </View>
);

// Employer 2: Verified Candidate Pool (Recruiter evaluating candidate profiles)
const CandidatePoolScene: React.FC<{ width?: number; height?: number }> = ({ width = 160, height = 110 }) => (
  <View style={styles.sceneWrapper}>
    <Svg width={width} height={height} viewBox="0 0 200 138" fill="none">
      <Defs>
        <LinearGradient id="empPurpleBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#F5F3FF" />
          <Stop offset="100%" stopColor="#EDE9FE" />
        </LinearGradient>
      </Defs>

      <Rect x="10" y="8" width="180" height="120" rx="24" fill="url(#empPurpleBackdrop)" stroke="#DDD6FE" strokeWidth="1" />
      <Path d="M25 116H175" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Candidate Profile Cards Grid */}
      <G transform="translate(30, 24)">
        <Rect x="0" y="0" width="42" height="48" rx="6" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="1.5" />
        <Circle cx="21" cy="16" r="8" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5" />
        <Rect x="8" y="28" width="26" height="3" rx="1.5" fill="#4C1D95" />
        <Rect x="11" y="34" width="20" height="2.5" rx="1" fill="#94A3B8" />
        <Circle cx="34" cy="40" r="5" fill="#059669" />
      </G>

      <G transform="translate(80, 24)">
        <Rect x="0" y="0" width="42" height="48" rx="6" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
        <Circle cx="21" cy="16" r="8" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
        <Rect x="8" y="28" width="26" height="3" rx="1.5" fill="#1E293B" />
        <Rect x="11" y="34" width="20" height="2.5" rx="1" fill="#94A3B8" />
        <Circle cx="34" cy="40" r="5" fill="#059669" />
      </G>

      {/* Recruiter Character Inspecting */}
      <Circle cx="152" cy="46" r="9" fill="#FDBA74" />
      <Path d="M144 44C144 38 149 36 154 36C159 36 160 40 160 44" fill="#0F172A" />
      <Path d="M142 62C142 56 146 54 152 54C158 54 162 56 162 62V86H142V62Z" fill="#7C3AED" />

      {/* Magnifying Glass Overlay */}
      <Circle cx="64" cy="76" r="14" fill="#FFFFFF" stroke="#1B4FDF" strokeWidth="2.5" />
      <Path d="M74 86L86 98" stroke="#1B4FDF" strokeWidth="3.5" strokeLinecap="round" />
    </Svg>
  </View>
);

// Employer 3: Pipeline & Applicant Review
const PipelineScene: React.FC<{ width?: number; height?: number }> = ({ width = 160, height = 110 }) => (
  <View style={styles.sceneWrapper}>
    <Svg width={width} height={height} viewBox="0 0 200 138" fill="none">
      <Defs>
        <LinearGradient id="empTealBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#F0FDF4" />
          <Stop offset="100%" stopColor="#DCFCE7" />
        </LinearGradient>
      </Defs>

      <Rect x="10" y="8" width="180" height="120" rx="24" fill="url(#empTealBackdrop)" stroke="#86EFAC" strokeWidth="1" />
      <Path d="M25 116H175" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Kanban Board Display */}
      <Rect x="30" y="22" width="140" height="82" rx="8" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" />

      {/* Column 1 */}
      <Rect x="38" y="30" width="36" height="66" rx="4" fill="#F1F5F9" />
      <Rect x="42" y="34" width="20" height="3" rx="1.5" fill="#475569" />
      <Rect x="42" y="42" width="28" height="14" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
      <Rect x="42" y="60" width="28" height="14" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />

      {/* Column 2 (Shortlisted) */}
      <Rect x="82" y="30" width="36" height="66" rx="4" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
      <Rect x="86" y="34" width="24" height="3" rx="1.5" fill="#059669" />
      <Rect x="86" y="42" width="28" height="18" rx="3" fill="#FFFFFF" stroke="#059669" strokeWidth="1.2" />
      <Circle cx="106" cy="51" r="4" fill="#F59E0B" />

      {/* Column 3 (Interview) */}
      <Rect x="126" y="30" width="36" height="66" rx="4" fill="#EFF6FF" />
      <Rect x="130" y="34" width="22" height="3" rx="1.5" fill="#1B4FDF" />
      <Rect x="130" y="42" width="28" height="14" rx="3" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1" />
    </Svg>
  </View>
);

// Employer 4: HR Scheduling & Recruitment Analytics
const RecruitmentMetricsScene: React.FC<{ width?: number; height?: number }> = ({ width = 160, height = 110 }) => (
  <View style={styles.sceneWrapper}>
    <Svg width={width} height={height} viewBox="0 0 200 138" fill="none">
      <Defs>
        <LinearGradient id="empYellowBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FEFCE8" />
          <Stop offset="100%" stopColor="#FEF08A" />
        </LinearGradient>
      </Defs>

      <Rect x="10" y="8" width="180" height="120" rx="24" fill="url(#empYellowBackdrop)" stroke="#FDE047" strokeWidth="1" />
      <Path d="M25 116H175" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Analytics Chart Board */}
      <Rect x="35" y="20" width="130" height="84" rx="8" fill="#FFFFFF" stroke="#EAB308" strokeWidth="1.5" />
      <Rect x="45" y="28" width="45" height="4" rx="2" fill="#0F172A" />

      {/* Bar Chart */}
      <Rect x="50" y="70" width="14" height="22" rx="3" fill="#93C5FD" />
      <Rect x="72" y="54" width="14" height="38" rx="3" fill="#3B82F6" />
      <Rect x="94" y="42" width="14" height="50" rx="3" fill="#1B4FDF" />
      <Rect x="116" y="32" width="14" height="60" rx="3" fill="#059669" />

      {/* Growth Trend Arrow Line */}
      <Path d="M57 64L79 48L101 38L123 26" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M116 26H124V34" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE DATA
// ─────────────────────────────────────────────────────────────────────────────

const CANDIDATE_FEATURES: FeatureItem[] = [
  {
    id: 'c1',
    title: 'Discover Relevant Jobs',
    description:
      'Search vacancies across IT, Corporate, Healthcare, Sales, and technical trades in major industrial zones.',
    Illustration: DiscoverJobsScene,
  },
  {
    id: 'c2',
    title: 'Build Candidate Profile',
    description:
      'Build a digital resume showcasing your skills, qualifications, trade specialization, and verified work history.',
    Illustration: CandidateProfileScene,
  },
  {
    id: 'c3',
    title: 'Apply to Jobs Easily',
    description:
      'Apply to active postings in seconds using your stored candidate profile without redundant form fills.',
    Illustration: OneTapApplyScene,
  },
  {
    id: 'c4',
    title: 'Track Applications & Status',
    description:
      'Track your job application status from review to shortlist and direct HR interview scheduling.',
    Illustration: TrackingScene,
  },
];

const EMPLOYER_FEATURES: FeatureItem[] = [
  {
    id: 'e1',
    title: 'Publish Job Opportunities',
    description:
      'Post detailed job openings specifying MIDC industrial zones, shift timing, bus facility, and perks.',
    Illustration: PostJobScene,
  },
  {
    id: 'e2',
    title: 'Reach Suitable Candidates',
    description:
      'Connect directly with pre-screened job seekers across engineering, skilled trades, and management.',
    Illustration: CandidatePoolScene,
  },
  {
    id: 'e3',
    title: 'Manage Applications & Pipeline',
    description:
      'Review applicant profiles, evaluate resume credentials, shortlist top talent, and update status seamlessly.',
    Illustration: PipelineScene,
  },
  {
    id: 'e4',
    title: 'Track Recruitment Activity',
    description:
      'Schedule interviews directly, track candidate conversions, and optimize company hiring metrics.',
    Illustration: RecruitmentMetricsScene,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SECTION COMPONENT (STRICTLY ROLE-BASED, MATCHING REFERENCE IMAGE DENSITY)
// ─────────────────────────────────────────────────────────────────────────────

export const WhyChooseJobMarket: React.FC = () => {
  const { user } = useAuth();

  // Strictly render based on authenticated user role type
  const isEmployer = user?.role === 'employer';
  const activeFeatures = isEmployer ? EMPLOYER_FEATURES : CANDIDATE_FEATURES;

  return (
    <View style={styles.sectionContainer}>
      {/* SECTION HEADER */}
      <View style={styles.headerBlock}>
        <Text style={styles.sectionHeadingText}>Why Choose JobMarket?</Text>
        <Text style={styles.sectionSubHeadingText}>
          {isEmployer
            ? 'Built for enterprise recruiters and employers to hire qualified talent efficiently.'
            : 'Designed to accelerate your career growth with verified opportunities nationwide.'}
        </Text>
      </View>

      {/* VERTICAL STORYTELLING FLOW CONTAINER */}
      <View style={styles.storytellingFlowContainer}>
        {activeFeatures.map((item, index) => {
          const isLast = index === activeFeatures.length - 1;
          const { Illustration } = item;

          return (
            <View key={item.id} style={styles.stepBlock}>
              {/* Centered Scene Illustration */}
              <Illustration width={135} height={92} />

              {/* Title & Description */}
              <View style={styles.textContentWrap}>
                <Text style={styles.featureTitleText}>{item.title}</Text>
                <Text style={styles.featureDescText}>{item.description}</Text>
              </View>

              {/* Thin Vertical Dashed Connecting Line (As shown in Reference Image) */}
              {!isLast && (
                <View style={styles.connectorWrap}>
                  <View style={styles.dashedConnectorLine} />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLESHEET
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0, // Strict rule: square corners
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionHeadingText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sectionSubHeadingText: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 16,
    maxWidth: 320,
  },

  /* Vertical Storytelling Flow */
  storytellingFlowContainer: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 420,
  },
  stepBlock: {
    alignItems: 'center',
    width: '100%',
  },
  sceneWrapper: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContentWrap: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  featureTitleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  featureDescText: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 310,
  },

  /* Reference Image Dashed Connector Visual */
  connectorWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    height: 24,
  },
  dashedConnectorLine: {
    width: 1.5,
    height: 24,
    borderLeftWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
});

export default WhyChooseJobMarket;
