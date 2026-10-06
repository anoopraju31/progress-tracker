import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TaskBreadcrumb {
  id: string;
  title: string;
}

export interface ModalContext {
  goalId: string;
  parentId?: string | null;
  taskToEdit?: {
    id: string;
    title: string;
    description?: string | null;
  } | null;
}

interface NavigationState {
  // Goal ID -> Array of task breadcrumbs (LIFO Stack)
  taskStacks: Record<string, TaskBreadcrumb[]>;
  // Goal ID -> Boolean expanded state
  expandedGoals: Record<string, boolean>;
  // Dialog modal states
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  modalContext: ModalContext | null;
}

const initialState: NavigationState = {
  taskStacks: {},
  expandedGoals: {},
  isAddModalOpen: false,
  isEditModalOpen: false,
  modalContext: null,
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    toggleAccordion: (state, action: PayloadAction<string>) => {
      const goalId = action.payload;
      state.expandedGoals[goalId] = !state.expandedGoals[goalId];
    },
    setAccordionExpanded: (
      state,
      action: PayloadAction<{ goalId: string; isExpanded: boolean }>
    ) => {
      state.expandedGoals[action.payload.goalId] = action.payload.isExpanded;
    },
    pushTaskContainer: (
      state,
      action: PayloadAction<{ goalId: string; task: TaskBreadcrumb }>
    ) => {
      const { goalId, task } = action.payload;
      if (!state.taskStacks[goalId]) {
        state.taskStacks[goalId] = [];
      }
      state.taskStacks[goalId].push(task);
      // Auto expand goal when drilling down
      state.expandedGoals[goalId] = true;
    },
    popTaskContainer: (state, action: PayloadAction<string>) => {
      const goalId = action.payload;
      if (state.taskStacks[goalId] && state.taskStacks[goalId].length > 0) {
        state.taskStacks[goalId].pop();
      }
    },
    jumpToStackLevel: (
      state,
      action: PayloadAction<{ goalId: string; index: number }>
    ) => {
      const { goalId, index } = action.payload;
      if (state.taskStacks[goalId]) {
        if (index === -1) {
          state.taskStacks[goalId] = [];
        } else {
          state.taskStacks[goalId] = state.taskStacks[goalId].slice(0, index + 1);
        }
      }
    },
    resetTaskContainer: (state, action: PayloadAction<string>) => {
      const goalId = action.payload;
      state.taskStacks[goalId] = [];
    },
    openAddTaskModal: (state, action: PayloadAction<ModalContext>) => {
      state.modalContext = action.payload;
      state.isAddModalOpen = true;
    },
    closeAddTaskModal: (state) => {
      state.isAddModalOpen = false;
      state.modalContext = null;
    },
    openEditTaskModal: (state, action: PayloadAction<ModalContext>) => {
      state.modalContext = action.payload;
      state.isEditModalOpen = true;
    },
    closeEditTaskModal: (state) => {
      state.isEditModalOpen = false;
      state.modalContext = null;
    },
  },
});

export const {
  toggleAccordion,
  setAccordionExpanded,
  pushTaskContainer,
  popTaskContainer,
  jumpToStackLevel,
  resetTaskContainer,
  openAddTaskModal,
  closeAddTaskModal,
  openEditTaskModal,
  closeEditTaskModal,
} = navigationSlice.actions;

export default navigationSlice.reducer;
