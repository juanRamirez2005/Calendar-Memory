// src/app/navigation/types.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type TabParamList = {
  Calendar: undefined;
  Subjects: undefined;
  Tasks: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Semesters: undefined;
  SemesterHistory: { semesterId: string };
  SubjectDetail: { subjectId: string };
  TaskDetail: { taskId: string };
  // Modales de formulario (id ausente = crear)
  SemesterForm: { semesterId?: string };
  SubjectForm: { subjectId?: string };
  TaskForm: { taskId?: string; subjectId?: string; dueDate?: string };
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
