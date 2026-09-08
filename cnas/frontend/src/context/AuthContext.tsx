import React, { createContext, useContext, useState } from 'react';

export interface User {
  username: string;
  name: string;
  role: 'Lead Investigator' | 'Senior Analyst' | 'Admin' | 'Deputy Superintendent of Police' | 'Superintendent of Police' | 'Inspector';
  badgeNumber: string;
  department: string;
  cadre: string;
  clearanceLevel: string;
  zone: string;
}

export interface CbiOfficerPreset {
  id: string;
  name: string;
  rank: string;
  badgeNumber: string;
  serviceNo: string;
  branch: string;
  clearance: string;
  zone: string;
  photoColor: string;
  initials: string;
}

export const CBI_OFFICER_PRESETS: CbiOfficerPreset[] = [
  {
    id: 'cbi-sp-01',
    name: 'SP Kabir Rao, IPS',
    rank: 'Superintendent of Police',
    badgeNumber: 'CBI-HQ-8841-DL',
    serviceNo: 'IPS-2012-7729',
    branch: 'Special Crime & Cyber Forensics Wing',
    clearance: 'LEVEL-V TOP SECRET // LES',
    zone: 'CBI HQ, CGO Complex, Lodhi Road, New Delhi',
    photoColor: 'from-amber-600 to-yellow-800',
    initials: 'KR',
  },
  {
    id: 'cbi-dsp-02',
    name: 'DSP Vikram Deshmukh',
    rank: 'Deputy Superintendent of Police',
    badgeNumber: 'CBI-SCB-4092-MB',
    serviceNo: 'CBI-2015-8841',
    branch: 'Economic Offences & Hawala Tracking Cell',
    clearance: 'LEVEL-IV SECRET // NATGRID',
    zone: 'CBI Western Zone, BKC Complex, Mumbai',
    photoColor: 'from-sky-600 to-blue-800',
    initials: 'VD',
  },
  {
    id: 'cbi-insp-03',
    name: 'Inspector Ananya Roy',
    rank: 'Inspector',
    badgeNumber: 'CBI-INT-1044-BL',
    serviceNo: 'CBI-2018-3319',
    branch: 'Darknet Intercept & Anti-Terror Unit',
    clearance: 'LEVEL-IV SECRET // CERT-IN',
    zone: 'CBI Southern Zone, Whitefield, Bengaluru',
    photoColor: 'from-emerald-600 to-teal-800',
    initials: 'AR',
  },
];

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string, officerOverride?: Partial<User>) => boolean;
  loginWithCbiCard: (preset: CbiOfficerPreset) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cnas_auth') === 'true';
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('cnas_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const loginWithCbiCard = (preset: CbiOfficerPreset): boolean => {
    const authUser: User = {
      username: preset.badgeNumber,
      name: preset.name,
      role: preset.rank as any,
      badgeNumber: preset.badgeNumber,
      department: preset.branch,
      cadre: 'Central Bureau of Investigation (CBI)',
      clearanceLevel: preset.clearance,
      zone: preset.zone,
    };
    setIsAuthenticated(true);
    setUser(authUser);
    sessionStorage.setItem('cnas_auth', 'true');
    sessionStorage.setItem('cnas_user', JSON.stringify(authUser));
    return true;
  };

  const login = (username: string, password: string, officerOverride?: Partial<User>): boolean => {
    // Check if matching CBI officer service number or generic valid demo
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) return false;

    // Find if matching any preset
    const matchedPreset = CBI_OFFICER_PRESETS.find(
      (p) =>
        p.badgeNumber.toLowerCase().includes(cleanUser.toLowerCase()) ||
        p.serviceNo.toLowerCase().includes(cleanUser.toLowerCase()) ||
        p.name.toLowerCase().includes(cleanUser.toLowerCase())
    );

    const defaultPreset = matchedPreset || CBI_OFFICER_PRESETS[0];

    const authUser: User = {
      username: cleanUser,
      name: officerOverride?.name || defaultPreset.name,
      role: (officerOverride?.role as any) || (defaultPreset.rank as any),
      badgeNumber: officerOverride?.badgeNumber || defaultPreset.badgeNumber,
      department: officerOverride?.department || defaultPreset.branch,
      cadre: 'Central Bureau of Investigation (Govt. of India)',
      clearanceLevel: officerOverride?.clearanceLevel || defaultPreset.clearance,
      zone: officerOverride?.zone || defaultPreset.zone,
    };

    setIsAuthenticated(true);
    setUser(authUser);
    sessionStorage.setItem('cnas_auth', 'true');
    sessionStorage.setItem('cnas_user', JSON.stringify(authUser));
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('cnas_auth');
    sessionStorage.removeItem('cnas_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, loginWithCbiCard, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
