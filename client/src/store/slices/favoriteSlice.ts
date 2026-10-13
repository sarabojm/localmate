import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoriteState {
  favoriteIds: string[];
}

const savedFavorites = localStorage.getItem('localmate_favorites');
const initialFavorites: string[] = savedFavorites ? JSON.parse(savedFavorites) : [];

const initialState: FavoriteState = {
  favoriteIds: initialFavorites,
};

export const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favoriteIds.includes(id)) {
        state.favoriteIds = state.favoriteIds.filter((favId) => favId !== id);
      } else {
        state.favoriteIds.push(id);
      }
      localStorage.setItem('localmate_favorites', JSON.stringify(state.favoriteIds));
    },
    clearFavorites: (state) => {
      state.favoriteIds = [];
      localStorage.removeItem('localmate_favorites');
    },
  },
});

export const { toggleFavorite, clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
