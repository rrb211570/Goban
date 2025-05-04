import { createSlice } from '@reduxjs/toolkit';
import { StoneGroups, AdjMap } from '../../data/gameInteraction/gameInteraction.js';

export const gamePlaySlice = createSlice({
    name: 'gamePlay',
    initialState: {
        turn: 'black',
        boardLength: 9,
        placedStones: [],
        deadStones: [],
        stoneGroups: new StoneGroups(),
        adjMap: new AdjMap(),
        history: [{
            turn: 'black',
            placedStones: [],
            stoneGroups: new StoneGroups(),
            adjMap: new AdjMap(),
            deadStones: [],
        }],
        historyIndex: 0
    },
    reducers: {
        swapTurn(state) {
            if (state.turn == 'white') state.turn = 'black';
            else state.turn = 'white';
        },
        saveSnapshot(state, action) { // new placement
            console.log('saveSnapshot');
            let savedStoneGroups = new StoneGroups();
            let savedAdjMap = new AdjMap();
            for (const [key, value] of state.stoneGroups.getStoneGroupEntries()) {
                savedStoneGroups.setStoneGroup(key, value);
            }
            for (const [key, value] of state.adjMap.getAdjEntries()) {
                savedAdjMap.setAdj(key, value);
            }
            const snapshot = {
                turn: state.turn,
                placedStones: [...state.placedStones],
                stoneGroups: savedStoneGroups,
                adjMap: savedAdjMap,
                deadStones: [...state.deadStones],
            };
            // stored deadStones in snapshot, so we can clear for future captures
            state.deadStones = []; 
            // truncate future history if we are in the past
            state.history = [...[...state.history].slice(0, state.historyIndex + 1), snapshot];
            console.log(state.historyIndex);
            console.log(state.history[state.historyIndex].stoneGroups);
            state.historyIndex++;
            console.log(state.historyIndex);
            console.log(state.history[state.historyIndex].stoneGroups);
            console.log(state.history[state.historyIndex].placedStones);
        },
        undo(state) {
            console.log('undo');
            console.log(state.historyIndex);
            console.log(state.stoneGroups);
            console.log(state.history[state.historyIndex].stoneGroups);
            if (state.historyIndex > 0) {
                state.historyIndex--;
                console.log(state.historyIndex);
                console.log(state.history[state.historyIndex].stoneGroups);
                let savedStoneGroups = new StoneGroups();
                let savedAdjMap = new AdjMap();
                for (const [key, value] of state.history[state.historyIndex].stoneGroups.getStoneGroupEntries()) {
                    savedStoneGroups.setStoneGroup(key, value);
                }
                for (const [key, value] of state.history[state.historyIndex].adjMap.getAdjEntries()) {
                    savedAdjMap.setAdj(key, value);
                }
                state.turn = state.history[state.historyIndex].turn;
                state.placedStones = state.history[state.historyIndex].placedStones;
                state.stoneGroups = savedStoneGroups;
                state.adjMap = savedAdjMap;
                // Object.assign(state, snapshot);
                console.log(state.stoneGroups);
            }
            console.log(state.historyIndex);
            console.log(state.history.length);
            console.log(state.stoneGroups);
            console.log(state.adjMap);
            console.log([...state.placedStones]);
        },
        redo(state) {
            console.log('redo');
            if (state.historyIndex < state.history.length - 1) {
                state.historyIndex++;
                const snapshot = state.history[state.historyIndex];
                // might need to manually assign snapshot (see undo)
                Object.assign(state, snapshot);
            }
            console.log(state.historyIndex);
        },
        addPlacedStone(state, action) {
            state.placedStones = [...state.placedStones, action.payload.indices];
        },
        storeDeadStones(state, action) {
            state.deadStones = action.payload.deadStones;
        },
        deletePlacedStone(state, action) {
            state.placedStones = state.placedStones.filter((stone) => stone != action.payload.indices);
        },
        updateAdj(state, action) {
            state.adjMap = action.payload.adjMap;
        },
        deleteAdj(state, action) {
            let adjMap = state.adjMap;
            adjMap.deleteAdj(action.payload.indices);
            state.adjMap = adjMap;
        },
        deleteStoneGroup(state, action) {
            let stoneGroups = state.stoneGroups;
            stoneGroups.deleteStoneGroup(action.payload.stoneGroup);
            state.stoneGroups = stoneGroups;
        },
        updateStoneGroups(state, action) {
            state.stoneGroups = action.payload.stoneGroups;
        }
    }
});

export const { swapTurn, saveSnapshot, undo, redo, addPlacedStone,
    storeDeadStones, deletePlacedStone, updateAdj, deleteAdj,
    deleteStoneGroup, updateStoneGroups } = gamePlaySlice.actions;
export const getTurn = state => state.gamePlay.turn;
export const getBoardLength = state => state.gamePlay.boardLength;
export const getPlacedStones = state => state.gamePlay.placedStones;
export const getStoneGroups = state => state.gamePlay.stoneGroups;
export const getAdjMap = state => state.gamePlay.adjMap;

export default gamePlaySlice.reducer;