import "../styles/Header.css";
import Card from "./Card"
import { Droppable } from "react-beautiful-dnd";

/* When adding a new card, assumes that the array passed will only contain ONE card 
 * (Mainly to prevent any visual glitches if more than one card is passed)
 */
function Header(props) {
    return (
        <div id="header-container">
            <h1>Goldfish</h1>
            <div>
            {(!props.isOpen) ? <button type="button" name="taskAdder" className="task-adder" onClick={props.openNewTask}>Add A New Task!</button> : 
                            <Droppable droppableId={props.adderBin._id.toString()} 
                                       type="bin"
                                       isDropDisabled={true}           
                            >
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    //style={{backgroundColor: provided.isDragging ? 'green' : 'lightblue'}}
                                    {...provided.droppableProps}
                                    className="adder-bin"
                                >
                                    {(props.adderBin.cards.length > 0) &&
                                    <Card key={props.cardList[props.adderBin.cards[0]]._id} 
                                          draggableId={props.cardList[props.adderBin.cards[0]]._id} 
                                          index={0} 
                                          cardInfo={props.cardList[props.adderBin.cards[0]]}
                                          handleCardEdit={props.handleCardEdit}
                                          finishTask={props.finishTask}
                                          deleteTask={props.deleteTask}
                                    /> 
                                    }   
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
            }
            </div>
        </div>
    );
}

export default Header;