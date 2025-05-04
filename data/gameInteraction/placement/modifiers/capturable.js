import { gobanStore } from "../../../../store/store";
import { storeDeadStones, deleteStoneGroup, deletePlacedStone, updateAdj } from "../../../../store/reducers/gamePlaySlice";
import { getNeighborStones, getStoneGroupFromStone } from "./helpers";

let capturable = (capturingStoneIndices) => {
  let stoneGroups = gobanStore.getState().gamePlay.stoneGroups;
  let orphanedStoneGroupNumbers = getOrphanedStoneGroupNumber(capturingStoneIndices);
  if (orphanedStoneGroupNumbers.length > 0) { // has one or more group (to be captured)
    for (let orphanedStoneGroupNumber of orphanedStoneGroupNumbers) {
      let deadStones = stoneGroups.getStones(orphanedStoneGroupNumber);
      console.log(deadStones);
      deleteDeadStonesFromStoneGroupsAndPlacedStones(orphanedStoneGroupNumber, deadStones);
      console.log(stoneGroups);
      console.log(gobanStore.getState().gamePlay.placedStones);
      replaceDeadStonesWithAdj(deadStones, capturingStoneIndices);
      gobanStore.dispatch(storeDeadStones({deadStones}));
    }
    return true;
  }
  return false;
}

// 
let getOrphanedStoneGroupNumber = (capturingStoneIndices) => {
  let adjMap = gobanStore.getState().gamePlay.adjMap;
  let stoneGroupNumbers = [...gobanStore.getState().gamePlay.stoneGroups.getStoneGroupKeys()];
  let orphanedStoneGroupNumbers = [];
  for (let stoneGroupNumber of stoneGroupNumbers) {
    let totalExposedAdj = 0;
    for (let [indices, adjArr] of adjMap.getAdjEntries()) {
      if (adjArr.includes(stoneGroupNumber) && indices != capturingStoneIndices) totalExposedAdj++;
    }
    // turnColor (capturingStoneIndices color) = different color than stoneGroupNumber
    if (totalExposedAdj == 0 && !sameColorGroupAsTurn(stoneGroupNumber)) orphanedStoneGroupNumbers.push(stoneGroupNumber);
  }
  return orphanedStoneGroupNumbers;
}

let sameColorGroupAsTurn = (stoneGroupNumber) => {
  let stoneIDFromGroup = gobanStore.getState().gamePlay.stoneGroups.getStones(stoneGroupNumber)[0];
  let turn = gobanStore.getState().gamePlay.turn;
  let color = document.querySelector('#clickSquare_' + stoneIDFromGroup + ' use').getAttribute('href');
  console.log(color + '-----' + turn);
  if (color == '#plain-black-14.5-3' && turn == 'black') return true;
  else if (color == '#plain-white-14.5-2' && turn == 'white') return true;
  return false;
}

let deleteDeadStonesFromStoneGroupsAndPlacedStones = (orphanedStoneGroupNumber, deadStones) => {
  gobanStore.dispatch(deleteStoneGroup({ stoneGroup: orphanedStoneGroupNumber }));
  for (let stoneID of deadStones) gobanStore.dispatch(deletePlacedStone({ indices: stoneID }));
}

let replaceDeadStonesWithAdj = (deadStones, capturingStoneIndices) => {
  let adjMap = gobanStore.getState().gamePlay.adjMap;

  for (let deadStone of deadStones) {
    console.log(deadStone);
    let adjArr = [];
    let neighborStones = getNeighborStones(deadStone);
    document.querySelector('#clickSquare_' + deadStone + ' svg').style.display = 'none';
    document.querySelector('#clickSquare_' + deadStone + ' svg').style.opacity = '0.7';
    // we ignore this case, b/c addNeighborIndicesOfPlacedStone takes care of it
    if (neighborStones.includes(capturingStoneIndices)) continue;

    for (let neighborStone of neighborStones) {
      let groupNumber = getStoneGroupFromStone(neighborStone);
      if (!adjArr.includes(groupNumber)) adjArr.push(groupNumber);
    }
    if (adjArr.length != 0) adjMap.setAdj(deadStone, adjArr); // we could have a deadStone surrounded by deadStones, so we check for that
    document.querySelector('#clickSquare_' + deadStone + ' svg').style.display = 'none';
    document.querySelector('#clickSquare_' + deadStone + ' svg').style.opacity = '0.7';
    if (adjArr.length > 0) adjMap.setAdj(deadStone, adjArr);
  }
  gobanStore.dispatch(updateAdj({ adjMap }));
}

export default capturable;