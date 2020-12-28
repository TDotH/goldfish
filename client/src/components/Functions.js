//Quick and dirty array for bin headers...change later to use actual dates
const dayArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//Used to help set background colors (Future, Past, Today)
const backColors = ["#e0e0e0", "#6D6D6D", "#7373CB"]

//Used to help set day header colors (Normal, Sunday, Saturday)
const dayColors = ["#FAFAFA", "#322acb", "#CA2934"];

//Generates a set of empty bins for the current month of the given date
export const generateBins = (today) => {

    var retBins = [];

    //Temp date to loop through
    let tempDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    //Loop thorugh the entire month for now
    let i = 1;
    while((tempDate.getMonth() % 12) !== (today.getMonth() + 1) % 12) {

        var backColor, dayColor;
        //Set background color
        if (tempDate.getDate() === today.getDate()) {
            backColor = backColors[2];
        } else if (tempDate.getDate() < today.getDate()) {
            backColor = backColors[1];
        } else {
            backColor = backColors[0];
        } 

        //Set day header colors
        switch (tempDate.getDay()) {
            case 0: 
                dayColor = dayColors[2]
            break;
            case 6: 
                dayColor = dayColors[1]
            break;
            default: 
                dayColor = dayColors[0]
            break;
        }

        retBins.push({
            _id: i,
            header: dayArray[tempDate.getDay()],
            date: (tempDate.getMonth() + 1) + '/' +tempDate.getDate(),
            cards: [],
            headerColor: dayColor,
            backingColor: backColor
        })
        i += 1;
        tempDate.setDate(tempDate.getDate() + 1);
    }

    return retBins;
}

//Will add the task ids from the task list to the given set of bins
export const populateBins = (taskList, bins) => {

    //Push the actual index of the given card
    for (let i = 0; i < (taskList.length); i++ ) {
        let tempBin = bins.find(x => x._id === taskList[i]._binId);
        //Check for undefined and null (to prevent dev error on reload)
        if ((typeof(tempBin) !== 'undefined') && tempBin !== null) {
            tempBin.cards.push(i);
        }
    }
}

//Reordering cards (when dragged within the same bin)
export const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
}

//Moves a card from one bin to another by copying the entire list array (bad)
export const moveCard = (list, source, dest) => {
        let result = [...list];

        //Grab a copy of the cards from each respective bin
        let sourceCards = result.find(x => x._id === parseInt(source.droppableId)).cards;
        let destCards = result.find(x => x._id === parseInt(dest.droppableId)).cards;

        //Remove card and put in new dest
        const [removed] = sourceCards.splice(source.index, 1);
        destCards.splice(dest.index, 0, removed);

        //Read new cards to bins
        result.find(x => x._id === parseInt(source.droppableId)).cards = sourceCards;
        result.find(x => x._id === parseInt(dest.droppableId)).cards = destCards;

    return result;
}

//Used when a brand new card is being added
export const addCard = (list, source, dest) => {
    let result = [...list];
    //Grab a copy of the cards from each respective bin
    let sourceCards = source.cards;
    let destCards = result.find(x => x._id === parseInt(dest.droppableId)).cards;

    //Remove card and put in new dest
    const [removed] = sourceCards.splice(0, 1);
    destCards.splice(dest.index, 0, removed);

    //Read new cards to bins
    result.find(x => x._id === parseInt(dest.droppableId)).cards = destCards;

    return result;
}

//Defaults when adding a new card
export const defaultCard = {
        "_id": -1,
        "_binId": -1,
        "name": "Default Task",
        "priority": 2,
        "due": "2015-02-12T09:32:19 +08:00",
        "location": "730 Pierrepont Street, Temperanceville, Guam, 3846",
        "comment": "Lorem elit non dolor fugiat eu non laborum do duis",
        "complete": false
}

//Ids for the other "bins"
export const otherBins = {
  "adderBin": "-1",
  "focusedBin": "-2"
}

export const extraBins = [
    //Adding bin
    {
        _id: -1,
        header: "None",
        cards: []
    },
    //Focus Bin
    {
        _id: -2,
        header: "Default Header",
        cards: []
    }
]

//Colors go from priority 1 -> 4 + "complete"
export const colors = ["#CA2934", "#F89406", "#EBEB13", "#20DB30", "rgb(122, 122, 122)"];

//An easing function for animating the scroll sliding
export const easeInOutQuad = (t, b, c, d) => {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

/*Animates the horizontal scrolling 
 * Distance is in pixels
 * Duration is in milliseconds
 * Direction is either -1 (for left) or 1 (for right)
 */
export const animateHorizontalScroll = (scrollObj, distance, duration, direction) => {
    let currentTime = 0, 
        increment = 10;

    const currentScrollDelta = scrollObj.getScrollLeft();

    //"Animates" the movement of the scroll by incremental changes, then callback
    var animateScroll = function(scrollbar) {
        currentTime += increment;
        let deltaPos = easeInOutQuad(currentTime, 0, distance, duration);
        scrollbar.scrollLeft(currentScrollDelta + direction * deltaPos);
        if(currentTime < duration) {
            window.requestAnimationFrame( function() { animateScroll(scrollbar); } );
        }
    }; 

    window.requestAnimationFrame( function() { animateScroll(scrollObj); } );
}