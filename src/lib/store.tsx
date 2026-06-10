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
import { supabase, hasSupabaseConfig } from './supabase';

// ============================================================
// Case Conversion Helpers for Postgres (snake_case)
// ============================================================

function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj !== null && typeof obj === 'object') {
    const n: any = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      n[snakeKey] = camelToSnake(obj[key]);
    }
    return n;
  }
  return obj;
}

function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj !== null && typeof obj === 'object') {
    const n: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      n[camelKey] = snakeToCamel(obj[key]);
    }
    return n;
  }
  return obj;
}

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
  syncDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Helper notification dispatcher
  const notify = (type: Notification['type'], title: string, message?: string) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type, title, message } });
  };

  // Database fetch helper
  const syncDatabase = async () => {
    if (!hasSupabaseConfig) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      // Fetch projects
      const { data: dbProjects, error: projError } = await supabase
        .from('projects')
        .select('*');

      if (projError) throw projError;

      if (dbProjects && dbProjects.length > 0) {
        const camelProjects = snakeToCamel(dbProjects) as Project[];
        dispatch({ type: 'SET_PROJECTS', payload: camelProjects });
        
        // Set active project
        if (camelProjects[0]) {
          dispatch({ type: 'SET_ACTIVE_PROJECT', payload: camelProjects[0].id });
        }

        // Fetch evidence and milestones for each project
        for (const proj of camelProjects) {
          const { data: dbEvidence, error: evError } = await supabase
            .from('evidence_files')
            .select('*')
            .eq('project_id', proj.id);

          if (!evError && dbEvidence) {
            dispatch({
              type: 'SET_EVIDENCE',
              payload: { projectId: proj.id, files: snakeToCamel(dbEvidence) },
            });
          }

          const { data: dbMilestones, error: msError } = await supabase
            .from('timeline_milestones')
            .select('*')
            .eq('project_id', proj.id);

          if (!msError && dbMilestones) {
            dispatch({
              type: 'SET_MILESTONES',
              payload: { projectId: proj.id, milestones: snakeToCamel(dbMilestones) },
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Supabase Sync Failed:', err.message);
      notify(
        'warning',
        'Database Sync Failed',
        'Could not load tables. Please verify you executed supabase_schema.sql in your Supabase SQL Editor.'
      );
    }
  };

  // Load persisted state on mount
  useEffect(() => {
    const initData = async () => {
      try {
        if (hasSupabaseConfig) {
          const { data: session } = await supabase.auth.getSession();
          if (session.session?.user) {
            const user: User = {
              ...DEMO_USER,
              id: session.session.user.id,
              email: session.session.user.email || 'admin@gmail.com',
              name: 'Admin User',
              role: 'admin',
            };
            dispatch({ type: 'LOGIN', payload: user });
            await syncDatabase();
            return;
          }
        }

        // Fallback to localStorage / Demo Data
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
    };
    initData();
  }, []);

  // Persist state changes to localStorage (for fallback mode)
  useEffect(() => {
    if (state.isAuthenticated && !hasSupabaseConfig) {
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
    // Check credentials
    if (email.trim().toLowerCase() !== 'admin@gmail.com' || password !== 'password123') {
      return false;
    }

    if (hasSupabaseConfig) {
      try {
        // Try authenticating with Supabase auth (mock/auto-create if needed or check session)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@gmail.com',
          password: 'password123',
        });

        // If user doesn't exist, register them
        if (error && error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'admin@gmail.com',
            password: 'password123',
          });
          if (signUpError) throw signUpError;
          if (signUpData.user) {
            // Recurse to login
            return login(email, password);
          }
        } else if (error) {
          throw error;
        }

        if (data.user) {
          const user: User = {
            ...DEMO_USER,
            id: data.user.id,
            email: 'admin@gmail.com',
            name: 'Admin User',
            role: 'admin',
          };
          dispatch({ type: 'LOGIN', payload: user });
          
          // Sync schemas and tables
          await syncDatabase();
          return true;
        }
      } catch (err: any) {
        console.error('Supabase Auth error:', err.message);
        notify(
          'error',
          'Authentication Error',
          'Failed to authenticate with Supabase. Running local mode.'
        );
      }
    }

    // Local Mock Fallback login
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
    return true;
  };

  const logout = async () => {
    localStorage.removeItem('interlace-app-state');
    if (hasSupabaseConfig) {
      await supabase.auth.signOut();
    }
    dispatch({ type: 'LOGOUT' });
  };

  const getProject = (id: string) => state.projects.find((p) => p.id === id);

  const getEvidence = (projectId: string) => state.evidence[projectId] || [];

  const getMilestones = (projectId: string) => state.milestones[projectId] || [];

  // Override context dispatch to trigger database updates
  const customDispatch = async (action: Action) => {
    // Perform standard local reduction first for immediate UI responsiveness
    dispatch(action);

    if (!hasSupabaseConfig) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      if (action.type === 'ADD_PROJECT') {
        const snakeProj = camelToSnake(action.payload);
        snakeProj.user_id = session.session.user.id;
        const { error } = await supabase.from('projects').insert(snakeProj);
        if (error) throw error;
      } else if (action.type === 'UPDATE_PROJECT') {
        const { error } = await supabase
          .from('projects')
          .update(camelToSnake(action.payload))
          .eq('id', action.payload.id);
        if (error) throw error;
      } else if (action.type === 'UPDATE_EVIDENCE') {
        const file = action.payload.file;
        const { error } = await supabase
          .from('evidence_files')
          .update(camelToSnake(file))
          .eq('id', file.id);
        if (error) throw error;
      } else if (action.type === 'ADD_EVIDENCE') {
        const file = action.payload.file;
        const { error } = await supabase
          .from('evidence_files')
          .insert(camelToSnake(file));
        if (error) throw error;
      }
    } catch (err: any) {
      console.warn('Database Write Failed:', err.message);
      // Fail silently or notify on critical writes
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch: customDispatch,
        login,
        logout,
        getProject,
        getEvidence,
        getMilestones,
        notify,
        syncDatabase,
      }}
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
