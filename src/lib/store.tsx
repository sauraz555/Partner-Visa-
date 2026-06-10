'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type {
  User,
  Project,
  EvidenceFile,
  PDFDocument,
  MissingInfoItem,
  DuplicateGroup,
  TimelineMilestone,
  AuditEvent,
} from '@/lib/types';
import { DEMO_PROJECTS, DEMO_EVIDENCE, DEMO_USER, DEMO_MILESTONES } from '@/lib/mock-data';

// ============================================================
// State Shape
// ============================================================

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  projects: Project[];
  activeProjectId: string | null;
  evidence: Record<string, EvidenceFile[]>; // keyed by projectId
  documents: Record<string, PDFDocument[]>;
  missingInfo: Record<string, MissingInfoItem[]>;
  duplicateGroups: Record<string, DuplicateGroup[]>;
  milestones: Record<string, TimelineMilestone[]>;
  auditLog: AuditEvent[];
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  createdAt: string;
  read: boolean;
}

// ============================================================
// Actions
// ============================================================

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'SET_ACTIVE_PROJECT'; payload: string }
  | { type: 'SET_EVIDENCE'; payload: { projectId: string; files: EvidenceFile[] } }
  | { type: 'ADD_EVIDENCE'; payload: { projectId: string; file: EvidenceFile } }
  | { type: 'UPDATE_EVIDENCE'; payload: { projectId: string; file: EvidenceFile } }
  | { type: 'SET_MILESTONES'; payload: { projectId: string; milestones: TimelineMilestone[] } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'createdAt' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'HYDRATE'; payload: Partial<AppState> };

// ============================================================
// Initial State
// ============================================================

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  projects: [],
  activeProjectId: null,
  evidence: {},
  documents: {},
  missingInfo: {},
  duplicateGroups: {},
  milestones: {},
  auditLog: [],
  theme: 'system',
  sidebarCollapsed: false,
  notifications: [],
};

// ============================================================
// Reducer
// ============================================================

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...initialState, theme: state.theme };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProjectId: action.payload };
    case 'SET_EVIDENCE':
      return {
        ...state,
        evidence: {
          ...state.evidence,
          [action.payload.projectId]: action.payload.files,
        },
      };
    case 'ADD_EVIDENCE': {
      const existing = state.evidence[action.payload.projectId] || [];
      return {
        ...state,
        evidence: {
          ...state.evidence,
          [action.payload.projectId]: [...existing, action.payload.file],
        },
      };
    }
    case 'UPDATE_EVIDENCE': {
      const existing = state.evidence[action.payload.projectId] || [];
      return {
        ...state,
        evidence: {
          ...state.evidence,
          [action.payload.projectId]: existing.map((f) =>
            f.id === action.payload.file.id ? action.payload.file : f
          ),
        },
      };
    }
    case 'SET_MILESTONES':
      return {
        ...state,
        milestones: {
          ...state.milestones,
          [action.payload.projectId]: action.payload.milestones,
        },
      };
    case 'ADD_NOTIFICATION': {
      const notif: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        read: false,
      };
      return { ...state, notifications: [notif, ...state.notifications] };
    }
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getProject: (id: string) => Project | undefined;
  getEvidence: (projectId: string) => EvidenceFile[];
  getMilestones: (projectId: string) => TimelineMilestone[];
  notify: (type: Notification['type'], title: string, message?: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('interlace-app-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'HYDRATE', payload: parsed });
      } else {
        // Load demo data for first-time users
        dispatch({ type: 'LOGIN', payload: DEMO_USER });
        dispatch({ type: 'SET_PROJECTS', payload: DEMO_PROJECTS });
        dispatch({
          type: 'SET_EVIDENCE',
          payload: { projectId: DEMO_PROJECTS[0].id, files: DEMO_EVIDENCE },
        });
        dispatch({
          type: 'SET_MILESTONES',
          payload: { projectId: DEMO_PROJECTS[0].id, milestones: DEMO_MILESTONES },
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (state.isAuthenticated) {
      const toSave = {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        evidence: state.evidence,
        milestones: state.milestones,
        theme: state.theme,
      };
      localStorage.setItem('interlace-app-state', JSON.stringify(toSave));
    }
  }, [state]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Enforce credentials: admin@gmail.com / password123
    if (email.trim().toLowerCase() !== 'admin@gmail.com' || password !== 'password123') {
      return false;
    }

    const user: User = {
      ...DEMO_USER,
      email: 'admin@gmail.com',
      name: 'Admin User',
      role: 'admin',
    };
    dispatch({ type: 'LOGIN', payload: user });
    dispatch({ type: 'SET_PROJECTS', payload: DEMO_PROJECTS });
    dispatch({
      type: 'SET_EVIDENCE',
      payload: { projectId: DEMO_PROJECTS[0].id, files: DEMO_EVIDENCE },
    });
    dispatch({
      type: 'SET_MILESTONES',
      payload: { projectId: DEMO_PROJECTS[0].id, milestones: DEMO_MILESTONES },
    });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('interlace-app-state');
    dispatch({ type: 'LOGOUT' });
  };

  const getProject = (id: string) => state.projects.find((p) => p.id === id);

  const getEvidence = (projectId: string) => state.evidence[projectId] || [];

  const getMilestones = (projectId: string) => state.milestones[projectId] || [];

  const notify = (type: Notification['type'], title: string, message?: string) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type, title, message } });
  };

  return (
    <AppContext.Provider
      value={{ state, dispatch, login, logout, getProject, getEvidence, getMilestones, notify }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
