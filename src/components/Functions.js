import data from "../data.json";

//Quick and dirty array for bin headers...change later to use actual dates
const dayArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//Used to help set background colors (Future, Past, Today)
const backColors = ["#e0e0e0", "#6D6D6D", "#7373CB"]

//Used to help set day header colors (Normal, Sunday, Saturday)
const dayColors = ["#FAFAFA", "#322acb", "#CA2934"];

//Will create an array of bins for the current month, then use the information from taskList.json to populate the "cards" subarray
export const generateBins = () => {

    var retBins = [];

    //Date time stuff
    let today = new Date();

    //Temp date to loop through
    let tempDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    //Loop thorugh the entire month for now
    let i = 1;
    while((tempDate.getMonth() % 12) !== (today.getMonth() + 1) % 12) {

        //Set background color
        if (tempDate.getDate() === today.getDate()) {
            var backColor = backColors[2];
        } else if (tempDate.getDate() < today.getDate()) {
            var backColor = backColors[1];
        } else {
            var backColor = backColors[0];
        } 

        //Set day header colors
        switch (tempDate.getDay()) {
            case 0: 
                var dayColor = dayColors[2]
            break;
            case 6: 
                var dayColor = dayColors[1]
            break;
            default: 
                var dayColor = dayColors[0]
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

    //Push the actual index of the given card
    for (let i = 0; i < (data.length); i++ ) {
        let tempBin = retBins.find(x => x._id === parseInt(data[i]._binId));
        //Check for undefined and null (to prevent dev error on reload)
        if ((typeof(tempBin) !== 'undefined') && tempBin !== null) {
            tempBin.cards.push(i);
        }
    }

    return retBins;
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

//Getter to keep track of number of tasks (for id generation)
export const getTaskNum = () => {
    return data.length;
}

export const getData= () => {
    return data;
}

//Defaults when adding a new card
export const defaultCard = {
        "_id": "-1",
        "_binId": "-1",
        "name": "Default Task",
        "quad": 2,
        "prio": 22,
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


