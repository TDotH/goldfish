import './styles/App.css';
import { Component } from 'react';
import { DragDropContext } from "react-beautiful-dnd";
import { Scrollbars } from 'react-custom-scrollbars'
import Bin from './components/Bin';
import Header from './components/Header';
import BinFocused from './components/BinFocused';

import * as taskFunctions from './components/Functions';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      cardList: [],
      bins: [],
      adderBin: [],
      focusedBin: [],
      showNewTask: false,
      showBinFocus: false,
      allowHorizontalScroll: true,
      isDragging: false,
      isScrolling: false
    };

    //Mount/bind events
    this.onBeforeCapture = this.onBeforeCapture.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.openNewTask = this.openNewTask.bind(this);
    this.closeNewTask = this.closeNewTask.bind(this);
    this.openFocusBin = this.openFocusBin.bind(this);
    this.closeFocusBin = this.closeFocusBin.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleScrollbarDrag = this.handleScrollbarDrag.bind(this);
    this.scrollToToday = this.scrollToToday.bind(this);
    this.onBinEnter = this.onBinEnter.bind(this); 
    this.onBinLeave = this.onBinLeave.bind(this); 
    this.handleCardEdit = this.handleCardEdit.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.finishTask = this.finishTask.bind(this);
  }

  //Called only once (after mounted onto DOM)
  componentDidMount() {
    const newBins = taskFunctions.generateBins();
    const newNum = taskFunctions.getTaskNum();
    const tempFocusBin = taskFunctions.extraBins[1];
    const newCardList = taskFunctions.getData();
    let tempAdderBin = taskFunctions.extraBins[0];
    let newCard = Object.assign({}, taskFunctions.defaultCard);

    newCard._id = (newNum + 1).toString();
    newCardList.push(newCard);
    tempAdderBin.cards.push(newNum);
    window.addEventListener('wheel', this.handleWheel);

    const today = new Date();

    this.setState({
      cardList: newCardList,
      bins: newBins,
      taskNum: newNum,
      adderBin: tempAdderBin,
      focusedBin: tempFocusBin,
      currentDate: today
    });
    
    //Need a reference to the scrollbar to pass 
    const scrollbar = this.Scrollbar;

    /*Makes sure that the current day is centered on first load
     *Used to ensure that the code is run AFTER everything is rendered
     */
    window.requestAnimationFrame(function() {
      const bin = document.getElementById('bin-container');
      const binStyle = bin.currentStyle || window.getComputedStyle(bin);

      //Try to scroll within one bin's width (to prevent visual jank)
      const elementWidth = bin.offsetWidth +
                (parseFloat(binStyle.marginLeft) + parseFloat(binStyle.marginRight));

      scrollbar.scrollLeft(today.getDate() * elementWidth - elementWidth*4);
    })
  }

  //Called if the component will be unmounted
  componentWillUnmount() {
    window.removeEventListener('wheel', this.handleWheel);
  }

   //Lock horizontal scrolling to prevent weird visual glitches
  onBeforeCapture(result) {
    this.setState ({
      allowHorizontalScroll: false,
      isDragging: true
    });
  }

  /* Documentation states that during dragging ALL updates to 
  * <Draggable />s need to be stopped, and that no changes to size can happen here
  * 
  */
  onDragStart(result) {

  }

  //TODO: Change if-else to a switch for perfomance
  //After a drag is finished
  onDragEnd(result) {
    //Dropped outside a bin, also ignore if the user is trying to move within the "adder bin"
    if (!result.destination || result.destination.droppableId === taskFunctions.otherBins.adderBin) {
      this.setState ({
        allowHorizontalScroll: true,
        isDragging: false
      });
      return;
    }

    //The card is being moved around the same bin
    if(result.source.droppableId === result.destination.droppableId) {
      //Creates a copy of the entire task list to change a sublist...really bad 
      let newBins = [...this.state.bins];
      let newScroll = false;

      //If the card is being reordered around the focus bin...pretend that the actual bin is being reordered
      if(result.source.droppableId === taskFunctions.otherBins.focusedBin) {
        newBins.find(x => x._id === parseInt(this.state.focusedBin._id)).cards =
        taskFunctions.reorder(this.state.bins.find(x => x._id === parseInt(this.state.focusedBin._id)).cards,  result.source.index, result.destination.index);  
      } else { 
        newBins.find(x => x._id === parseInt(result.destination.droppableId)).cards =
        taskFunctions.reorder(this.state.bins.find(x => x._id === parseInt(result.destination.droppableId)).cards,  result.source.index, result.destination.index);
        newScroll = true;
      }

      this.setState ({
        bins: newBins,
        allowHorizontalScroll: newScroll,
        isDragging: false
      });
      return;
    }

    //The user is adding a new card
    else if(result.source.droppableId === taskFunctions.otherBins.adderBin) {
      //Add the new card to whatever bin
      const tempAdderBin = this.state.adderBin;
      let newBins = [];
      let newScroll = false;

      //Check if the bin being added to is the focus bin (if it is, pretend it's the actual bin)
      if(result.destination.droppableId === taskFunctions.otherBins.focusedBin) {
        result.destination.droppableId = this.state.focusedBin._id;
        newBins = taskFunctions.addCard(this.state.bins, tempAdderBin, result.destination);
      } else {
        newBins = taskFunctions.addCard(this.state.bins, tempAdderBin, result.destination);
        newScroll = true;
      }
      this.closeNewTask();

      //Increment the number of tasks
      const newTaskNum = this.state.taskNum + 1;

      //Create a brand new card
      var newCard = Object.assign({}, taskFunctions.defaultCard);
      newCard._id = (newTaskNum + 1).toString();
      let newCardList = this.state.cardList;

      newCardList.push(newCard);
      tempAdderBin.cards.push(newTaskNum);

      //Update the bin id of the newly added card
      newCardList[this.state.taskNum]._binId = result.destination.droppableId;

      //Set the new bin state
      this.setState ({
        cardList: newCardList,
        bins: newBins,
        adderBin: tempAdderBin,
        taskNum: newTaskNum,
        allowHorizontalScroll: newScroll,
        isDragging: false
      });
      return;
    }
    //The card is being moved to a new bin...makes three copies which is not ideal
    else {
      const newBins = taskFunctions.moveCard(this.state.bins, result.source, result.destination);

      //Update the bin id of the card
      let newCardList = this.state.cardList;
      newCardList.find(x => x._id === result.draggableId)._binId = result.destination.droppableId;

      this.setState ({
        cardList: newCardList,
        bins: newBins,
        allowHorizontalScroll: true,
        isDragging: false
      });
      return;
    }
  }

  //Handles scrolling for the horizontal bin holding div
  handleWheel(e) {

    //First, check if the user isn't dragging
    if (this.state.allowHorizontalScroll === true) {

        //Second, check if the scrolling timer has timed out
        if ( this.state.isScrolling === false ) {
          const bin = document.getElementById('bin-container');
          const binStyle = bin.currentStyle || window.getComputedStyle(bin);

          //Try to scroll within one bin's width (to prevent visual jank)
          const elementWidth = bin.offsetWidth +
                    (parseFloat(binStyle.marginLeft) + parseFloat(binStyle.marginRight));

          const duration = 200;

          this.setState({
            isScrolling: true
          });

          //Set the timer to prevent the user from scrolling (temp fix for visual jank)
          setTimeout( () => {
            this.setState({
              isScrolling: false
            });
          }, (duration + duration/2 + 50));

          taskFunctions.animateHorizontalScroll(this.Scrollbar, elementWidth, duration, (e.deltaY / Math.abs(e.deltaY)));
      }
    }
 }

  //Scrolls to the curent day
  scrollToToday(e) {

    if ( this.state.isScrolling === false ) {

      const bin = document.getElementById('bin-container');
      const binStyle = bin.currentStyle || window.getComputedStyle(bin);

      //Try to scroll within one bin's width (to prevent visual jank)
      const elementWidth = bin.offsetWidth +
                (parseFloat(binStyle.marginLeft) + parseFloat(binStyle.marginRight));

      //Get the current position of the MIDDLE bin (3 is three bins past the leftmost bin)
      const currentMiddleBin = this.Scrollbar.getScrollLeft() + elementWidth * 3;

      //Calculate the absolute position of the "current day" bin
      const todayBin = (this.state.currentDate.getDate() * elementWidth) - elementWidth;

      //Calculate the distance needed to move 
      const distance = todayBin - currentMiddleBin;

      //Duration is in milliseconds
      const duration = 400;

      this.setState({
        isScrolling: true
      });

      //Set the timer to prevent the user from scrolling (temp fix for visual jank)
      setTimeout( () => {
        this.setState({
          isScrolling: false
        });
      }, (duration + duration/2 + 50));
      
      taskFunctions.animateHorizontalScroll(this.Scrollbar, Math.abs(distance), duration, Math.sign(distance));
    }
  }
  
  //Snaps to the nearest bin on drag end (mainly for scrollbar dragging)
  handleScrollbarDrag() {

    if ( this.state.isScrolling === false ) {
      const bin = document.getElementById('bin-container');
      const binStyle = bin.currentStyle || window.getComputedStyle(bin);

      //Try to scroll within one bin's width (to prevent visual jank)
      const elementWidth = bin.offsetWidth +
                (parseFloat(binStyle.marginLeft) + parseFloat(binStyle.marginRight));

      //Calculate the distance to the nearest bin
      const closestBin = this.Scrollbar.getScrollLeft() % elementWidth;

      if ( closestBin > 0 ) {

        //Time is in milliseconds
        const snapTimer = 30;
        const duration = 200;

        let distance = -1;
        if ( closestBin > elementWidth/2 ) {
          distance = elementWidth - closestBin;
        } else {
          distance = -closestBin;
        }

        this.setState({
          isScrolling: true
        });

        setTimeout( () => {
          taskFunctions.animateHorizontalScroll(this.Scrollbar, Math.abs(distance), duration, Math.sign(distance));
          }, snapTimer);

        //Set the timer to prevent the user from scrolling (temp fix for visual jank)
        setTimeout( () => {
          this.setState({
            isScrolling: false
          });
        }, (snapTimer + duration + duration/2));

      }
    }
  }

  //A new task is being added
  addTask() {
    const newNum = this.state.taskNum + 1;
    this.setState ({
      taskNum: newNum
    })
  }

  openNewTask() {
    this.setState({
      showNewTask: true
    })
  }

  closeNewTask() {
    this.setState({
      showNewTask: false
    })
  }

  openFocusBin(binId) {
    const newFocus = this.state.bins[binId - 1];
    this.setState({
      showBinFocus: true,
      focusedBin: newFocus,
      allowHorizontalScroll: false
    })
  }

  closeFocusBin() {
    const tempFocusBin = taskFunctions.extraBins[1];
    this.setState({
      showBinFocus: false,
      focusedBin: tempFocusBin,
      allowHorizontalScroll: true
    })
  }

  onBinEnter(e) {
    this.setState ({
      allowHorizontalScroll: false
    });
  }

  //Keep preventing the user from scrolling if they're dragging 
  onBinLeave(e) {
    if (!this.state.isDragging) {
      this.setState ({
        allowHorizontalScroll: true
      });
    }
  }

  //Is called when a handle change event is called on a card (a card is being edited)
  handleCardEdit(cardId, targetName, targetValue) {

    let newList = this.state.cardList;
    let newCard = newList.find(x => x._id === cardId);
    
    switch (targetName.className) {

      case 'headerLabel':
        newCard.name = targetValue;
        break;

      case 'priority':
        newCard.quad = targetValue;
        break;

      default:
        //Shouldn't be here!
        break;
    }

    this.setState({
      cardList: newList
    })
  }

  /* Delete a given task 
   * DOES NOT actually fully remove from card list (which is handled on save/when unmounted from the DOM)
   */ 
  deleteTask(cardId, binId, cardIndex) {

    //Ignore if the card is a new card being added
    if (cardId !== (this.state.taskNum + 1).toString()) {
      //First remove the reference from the bin
      let tempBins = this.state.bins;
      let tempCards = tempBins.find(x => x._id === parseInt(binId)).cards;
      tempCards.splice(cardIndex, 1);
      tempBins.find(x => x._id === parseInt(binId)).cards = tempCards;

      this.setState({
        bins: tempBins
      })
    }
  }

  //Sets a set task to "complete" (and quad 5)
  finishTask(cardId) {

    //Ignore if the card is a new card being added
    if (cardId !== (this.state.taskNum + 1).toString()) {
      let tempCardList = this.state.cardList;
      let tempCard = tempCardList.find(x => x._id === cardId);
      tempCard.complete = !tempCard.complete;

      this.setState({
        cardList: tempCardList
      })
    }
  }

  render() { 
    return (
      <DragDropContext
      onDragEnd={this.onDragEnd}
      onBeforeCapture={this.onBeforeCapture}

      >
        <div>
        <Header newCardId={this.state.taskNum + 1}
                isOpen={this.state.showNewTask} 
                openNewTask={this.openNewTask}
                closeNewTask={this.closeNewTask}
                adderBin={this.state.adderBin}
                cardList={this.state.cardList}
                handleCardEdit={this.handleCardEdit}
                finishTask={this.finishTask}
                deleteTask={this.deleteTask}
        />
        </div>
        <div className="App">
            <Scrollbars id="Scrollbar"
              ref={ (Scrollbar) => {this.Scrollbar = Scrollbar;} }
              autoHeight={true}
              autoHeightMax={1000}
              onWheel={this.handleWheel}
              onScrollStop={this.handleScrollbarDrag}
              renderTrackHorizontal={props => <div {...props} className="track-horizontal" 
                                               style={(this.state.allowHorizontalScroll) ? {backgroundColor: 'rgba(49, 49, 49, 0.3)'} :
                                                      {backgroundColor: 'rgba(49, 49, 49, 0.5)'}}
                                               />}
              renderThumbHorizontal={props => <div {...props} style={(this.state.allowHorizontalScroll) ? {backgroundColor: '#f89406'} :
                                                                     {backgroundColor: '#f2784b'}}
                                              className="thumb-horizontal"
                                              />}  
              renderView={props => <div {...props} className="view"/>}
            >
              {this.state.bins.map((bin, index) => (
                <Bin header={bin.header} 
                    date={bin.date}
                    binId = {bin._id}
                    key={bin._id} 
                    droppableId={bin._id} 
                    backColor={bin.backingColor}
                    dayColor={bin.headerColor}
                    cards={bin.cards}
                    isDisabled={this.state.showBinFocus}  
                    openFocusBin={this.openFocusBin} 
                    cardList={this.state.cardList}
                    onBinEnter={this.onBinEnter}
                    onBinLeave={this.onBinLeave}
                    handleCardEdit={this.handleCardEdit}
                    finishTask={this.finishTask}
                    deleteTask={this.deleteTask}
                />
            ))}
          </Scrollbars>
          <div>
            <BinFocused droppableId={taskFunctions.otherBins.focusedBin}
                        isOpen={this.state.showBinFocus}
                        closeMaker={this.closeFocusBin}
                        focusedBin={this.state.focusedBin}
                        cardList={this.state.cardList}
                        handleCardEdit={this.handleCardEdit}
                        finishTask={this.finishTask}
                        deleteTask={this.deleteTask}
            />
          </div>
          <div className="Today-Container">
            <button type="button" className="Today-button" onClick={this.scrollToToday}>
              Move to Today</button>
          </div>
        </div>
      </DragDropContext>
    );
  }
}

export default App;
