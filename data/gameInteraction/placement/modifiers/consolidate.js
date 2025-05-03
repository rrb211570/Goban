import { gobanStore } from "../../../../store/store";
import { updateAdj, updateStoneGroups } from "../../../../store/reducers/gamePlaySlice";
import { getSameColorNeighborGroups } from "./helpers";

let consolidate = (rootIndices) => {
    console.log('consolidate ' + rootIndices);
    let stoneGroups = gobanStore.getState().gamePlay.stoneGroups;

    let sameColorNeighborGroups = getSameColorNeighborGroups(rootIndices);
    let primaryGroupNumber = sameColorNeighborGroups[0];
    let consolidatedStones = [...stoneGroups.getStones(primaryGroupNumber)];

    for (let groupNumber of sameColorNeighborGroups) {
        if (groupNumber != primaryGroupNumber) {
            consolidateAdjMap(groupNumber, primaryGroupNumber); // consolidate adj
            consolidatedStones.push(...stoneGroups.getStones(groupNumber)); // consolidate stoneGroups
            stoneGroups.deleteStoneGroup(groupNumber);
        }
    }

    stoneGroups.setStoneGroup(primaryGroupNumber, [...consolidatedStones, rootIndices]);
    gobanStore.dispatch(updateStoneGroups({ stoneGroups }));
}

let consolidateAdjMap = (groupNumber, primaryGroupNumber) => {
    let adjMap = gobanStore.getState().gamePlay.adjMap;
    for (let [adj, adjArr] of adjMap.getAdjEntries()) {
        if (adjArr.includes(groupNumber)) {
            adjArr.splice(adjArr.indexOf(groupNumber), 1);
            if (!adjArr.includes(primaryGroupNumber)) adjArr.push(primaryGroupNumber);
            adjMap.setAdj(adj, adjArr);
        }
    }
    gobanStore.dispatch(updateAdj({ adjMap }));
}

export default consolidate;