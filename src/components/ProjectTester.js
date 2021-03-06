import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProjectForm from './ProjectForm';
import Modal from './Modal';
import List from './List';
import AddMemberForm from './AddMemberForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import AddListForm from './AddListForm';
import { DragDropContext } from 'react-beautiful-dnd';

class Project extends React.Component {
  state = {
    id: '',
    isLoading: true,
    title: '',
    members: [],
    showAddMembers: false,
    newList: false,
    lists: [],
    listAction: false,
    isShowing: false,
  }

  async componentDidMount() {
    const projId = window.location.pathname.split('/')[3];

    // if (!id) return console.log('No Project Yet');
    try {
      const res = await axios.get(`https://issue-base-db.herokuapp.com/api/projects/${projId}`, {
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.token
        }
      })
      const data = await res.data;
      this.setState({
        id: projId,
        title: data.project.title,
        members: data.members,
        lists: data.lists,
        isLoading: false,
        listAction: false
      });
    } catch(e) {
      console.log(e);
    }
  }

  // async componentDidUpdate() {
  //   const projId = window.location.pathname.split('/')[3];
  //
  //   // if (!id) return console.log('No Project Yet');
  //   try {
  //     const res = await axios.get(`https://issue-base-db.herokuapp.com/api/projects/${projId}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'auth-token': localStorage.token
  //       }
  //     })
  //     const data = await res.data;
  //     this.setState({
  //       id: projId,
  //       title: data.project.title,
  //       members: data.members,
  //       lists: data.lists,
  //       isLoading: false,
  //       listAction: false
  //     });
  //   } catch(e) {
  //     console.log(e);
  //   }
  // }

  setTitle = (title) => {
    this.setState({
      title: title
    });
  }

  setListAction = (boolean) => {
    this.setState({
      listAction: boolean
    });
  }

  setNewList = (boolean) => {
    this.setState({
      newList: boolean
    });
  }

  toggle = () => {
    this.setState((prevState, props) => ({
      isShowing: !prevState.isShowing
    }));
  }

  deleteProject = () => {
    const { id } = this.state;
    axios.delete(`https://issue-base-db.herokuapp.com/api/projects/${id}/delete`, { data: {
      project_id: id,
    },
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.token
      }}
    )
    .then(function (response) {
      console.log(response);
      Swal.fire({
        position: 'top-end',
        title: 'Project Deleted',
        showConfirmButton: false,
        customClass: 'success',
        timer: 3000,
        width: 500
      });
      this.props.history.push('/app')
    })
    .catch(function (error) {
      const message = error.response || '';
      Swal.fire({
        position: 'top-end',
        title: message.data,
        showConfirmButton: false,
        timer: 3000,
        width: 500
      });
    })
  }

  toggleAddMembers = () => {
    this.setState((prevState, props) => ({
      showAddMembers: !prevState.showAddMembers
    }));
  }

  addList = () => {
    this.setState({
      newList: true
    });
    document.querySelector('.project-body').scrollLeft += 1000000;
  }

  onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    const { lists } = this.state;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = lists.filter(list => list._id === source.droppableId)[0];
    const finishColumn = lists.filter(list => list._id === destination.droppableId)[0];

    // reordering within one column
    if (startColumn._id === finishColumn._id) {
      const newCardIds = [...startColumn.card_ids];

      console.log(`moving from ${source.index} to ${destination.index}`);

      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const updatedColumn = {
        ...startColumn,
        card_ids: newCardIds,
      };

      const updatedLists = lists.map((item) => {
        if (item._id === startColumn._id) {
          return updatedColumn;
        } else {
          return item;
        }
      })


      console.log(updatedLists);
      this.setState({lists: updatedLists});
      console.log(this.state.lists);
      console.log(this.state);
      this.setListAction(true);


      // axios.put(`https://issue-base-db.herokuapp.com/api/lists/${startColumn._id}/edit`, {
      //   card_ids: newCardIds
      // },{
      // headers: {
      //   'Content-Type': 'application/json',
      //   'auth-token': localStorage.token
      // }
      // })
      // .then(function (response) {
      //   console.log(response);
      //   console.log(lists);
      //   // this.setState({rerender: !this.state.rerender});
      // })
      // .catch(function (error) {
      //  console.log(error)
      // });

    }
  }


  render() {

    const { isLoading, onDragEnd, deleteProject, addList, toggleAddMembers, props, setTitle, setNewList, setListAction, toggle } = this;
    const { id, title, members, showAddMembers, newList, lists, isShowing, listAction } = this.state;
    return (
      <div>

      <div className="project-container">
      {isLoading ? (<h3>Loading...</h3>) : (
        <div>
        <div className="project-header">
        <div id="project-section">
        <h2 className="project-title">{title}</h2>
        </div>
        <div id="project-section2">
        <div className="project-icons">
        <FontAwesomeIcon icon={faTrashAlt} className="project-actions" onClick={deleteProject} />
        <FontAwesomeIcon icon={faEdit} className="project-actions" onClick={toggle} />
        </div>
        <button className="add-list-button" onClick={addList}>+ add new list</button>
        <div className="member-container">
        {members.map((members, key) => (
          <div key={key} className="member-circle">
          <p>{members.first_name.substring(0,1)
          }{members.last_name.substring(0,1)}</p>
          </div>
        ))}
        <div className="add-member-container">
        <div className={`member-circle add-circle`}  onClick={toggleAddMembers}>
        <p className={showAddMembers ? 'close-add-members-form' : 'open-add-members-form'}>+</p>
        </div>
        <AddMemberForm
        showAddMembers={showAddMembers}
        toggleAddMembers={toggleAddMembers}
        projectId={id}
        />
        </div>
        </div>
        </div>
        </div>
        </div>
      )}
      <Modal
      isShowing={isShowing}
      hide={toggle}
      title={"Edit Project"}
      >
      <ProjectForm hide={toggle} routerProps={props} title={title} editMode={true} projectId={id} setTitle={setTitle} />
      </Modal>
      </div>
      <div className="project-body">
      <DragDropContext onDragEnd={onDragEnd}>
      {lists.map((list, key) =>(
        <List
        key={list._id}
        index={key}
        title={list.title}
        id={list._id}
        lists={lists}
        projectId={id}
        toggleListAction={setListAction}
        projListSize={lists.length}
        />
      ))}
       </DragDropContext>
      {newList ?
        <AddListForm
        showList={setNewList}
        projId={id}
        /> :  <div className="padded-section"></div>}
        </div>

        </div>
      )
  }
}

export default Project;
